package org.example.seuoj.service;

import org.example.seuoj.payload.User.RankDTO;
import org.example.seuoj.payload.User.UserDTO;
import org.example.seuoj.payload.User.UserDashboardDTO;
import org.example.seuoj.payload.User.UserProfileDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface UserService {
    UserProfileDTO getUserProfile(Long userId);
    UserProfileDTO getUserProfileByUsername(String username);
    UserDashboardDTO getUserDashboard(String username);
    List<RankDTO> getGlobalLeaderboard();
    List<UserDTO> getAllUsers();
    UserDTO banUser(Long userId, String reason, LocalDateTime until, String adminUsername);
    UserDTO unbanUser(Long userId, String adminUsername);
    UserDTO promoteToAdmin(Long userId, String adminUsername);
    org.example.seuoj.payload.User.UserSolveCountDTO getUserSolveCountByUsername(String username);
}
