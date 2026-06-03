package org.example.seuoj.service;

import org.example.seuoj.model.AdminActivityLog;
import org.example.seuoj.model.User;

import java.util.List;

public interface AdminLogService {
    void logAction(User admin, String action, String targetType, Long targetId, String details);
    List<AdminActivityLog> getAllActivityLogs();
}
