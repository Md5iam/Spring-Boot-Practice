package org.example.seuoj.controller;

import org.example.seuoj.model.AdminActivityLog;
import org.example.seuoj.model.ReportStatus;
import org.example.seuoj.payload.APIResponse;
import org.example.seuoj.payload.Contest.ContestDTO;
import org.example.seuoj.payload.Contest.ContestDetailDTO;
import org.example.seuoj.payload.Problem.ProblemDetailDTO;
import org.example.seuoj.payload.Report.ProblemReportDTO;
import org.example.seuoj.payload.Submission.SubmissionDetailDTO;
import org.example.seuoj.payload.TestCase.TestCaseDTO;
import org.example.seuoj.payload.User.UserDTO;
import org.example.seuoj.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProblemService problemService;

    @Autowired
    private TestCaseService testCaseService;

    @Autowired
    private ContestService contestService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private AdminLogService adminLogService;

    // --- Users ---
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<UserDTO> banUser(
            @PathVariable Long userId,
            @RequestParam String reason,
            @RequestParam(required = false) Integer durationMinutes,
            Authentication authentication
    ) {
        LocalDateTime until = null;
        if (durationMinutes != null && durationMinutes > 0) {
            until = LocalDateTime.now().plusMinutes(durationMinutes);
        }
        UserDTO user = userService.banUser(userId, reason, until, authentication.getName());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<UserDTO> unbanUser(@PathVariable Long userId, Authentication authentication) {
        UserDTO user = userService.unbanUser(userId, authentication.getName());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{userId}/promote")
    public ResponseEntity<UserDTO> promoteToAdmin(@PathVariable Long userId, Authentication authentication) {
        UserDTO user = userService.promoteToAdmin(userId, authentication.getName());
        return ResponseEntity.ok(user);
    }

    // --- Problems ---
    @PostMapping("/problems")
    public ResponseEntity<ProblemDetailDTO> createProblem(@RequestBody ProblemDetailDTO problemDTO, Authentication authentication) {
        ProblemDetailDTO created = problemService.createProblem(problemDTO, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/problems/{problemId}")
    public ResponseEntity<ProblemDetailDTO> updateProblem(
            @PathVariable Long problemId,
            @RequestBody ProblemDetailDTO problemDTO,
            Authentication authentication
    ) {
        ProblemDetailDTO updated = problemService.updateProblem(problemId, problemDTO, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/problems/{problemId}")
    public ResponseEntity<APIResponse> deleteProblem(@PathVariable Long problemId, Authentication authentication) {
        problemService.deleteProblem(problemId, authentication.getName());
        return ResponseEntity.ok(new APIResponse("Problem deleted successfully.", true));
    }

    @PutMapping("/problems/{problemId}/visibility")
    public ResponseEntity<ProblemDetailDTO> toggleVisibility(
            @PathVariable Long problemId,
            @RequestParam Boolean visible,
            Authentication authentication
    ) {
        ProblemDetailDTO updated = problemService.toggleProblemVisibility(problemId, visible, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/problems/pending")
    public ResponseEntity<org.example.seuoj.payload.Problem.ProblemResponse> getPendingProblems(
            @RequestParam(name = "pageNumber", defaultValue = org.example.seuoj.Configuration.AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = org.example.seuoj.Configuration.AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = org.example.seuoj.Configuration.AppConstants.SORT_PROBLEMS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = org.example.seuoj.Configuration.AppConstants.SORT_DIR, required = false) String sortOrder
    ) {
        org.example.seuoj.payload.Problem.ProblemResponse response = problemService.getPendingProblems(pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/problems/{problemId}/approve")
    public ResponseEntity<ProblemDetailDTO> approveProblem(
            @PathVariable Long problemId,
            Authentication authentication
    ) {
        ProblemDetailDTO approved = problemService.approveProblem(problemId, authentication.getName());
        return ResponseEntity.ok(approved);
    }

    // --- Test Cases ---
    @PostMapping("/problems/{problemId}/testcases")
    public ResponseEntity<TestCaseDTO> addTestCase(
            @PathVariable Long problemId,
            @RequestBody TestCaseDTO testCaseDTO,
            Authentication authentication
    ) {
        TestCaseDTO created = testCaseService.addTestCase(problemId, testCaseDTO, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/testcases/{testCaseId}")
    public ResponseEntity<TestCaseDTO> updateTestCase(
            @PathVariable Long testCaseId,
            @RequestBody TestCaseDTO testCaseDTO,
            Authentication authentication
    ) {
        TestCaseDTO updated = testCaseService.updateTestCase(testCaseId, testCaseDTO, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/testcases/{testCaseId}")
    public ResponseEntity<APIResponse> deleteTestCase(@PathVariable Long testCaseId, Authentication authentication) {
        testCaseService.deleteTestCase(testCaseId, authentication.getName());
        return ResponseEntity.ok(new APIResponse("TestCase deleted successfully.", true));
    }

    @GetMapping("/problems/{problemId}/testcases")
    public ResponseEntity<List<TestCaseDTO>> getTestCasesByProblem(@PathVariable Long problemId, Authentication authentication) {
        List<TestCaseDTO> list = testCaseService.getTestCasesByProblem(problemId, authentication.getName());
        return ResponseEntity.ok(list);
    }

    // --- Contests ---
    @PostMapping("/contests")
    public ResponseEntity<ContestDTO> createContest(@RequestBody ContestDTO contestDTO, Authentication authentication) {
        ContestDTO created = contestService.createContest(contestDTO, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/contests/{contestId}")
    public ResponseEntity<ContestDTO> updateContest(
            @PathVariable Long contestId,
            @RequestBody ContestDTO contestDTO,
            Authentication authentication
    ) {
        ContestDTO updated = contestService.updateContest(contestId, contestDTO, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/contests/{contestId}")
    public ResponseEntity<APIResponse> deleteContest(@PathVariable Long contestId, Authentication authentication) {
        contestService.deleteContest(contestId, authentication.getName());
        return ResponseEntity.ok(new APIResponse("Contest deleted successfully.", true));
    }

    @PostMapping("/contests/{contestId}/problems")
    public ResponseEntity<ContestDetailDTO.ContestProblemDTO> addProblemToContest(
            @PathVariable Long contestId,
            @RequestParam Long problemId,
            @RequestParam Integer points,
            Authentication authentication
    ) {
        ContestDetailDTO.ContestProblemDTO dto = contestService.addProblemToContest(contestId, problemId, points, authentication.getName());
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @DeleteMapping("/contests/{contestId}/problems/{problemId}")
    public ResponseEntity<APIResponse> removeProblemFromContest(
            @PathVariable Long contestId,
            @PathVariable Long problemId,
            Authentication authentication
    ) {
        contestService.removeProblemFromContest(contestId, problemId, authentication.getName());
        return ResponseEntity.ok(new APIResponse("Problem removed from contest successfully.", true));
    }

    // --- Reports ---
    @GetMapping("/reports")
    public ResponseEntity<List<ProblemReportDTO>> getAllReports(Authentication authentication) {
        List<ProblemReportDTO> list = reportService.getAllReports(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ProblemReportDTO> resolveReport(
            @PathVariable Long reportId,
            @RequestParam ReportStatus status,
            Authentication authentication
    ) {
        ProblemReportDTO resolved = reportService.resolveReport(reportId, status, authentication.getName());
        return ResponseEntity.ok(resolved);
    }

    // --- Submissions ---
    @PostMapping("/submissions/{submissionId}/rejudge")
    public ResponseEntity<SubmissionDetailDTO> reJudgeSubmission(@PathVariable Long submissionId, Authentication authentication) {
        SubmissionDetailDTO detail = submissionService.reJudgeSubmission(submissionId, authentication.getName());
        return ResponseEntity.ok(detail);
    }

    // --- Activity Logs ---
    @GetMapping("/logs")
    public ResponseEntity<List<AdminActivityLog>> getActivityLogs() {
        return ResponseEntity.ok(adminLogService.getAllActivityLogs());
    }
}
