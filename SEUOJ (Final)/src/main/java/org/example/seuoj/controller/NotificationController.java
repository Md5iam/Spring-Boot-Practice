package org.example.seuoj.controller;

import org.example.seuoj.payload.APIResponse;
import org.example.seuoj.payload.Notification.NotificationDTO;
import org.example.seuoj.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(Authentication authentication) {
        List<NotificationDTO> list = notificationService.getUserNotifications(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        Long count = notificationService.getUnreadNotificationsCount(authentication.getName());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<APIResponse> markAsRead(@PathVariable Long notificationId, Authentication authentication) {
        notificationService.markAsRead(notificationId, authentication.getName());
        return ResponseEntity.ok(new APIResponse("Notification marked as read successfully.", true));
    }
}
