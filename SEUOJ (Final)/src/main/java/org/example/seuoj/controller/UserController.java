package org.example.seuoj.controller;

import org.example.seuoj.payload.User.RankDTO;
import org.example.seuoj.payload.User.UserDashboardDTO;
import org.example.seuoj.payload.User.UserProfileDTO;
import org.example.seuoj.service.UserService;
import org.example.seuoj.service.ContestService;
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

    @Autowired
    private ContestService contestService;

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
        try {
            contestService.calculateAllPendingContestRatings();
        } catch (Exception e) {
            // Ignore exceptions to keep leaderboard operational
        }
        List<RankDTO> leaderboard = userService.getGlobalLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/solve-count")
    public ResponseEntity<org.example.seuoj.payload.User.UserSolveCountDTO> getMySolveCount(Authentication authentication) {
        org.example.seuoj.payload.User.UserSolveCountDTO solveCount = userService.getUserSolveCountByUsername(authentication.getName());
        return ResponseEntity.ok(solveCount);
    }

    @GetMapping("/solve-count/{username}")
    public ResponseEntity<org.example.seuoj.payload.User.UserSolveCountDTO> getUserSolveCount(@PathVariable String username) {
        org.example.seuoj.payload.User.UserSolveCountDTO solveCount = userService.getUserSolveCountByUsername(username);
        return ResponseEntity.ok(solveCount);
    }
}
