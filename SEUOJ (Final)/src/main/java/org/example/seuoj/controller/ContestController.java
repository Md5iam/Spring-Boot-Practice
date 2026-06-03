package org.example.seuoj.controller;

import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.payload.APIResponse;
import org.example.seuoj.payload.Contest.ContestDTO;
import org.example.seuoj.payload.Contest.ContestDetailDTO;
import org.example.seuoj.payload.Contest.ContestStandingsDTO;
import org.example.seuoj.service.ContestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
public class ContestController {

    @Autowired
    private ContestService contestService;

    @GetMapping("/upcoming")
    public ResponseEntity<List<ContestDTO>> getUpcomingContests() {
        return ResponseEntity.ok(contestService.getUpcomingContests());
    }

    @GetMapping("/ongoing")
    public ResponseEntity<List<ContestDTO>> getOngoingContests() {
        return ResponseEntity.ok(contestService.getOngoingContests());
    }

    @GetMapping("/past")
    public ResponseEntity<List<ContestDTO>> getPastContests() {
        return ResponseEntity.ok(contestService.getPastContests());
    }

    @GetMapping("/{contestId}")
    public ResponseEntity<ContestDTO> getContestById(@PathVariable Long contestId) {
        return ResponseEntity.ok(contestService.getContestById(contestId));
    }

    /**
     * Registration requires an authenticated user.
     * Spring Security should already block unauthenticated requests if the
     * endpoint is secured, but we guard explicitly just in case.
     */
    @PostMapping("/{contestId}/register")
    public ResponseEntity<APIResponse> registerForContest(
            @PathVariable Long contestId, Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new APIException("Please sign in to register for contests.");
        }
        contestService.registerForContest(contestId, authentication.getName());
        return ResponseEntity.ok(new APIResponse("Successfully registered for contest!", true));
    }

    /**
     * Detail view is available to anonymous users for UPCOMING and PAST contests.
     * The service enforces the live-contest gate; the controller just passes
     * null for username when no session is present.
     */
    @GetMapping("/{contestId}/detail")
    public ResponseEntity<ContestDetailDTO> getContestDetail(
            @PathVariable Long contestId, Authentication authentication) {

        // Derive username — null if not authenticated (service handles this gracefully)
        String username = (authentication != null) ? authentication.getName() : null;
        ContestDetailDTO detail = contestService.getContestDetail(contestId, username);
        return ResponseEntity.ok(detail);
    }

    @GetMapping("/{contestId}/standings")
    public ResponseEntity<ContestStandingsDTO> getContestStandings(@PathVariable Long contestId) {
        return ResponseEntity.ok(contestService.getContestStandings(contestId));
    }
}