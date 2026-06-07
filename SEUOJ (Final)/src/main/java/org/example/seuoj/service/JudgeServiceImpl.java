package org.example.seuoj.service;

import org.example.seuoj.model.Language;
import org.example.seuoj.model.Submission;
import org.example.seuoj.model.SubmissionStatus;
import org.example.seuoj.model.TestCase;
import org.example.seuoj.payload.Submission.RunResultDTO;
import org.example.seuoj.repositories.SubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.List;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
public class JudgeServiceImpl implements JudgeService {
    private static final Logger logger = LoggerFactory.getLogger(JudgeServiceImpl.class);

    @Autowired
    private SubmissionRepository submissionRepository;

    // User submits code
    // ↓
    // Create a sandbox folder (temp workspace)
    // ↓
    // Write code to a file
    // ↓
    // Compile the code (C++/Java)
    // ↓
    // Run against each test case
    // ↓
    // Compare output with expected
    // ↓
    // Return result + cleanup sandbox

    @Override
    public void execute(Submission submission, List<TestCase> testCases) {
        if (testCases == null || testCases.isEmpty()) {
            submission.setStatus(SubmissionStatus.ACCEPTED);
            submission.setExecutionTimeMs(0);
            submission.setMemoryUsedKb(0);
            submissionRepository.save(submission);
            return;
        }

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("seuoj_sandbox_");
            logger.info("[Judge] Sandbox created at {} for submission {}", tempDir, submission.getSubmissionId());

            Language lang = submission.getLanguage();
            String code = submission.getCode();

            // For Java, the filename must match the public class name
            String className = extractJavaClassName(code, lang);

            // Write source file
            String sourceFilename = getSourceFilename(lang, className);
            Files.writeString(tempDir.resolve(sourceFilename), code, StandardCharsets.UTF_8);

            // --- Compilation Stage ---
            CompileResult compileResult = compileCode(lang, tempDir, sourceFilename);
            if (!compileResult.success) {
                logger.warn("[Judge] Compilation FAILED for submission {}: {}", submission.getSubmissionId(),
                        compileResult.errorOutput);
                submission.setStatus(SubmissionStatus.COMPILATION_ERROR);
                submission.setErrorMessage(compileResult.errorOutput);
                submission.setExecutionTimeMs(0);
                submission.setMemoryUsedKb(0);
                submissionRepository.save(submission);
                return;
            }

            // --- Execution Stage ---
            SubmissionStatus finalStatus = SubmissionStatus.ACCEPTED;
            String finalErrorMessage = null;
            int maxTimeMs = 0;

            long timeLimitMs = submission.getProblem().getTimeLimitMs() != null
                    ? submission.getProblem().getTimeLimitMs()
                    : 2000L;

            for (int i = 0; i < testCases.size(); i++) {
                TestCase tc = testCases.get(i);
                String input = tc.getInput() != null ? tc.getInput() : "";
                String expected = tc.getExpectedOutput() != null ? tc.getExpectedOutput() : "";

                logger.info("[Judge] Running testcase {}/{} for submission {}", i + 1, testCases.size(),
                        submission.getSubmissionId());

                RunResult result = runProcess(lang, tempDir, className, input, timeLimitMs);

                maxTimeMs = Math.max(maxTimeMs, (int) result.wallTimeMs);

                if (result.status == RunStatus.TIMEOUT) {
                    finalStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
                    finalErrorMessage = String.format("Time Limit Exceeded on testcase %d (limit: %d ms)", i + 1,
                            timeLimitMs);
                    break;
                }

                if (result.status == RunStatus.RUNTIME_ERROR) {
                    finalStatus = SubmissionStatus.RUNTIME_ERROR;
                    finalErrorMessage = "Runtime Error on testcase " + (i + 1) + ":\n" + result.stderr.trim();
                    break;
                }

                if (!compareOutputs(result.stdout, expected)) {
                    finalStatus = SubmissionStatus.WRONG_ANSWER;
                    finalErrorMessage = String.format(
                            "Wrong Answer on testcase %d\nInput:\n%s\nExpected:\n%s\nGot:\n%s",
                            i + 1, input.trim(), expected.trim(), result.stdout.trim());
                    break;
                }
            }

            logger.info("[Judge] Submission {} evaluated: {} in {}ms", submission.getSubmissionId(), finalStatus,
                    maxTimeMs);

            submission.setStatus(finalStatus);
            submission.setExecutionTimeMs(maxTimeMs);
            submission.setMemoryUsedKb(estimateMemoryKb(lang));
            submission.setErrorMessage(finalErrorMessage);
            submissionRepository.save(submission);

        } catch (Exception e) {
            logger.error("[Judge] Unexpected error for submission {}", submission.getSubmissionId(), e);
            submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
            submission.setErrorMessage("Internal judge error: " + e.getMessage());
            submissionRepository.save(submission);
        } finally {
            if (tempDir != null) {
                deleteSandbox(tempDir);
            }
        }
    }

    // ------------------------------------------------------------------ //
    // Compilation
    // ------------------------------------------------------------------ //

    private CompileResult compileCode(Language lang, Path sandboxDir, String sourceFilename)
            throws IOException, InterruptedException {
        if (lang == Language.PYTHON) {
            // Python: syntax-check only via `python3 -m py_compile`
            ProcessBuilder pb = new ProcessBuilder("python3", "-m", "py_compile", sourceFilename);
            pb.directory(sandboxDir.toFile());
            RunResult r = drainAndWait(pb.start(), "", 10_000);
            if (r.status == RunStatus.RUNTIME_ERROR && !r.stderr.isEmpty()) {
                return new CompileResult(false, r.stderr);
            }
            return new CompileResult(true, "");
        }

        ProcessBuilder pb;
        if (lang == Language.CPP) {
            pb = new ProcessBuilder("g++", "-std=c++17", "-O2", "-o", "solution", sourceFilename);
        } else if (lang == Language.JAVA) {
            pb = new ProcessBuilder("javac", "-encoding", "UTF-8", sourceFilename);
        } else {
            return new CompileResult(false, "Unsupported language: " + lang);
        }

        pb.directory(sandboxDir.toFile());
        Process proc = pb.start();

        // Drain stdout/stderr concurrently to avoid deadlock
        RunResult r = drainAndWait(proc, "", 15_000);

        if (r.status == RunStatus.TIMEOUT) {
            proc.destroyForcibly();
            return new CompileResult(false, "Compilation timed out after 15 seconds.");
        }

        if (proc.exitValue() != 0) {
            return new CompileResult(false, r.stderr.isEmpty() ? r.stdout : r.stderr);
        }

        return new CompileResult(true, "");
    }

    // ------------------------------------------------------------------ //
    // Process execution with concurrent I/O draining
    // ------------------------------------------------------------------ //

    private RunResult runProcess(Language lang, Path sandboxDir, String className,
            String input, long timeLimitMs) {
        ProcessBuilder pb;
        if (lang == Language.CPP) {
            pb = new ProcessBuilder("./solution");
        } else if (lang == Language.JAVA) {
            pb = new ProcessBuilder("java", "-cp", ".", "-Xss8m", "-Xmx256m", className);
        } else if (lang == Language.PYTHON) {
            pb = new ProcessBuilder("python3", "-u", "solution.py");
        } else {
            return new RunResult(RunStatus.RUNTIME_ERROR, "", "Unsupported language.", 0);
        }

        pb.directory(sandboxDir.toFile());

        Process proc = null;
        long startNs = System.nanoTime();
        try {
            proc = pb.start();

            // Write stdin (close the stream to signal EOF to the child process)
            try (OutputStream stdin = proc.getOutputStream()) {
                stdin.write(input.getBytes(StandardCharsets.UTF_8));
                stdin.flush();
            }

            return drainAndWait(proc, input, timeLimitMs);

        } catch (Exception e) {
            if (proc != null)
                proc.destroyForcibly();
            long wallMs = (System.nanoTime() - startNs) / 1_000_000;
            return new RunResult(RunStatus.RUNTIME_ERROR, "", "Process launch error: " + e.getMessage(), wallMs);
        }
    }

    /**
     * Drains stdout and stderr in parallel background threads while waiting
     * for the process to finish within {@code timeLimitMs}. Reading streams
     * concurrently is essential — if output fills the OS pipe buffer before
     * we read it, the child process blocks and the judge deadlocks.
     */
    private RunResult drainAndWait(Process proc, String ignoredInput, long timeLimitMs) {
        long startNs = System.nanoTime();
        ExecutorService pool = Executors.newFixedThreadPool(2);

        Future<String> stdoutFuture = pool.submit(() -> readFully(proc.getInputStream()));
        Future<String> stderrFuture = pool.submit(() -> readFully(proc.getErrorStream()));

        try {
            boolean finished = proc.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
            long wallMs = (System.nanoTime() - startNs) / 1_000_000;

            if (!finished) {
                proc.destroyForcibly();
                pool.shutdownNow();
                return new RunResult(RunStatus.TIMEOUT, "", "Time Limit Exceeded", wallMs);
            }

            String stdout = getQuietly(stdoutFuture);
            String stderr = getQuietly(stderrFuture);
            pool.shutdown();

            if (proc.exitValue() != 0) {
                return new RunResult(RunStatus.RUNTIME_ERROR, stdout, stderr, wallMs);
            }
            return new RunResult(RunStatus.SUCCESS, stdout, stderr, wallMs);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            proc.destroyForcibly();
            pool.shutdownNow();
            return new RunResult(RunStatus.RUNTIME_ERROR, "", "Judge interrupted.", 0);
        }
    }

    // ------------------------------------------------------------------ //
    // Output comparison
    // ------------------------------------------------------------------ //

    private boolean compareOutputs(String actual, String expected) {
        String normActual = actual.replace("\r\n", "\n").trim();
        String normExpected = expected.replace("\r\n", "\n").trim();

        String[] aLines = normActual.isEmpty() ? new String[0] : normActual.split("\n");
        String[] eLines = normExpected.isEmpty() ? new String[0] : normExpected.split("\n");

        if (aLines.length != eLines.length)
            return false;

        for (int i = 0; i < aLines.length; i++) {
            if (!aLines[i].trim().equals(eLines[i].trim()))
                return false;
        }
        return true;
    }

    // ------------------------------------------------------------------ //
    // Helpers
    // ------------------------------------------------------------------ //

    private String extractJavaClassName(String code, Language lang) {
        if (lang != Language.JAVA)
            return "Solution";
        Matcher m = Pattern.compile("public\\s+class\\s+(\\w+)").matcher(code);
        return m.find() ? m.group(1) : "Solution";
    }

    private String getSourceFilename(Language lang, String className) {
        switch (lang) {
            case CPP:
                return "solution.cpp";
            case JAVA:
                return className + ".java";
            case PYTHON:
                return "solution.py";
            default:
                return "solution.txt";
        }
    }

    /**
     * Rough memory estimate per language (real measurement would require
     * /proc/PID/status)
     */
    private int estimateMemoryKb(Language lang) {
        switch (lang) {
            case CPP:
                return 3_200;
            case JAVA:
                return 24_000;
            case PYTHON:
                return 8_500;
            default:
                return 5_000;
        }
    }

    private String readFully(InputStream is) {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append('\n');
            }
        } catch (IOException e) {
            // Stream closed — normal at process termination
        }
        return sb.toString();
    }

    private String getQuietly(Future<String> f) {
        try {
            return f.get(2, TimeUnit.SECONDS);
        } catch (Exception e) {
            return "";
        }
    }

    private void deleteSandbox(Path dir) {
        try {
            Files.walk(dir)
                    .sorted(java.util.Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(f -> {
                        if (!f.delete())
                            f.deleteOnExit();
                    });
        } catch (Exception e) {
            logger.warn("[Judge] Failed to clean sandbox {}: {}", dir, e.getMessage());
        }
    }

    // ------------------------------------------------------------------ //
    // Inner result types
    // ------------------------------------------------------------------ //

    private enum RunStatus {
        SUCCESS, TIMEOUT, RUNTIME_ERROR
    }

    private static class RunResult {
        final RunStatus status;
        final String stdout;
        final String stderr;
        final long wallTimeMs;

        RunResult(RunStatus status, String stdout, String stderr, long wallTimeMs) {
            this.status = status;
            this.stdout = stdout;
            this.stderr = stderr;
            this.wallTimeMs = wallTimeMs;
        }
    }

    private static class CompileResult {
        final boolean success;
        final String errorOutput;

        CompileResult(boolean success, String errorOutput) {
            this.success = success;
            this.errorOutput = errorOutput;
        }
    }

    // ------------------------------------------------------------------ //
    // Single Execution (Run without saving to DB)
    // ------------------------------------------------------------------ //

    @Override
    public RunResultDTO run(String code, Language language, String stdin, long timeLimitMs) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("seuoj_sandbox_run_");
            logger.info("[Judge] Sandbox created at {} for run", tempDir);

            String className = extractJavaClassName(code, language);
            String sourceFilename = getSourceFilename(language, className);
            Files.writeString(tempDir.resolve(sourceFilename), code, StandardCharsets.UTF_8);

            // Compilation Stage
            CompileResult compileResult = compileCode(language, tempDir, sourceFilename);
            if (!compileResult.success) {
                return new RunResultDTO("COMPILATION_ERROR", "", compileResult.errorOutput, 0);
            }

            // Execution Stage
            RunResult result = runProcess(language, tempDir, className, stdin, timeLimitMs);

            String status = "SUCCESS";
            if (result.status == RunStatus.TIMEOUT) {
                status = "TIMEOUT";
            } else if (result.status == RunStatus.RUNTIME_ERROR) {
                status = "RUNTIME_ERROR";
            }

            return new RunResultDTO(status, result.stdout, result.stderr, result.wallTimeMs);

        } catch (Exception e) {
            logger.error("[Judge] Unexpected error during run", e);
            return new RunResultDTO("RUNTIME_ERROR", "", "Internal judge error: " + e.getMessage(), 0);
        } finally {
            if (tempDir != null) {
                deleteSandbox(tempDir);
            }
        }
    }
}
