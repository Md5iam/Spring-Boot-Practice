package org.example.seuoj.service;

import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.exceptions.ResourceNotFoundException;
import org.example.seuoj.model.Notification;
import org.example.seuoj.model.NotificationType;
import org.example.seuoj.model.User;
import org.example.seuoj.payload.Notification.NotificationDTO;
import org.example.seuoj.repositories.NotificationRepository;
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
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public void createNotification(User user, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDTO> getUserNotifications(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return notificationRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId()).stream()
                .map(n -> modelMapper.map(n, NotificationDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public Long getUnreadNotificationsCount(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return notificationRepository.countByUserUserIdAndIsReadFalse(user.getUserId());
    }

    @Override
    public void markAsRead(Long notificationId, String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new APIException("You are not authorized to mark this notification as read!");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}
