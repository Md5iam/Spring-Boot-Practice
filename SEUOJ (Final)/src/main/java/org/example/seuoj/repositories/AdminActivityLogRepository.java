package org.example.seuoj.repositories;

import org.example.seuoj.model.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
    List<AdminActivityLog> findByAdminUserIdOrderByTimestampDesc(Long adminId);
    List<AdminActivityLog> findAllByOrderByTimestampDesc();
}
