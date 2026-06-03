package org.example.seuoj.payload.Report;

import lombok.Data;
import org.example.seuoj.model.ReportReason;
import org.example.seuoj.model.ReportStatus;

import java.time.LocalDateTime;

@Data
public class ProblemReportDTO {
    private Long reportId;
    private Long problemId;
    private String problemTitle;
    private Long reportedByUserId;
    private String reportedByUsername;
    private ReportReason reason;
    private String description;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
