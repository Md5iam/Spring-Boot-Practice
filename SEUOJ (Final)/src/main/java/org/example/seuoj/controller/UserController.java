package org.example.seuoj.controller;

import org.example.seuoj.payload.User.RankDTO;
import org.example.seuoj.payload.User.UserDashboardDTO;
import org.example.seuoj.payload.User.UserProfileDTO;
import org.example.seuoj.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getMyProfile(Authentication authentication) {
        UserProfileDTO profile = userService.getUserProfileByUsername(authentication.getName());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable String username) {
        UserProfileDTO profile = userService.getUserProfileByUsername(username);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<UserDashboardDTO> getMyDashboard(Authentication authentication) {
        UserDashboardDTO dashboard = userService.getUserDashboard(authentication.getName());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<RankDTO>> getLeaderboard() {
        List<RankDTO> leaderboard = userService.getGlobalLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }
}
