package org.example.seuoj.payload.Submission;

import lombok.Data;
import org.example.seuoj.model.Language;
import org.example.seuoj.model.SubmissionStatus;

import java.time.LocalDateTime;

@Data
public class SubmissionDetailDTO {
    private Long submissionId;
    private Long problemId;
    private String problemTitle;
    private Long userId;
    private String username;
    private String code;
    private Language language;
    private SubmissionStatus status;
    private Integer executionTimeMs;
    private Integer memoryUsedKb;
    private String errorMessage;
    private LocalDateTime submittedAt;
}
