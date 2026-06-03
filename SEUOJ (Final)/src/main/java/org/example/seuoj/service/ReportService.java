package org.example.seuoj.service;

import org.example.seuoj.model.ReportReason;
import org.example.seuoj.model.ReportStatus;
import org.example.seuoj.payload.Report.ProblemReportDTO;

import java.util.List;

public interface ReportService {
    ProblemReportDTO reportProblem(Long problemId, ReportReason reason, String description, String username);
    List<ProblemReportDTO> getReportsByStatus(ReportStatus status, String adminUsername);
    ProblemReportDTO resolveReport(Long reportId, ReportStatus resolutionStatus, String adminUsername);
    List<ProblemReportDTO> getAllReports(String adminUsername);
}
