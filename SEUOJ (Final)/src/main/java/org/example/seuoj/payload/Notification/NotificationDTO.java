package org.example.seuoj.payload.Notification;

import lombok.Data;
import org.example.seuoj.model.NotificationType;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long notificationId;
    private String message;
    private Boolean isRead;
    private NotificationType type;
    private LocalDateTime createdAt;
}
