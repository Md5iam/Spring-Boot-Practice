package org.example.seuoj.service;

import org.example.seuoj.model.SubmissionStatus;
import org.example.seuoj.payload.Submission.SubmissionDTO;
import org.example.seuoj.payload.Submission.SubmissionDetailDTO;
import org.example.seuoj.payload.Submission.SubmissionRequest;
import org.example.seuoj.payload.Submission.SubmissionResponse;

public interface SubmissionService {
    SubmissionDTO submitCode(SubmissionRequest request, String username);
    SubmissionDetailDTO getSubmissionById(Long submissionId, String username);
    SubmissionResponse getAllSubmissions(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder,
                                          String filterUsername, Long filterProblemId, SubmissionStatus filterStatus, String username);
    SubmissionDetailDTO reJudgeSubmission(Long submissionId, String adminUsername);
}
