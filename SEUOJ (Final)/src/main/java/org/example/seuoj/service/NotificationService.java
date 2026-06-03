package org.example.seuoj.service;

import org.example.seuoj.model.NotificationType;
import org.example.seuoj.model.User;
import org.example.seuoj.payload.Notification.NotificationDTO;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String message, NotificationType type);
    List<NotificationDTO> getUserNotifications(String username);
    Long getUnreadNotificationsCount(String username);
    void markAsRead(Long notificationId, String username);
}
