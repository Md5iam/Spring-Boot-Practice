package org.example.seuoj.repositories;

import org.example.seuoj.model.ProblemReport;
import org.example.seuoj.model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemReportRepository extends JpaRepository<ProblemReport, Long> {
    List<ProblemReport> findByStatus(ReportStatus status);
    List<ProblemReport> findByReportedByUserId(Long userId);
}
