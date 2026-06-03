package org.example.seuoj.controller;

import jakarta.validation.Valid;
import org.example.seuoj.Configuration.AppConstants;
import org.example.seuoj.model.Difficulty;
import org.example.seuoj.model.ReportReason;
import org.example.seuoj.model.SubmissionStatus;
import org.example.seuoj.payload.Problem.ProblemDetailDTO;
import org.example.seuoj.payload.Problem.ProblemResponse;
import org.example.seuoj.payload.Report.ProblemReportDTO;
import org.example.seuoj.payload.Submission.SubmissionDTO;
import org.example.seuoj.payload.Submission.SubmissionDetailDTO;
import org.example.seuoj.payload.Submission.SubmissionRequest;
import org.example.seuoj.payload.Submission.SubmissionResponse;
import org.example.seuoj.service.ProblemService;
import org.example.seuoj.service.ReportService;
import org.example.seuoj.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProblemController {

    @Autowired
    private ProblemService problemService;

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private org.example.seuoj.service.JudgeService judgeService;

    @Autowired
    private org.example.seuoj.service.AsyncJudgeExecutor asyncJudgeExecutor;

    // Problems
    @GetMapping("/problems")
    public ResponseEntity<ProblemResponse> getAllProblems(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PROBLEMS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "difficulty", required = false) Difficulty difficulty,
            Authentication authentication
    ) {
        String currentUsername = authentication != null ? authentication.getName() : null;
        ProblemResponse response = problemService.getAllProblems(pageNumber, pageSize, sortBy, sortOrder, search, difficulty, currentUsername);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/problems/{problemId}")
    public ResponseEntity<ProblemDetailDTO> getProblemById(@PathVariable Long problemId) {
        ProblemDetailDTO detail = problemService.getProblemById(problemId);
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/problems")
    public ResponseEntity<ProblemDetailDTO> proposeProblem(
            @Valid @RequestBody ProblemDetailDTO problemDTO,
            Authentication authentication
    ) {
        ProblemDetailDTO proposed = problemService.proposeProblem(problemDTO, authentication.getName());
        return new ResponseEntity<>(proposed, HttpStatus.CREATED);
    }

    // Execution without saving
    @PostMapping("/run")
    public ResponseEntity<org.example.seuoj.payload.Submission.RunResultDTO> runCode(
            @Valid @RequestBody org.example.seuoj.payload.Submission.RunRequest request
    ) {
        org.example.seuoj.payload.Submission.RunResultDTO result = judgeService.run(
                request.getCode(),
                request.getLanguage(),
                request.getStdin() != null ? request.getStdin() : "",
                2000L
        );
        return ResponseEntity.ok(result);
    }

    // Submissions
    @PostMapping("/problems/{problemId}/submit")
    public ResponseEntity<SubmissionDTO> submitCode(
            @PathVariable Long problemId,
            @Valid @RequestBody SubmissionRequest request,
            Authentication authentication
    ) {
        request.setProblemId(problemId);
        SubmissionDTO dto = submissionService.submitCode(request, authentication.getName());
        // Trigger async judging in background — returns immediately with PENDING
        asyncJudgeExecutor.executeAsync(dto.getSubmissionId());
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping("/submissions")
    public ResponseEntity<SubmissionResponse> getAllSubmissions(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_SUBMISSIONS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(name = "username", required = false) String filterUsername,
            @RequestParam(name = "problemId", required = false) Long filterProblemId,
            @RequestParam(name = "status", required = false) SubmissionStatus filterStatus,
            Authentication authentication
    ) {
        SubmissionResponse response = submissionService.getAllSubmissions(pageNumber, pageSize, sortBy, sortOrder, filterUsername, filterProblemId, filterStatus, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionDetailDTO> getSubmissionById(
            @PathVariable Long submissionId,
            Authentication authentication
    ) {
        SubmissionDetailDTO detail = submissionService.getSubmissionById(submissionId, authentication.getName());
        return ResponseEntity.ok(detail);
    }

    // Reports
    @PostMapping("/problems/{problemId}/report")
    public ResponseEntity<ProblemReportDTO> reportProblem(
            @PathVariable Long problemId,
            @RequestParam ReportReason reason,
            @RequestParam String description,
            Authentication authentication
    ) {
        ProblemReportDTO report = reportService.reportProblem(problemId, reason, description, authentication.getName());
        return new ResponseEntity<>(report, HttpStatus.CREATED);
    }
}
