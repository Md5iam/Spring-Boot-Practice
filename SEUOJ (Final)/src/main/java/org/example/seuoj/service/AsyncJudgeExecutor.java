package org.example.seuoj.service;

import org.example.seuoj.model.*;
import org.example.seuoj.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AsyncJudgeExecutor {

    private static final Logger logger = LoggerFactory.getLogger(AsyncJudgeExecutor.class);

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JudgeService judgeService;

    @Async
    @Transactional
    public void executeAsync(Long submissionId) {
        try {
            // Small delay to ensure the calling transaction has committed
            Thread.sleep(200);

            Submission submission = submissionRepository.findById(submissionId)
                    .orElse(null);

            if (submission == null) {
                logger.error("[AsyncJudge] Submission {} not found", submissionId);
                return;
            }

            List<TestCase> testCases = testCaseRepository.findByProblemProblemId(
                    submission.getProblem().getProblemId());

            logger.info("[AsyncJudge] Starting async judging for submission {}", submissionId);

            // Execute the judge
            judgeService.execute(submission, testCases);

            // Handle solved stats updates on successful solve
            if (submission.getStatus() == SubmissionStatus.ACCEPTED) {
                User user = submission.getUser();
                List<Submission> previousAccepted = submissionRepository
                        .findByUserUserIdAndProblemProblemIdAndStatus(
                                user.getUserId(),
                                submission.getProblem().getProblemId(),
                                SubmissionStatus.ACCEPTED);

                // If exactly 1 ACCEPTED (this one), it's the first solve
                if (previousAccepted.size() == 1) {
                    user.setSolvedCount(user.getSolvedCount() + 1);
                    userRepository.save(user);
                }
            }

            logger.info("[AsyncJudge] Finished judging submission {} -> {}", submissionId, submission.getStatus());

        } catch (Exception e) {
            logger.error("[AsyncJudge] Error judging submission {}", submissionId, e);
            // Try to mark it as runtime error
            try {
                Submission sub = submissionRepository.findById(submissionId).orElse(null);
                if (sub != null && sub.getStatus() == SubmissionStatus.PENDING) {
                    sub.setStatus(SubmissionStatus.RUNTIME_ERROR);
                    sub.setErrorMessage("Internal judge error: " + e.getMessage());
                    submissionRepository.save(sub);
                }
            } catch (Exception ex) {
                logger.error("[AsyncJudge] Failed to update submission status", ex);
            }
        }
    }
}
