package org.example.seuoj.service;

import org.example.seuoj.model.AdminActivityLog;
import org.example.seuoj.model.User;
import org.example.seuoj.repositories.AdminActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AdminLogServiceImpl implements AdminLogService {

    @Autowired
    private AdminActivityLogRepository adminLogRepository;

    @Override
    public void logAction(User admin, String action, String targetType, Long targetId, String details) {
        AdminActivityLog log = new AdminActivityLog();
        log.setAdmin(admin);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());
        adminLogRepository.save(log);
    }

    @Override
    public List<AdminActivityLog> getAllActivityLogs() {
        return adminLogRepository.findAllByOrderByTimestampDesc();
    }
}
