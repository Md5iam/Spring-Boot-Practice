package org.example.seuoj.service;

import org.example.seuoj.exceptions.ResourceNotFoundException;
import org.example.seuoj.model.*;
import org.example.seuoj.payload.Report.ProblemReportDTO;
import org.example.seuoj.repositories.ProblemReportRepository;
import org.example.seuoj.repositories.ProblemRepository;
import org.example.seuoj.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReportServiceImpl implements ReportService {

    @Autowired
    private ProblemReportRepository reportRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ProblemReportDTO reportProblem(Long problemId, ReportReason reason, String description, String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        ProblemReport report = new ProblemReport();
        report.setProblem(problem);
        report.setReportedBy(user);
        report.setReason(reason);
        report.setDescription(description);
        report.setStatus(ReportStatus.PENDING);
        report.setCreatedAt(LocalDateTime.now());

        ProblemReport saved = reportRepository.save(report);

        ProblemReportDTO dto = modelMapper.map(saved, ProblemReportDTO.class);
        dto.setProblemId(problem.getProblemId());
        dto.setProblemTitle(problem.getTitle());
        dto.setReportedByUserId(user.getUserId());
        dto.setReportedByUsername(user.getUserName());

        return dto;
    }

    @Override
    public List<ProblemReportDTO> getReportsByStatus(ReportStatus status, String adminUsername) {
        // Enforce Admin exists
        userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        return reportRepository.findByStatus(status).stream()
                .map(r -> {
                    ProblemReportDTO dto = modelMapper.map(r, ProblemReportDTO.class);
                    dto.setProblemId(r.getProblem().getProblemId());
                    dto.setProblemTitle(r.getProblem().getTitle());
                    dto.setReportedByUserId(r.getReportedBy().getUserId());
                    dto.setReportedByUsername(r.getReportedBy().getUserName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ProblemReportDTO resolveReport(Long reportId, ReportStatus resolutionStatus, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        ProblemReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("ProblemReport", "id", reportId));

        report.setStatus(resolutionStatus);
        ProblemReport saved = reportRepository.save(report);

        adminLogService.logAction(admin, "RESOLVE_REPORT", "PROBLEM_REPORT", reportId, "Resolved report with status: " + resolutionStatus);

        ProblemReportDTO dto = modelMapper.map(saved, ProblemReportDTO.class);
        dto.setProblemId(saved.getProblem().getProblemId());
        dto.setProblemTitle(saved.getProblem().getTitle());
        dto.setReportedByUserId(saved.getReportedBy().getUserId());
        dto.setReportedByUsername(saved.getReportedBy().getUserName());

        return dto;
    }

    @Override
    public List<ProblemReportDTO> getAllReports(String adminUsername) {
        userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        return reportRepository.findAll().stream()
                .map(r -> {
                    ProblemReportDTO dto = modelMapper.map(r, ProblemReportDTO.class);
                    dto.setProblemId(r.getProblem().getProblemId());
                    dto.setProblemTitle(r.getProblem().getTitle());
                    dto.setReportedByUserId(r.getReportedBy().getUserId());
                    dto.setReportedByUsername(r.getReportedBy().getUserName());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
