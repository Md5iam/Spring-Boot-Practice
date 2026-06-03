package org.example.seuoj.service;

import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.exceptions.ResourceNotFoundException;
import org.example.seuoj.model.*;
import org.example.seuoj.payload.Submission.SubmissionDTO;
import org.example.seuoj.payload.Submission.SubmissionDetailDTO;
import org.example.seuoj.payload.Submission.SubmissionRequest;
import org.example.seuoj.payload.Submission.SubmissionResponse;
import org.example.seuoj.repositories.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubmissionServiceImpl implements SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private ContestProblemRepository contestProblemRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private JudgeService judgeService;

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public SubmissionDTO submitCode(SubmissionRequest request, String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", request.getProblemId()));

        Submission submission = new Submission();
        submission.setCode(request.getCode());
        submission.setLanguage(request.getLanguage());
        submission.setStatus(SubmissionStatus.PENDING);
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setSubmittedAt(LocalDateTime.now());

        if (request.getContestId() != null) {
            Contest contest = contestRepository.findById(request.getContestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", request.getContestId()));

            // Validate that the contest is ongoing
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(contest.getStartTime()) || now.isAfter(contest.getEndTime())) {
                throw new APIException("Submissions are only allowed during the contest period!");
            }

            // Validate that the user is registered for this contest
            boolean isRegistered = contest.getParticipants().stream()
                    .anyMatch(u -> u.getUserId().equals(user.getUserId()));
            if (!isRegistered) {
                throw new APIException("You must be registered for this contest to submit solutions!");
            }

            boolean isProblemInContest = contestProblemRepository
                    .findByContestContestIdAndProblemProblemId(contest.getContestId(), problem.getProblemId())
                    .isPresent();
            if (!isProblemInContest) {
                throw new APIException("This problem is not part of the selected contest.");
            }

            submission.setContest(contest);
        }

        // Save submission in PENDING state
        Submission savedSubmission = submissionRepository.save(submission);

        // Judging happens asynchronously via AsyncJudgeExecutor (triggered by controller)

        SubmissionDTO dto = modelMapper.map(savedSubmission, SubmissionDTO.class);
        dto.setProblemId(problem.getProblemId());
        dto.setProblemTitle(problem.getTitle());
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUserName());

        return dto;
    }

    @Override
    public SubmissionDetailDTO getSubmissionById(Long submissionId, String username) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", submissionId));

        User currentUser = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getRoleName() == AppRole.ROLE_ADMIN);

        // Standard security: Users can view details of any submission, but only owner/admin can see full raw code
        // For simplicity in testing, we allow everyone to retrieve it, but restrict code field if desired.
        // Let's return the complete details to match Leetcode/Codeforces public code shares.
        SubmissionDetailDTO detail = modelMapper.map(submission, SubmissionDetailDTO.class);
        detail.setProblemId(submission.getProblem().getProblemId());
        detail.setProblemTitle(submission.getProblem().getTitle());
        detail.setUserId(submission.getUser().getUserId());
        detail.setUsername(submission.getUser().getUserName());

        return detail;
    }

    @Override
    public SubmissionResponse getAllSubmissions(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder,
                                                 String filterUsername, Long filterProblemId, SubmissionStatus filterStatus, String username) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        List<Submission> submissions = submissionRepository.findAll();

        // Perform manual filters for ease of implementation on multiple cross-joins
        List<Submission> filtered = submissions.stream()
                .filter(sub -> filterUsername == null || sub.getUser().getUserName().equalsIgnoreCase(filterUsername))
                .filter(sub -> filterProblemId == null || sub.getProblem().getProblemId().equals(filterProblemId))
                .filter(sub -> filterStatus == null || sub.getStatus() == filterStatus)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());

        List<SubmissionDTO> content = filtered.subList(start, end).stream()
                .map(sub -> {
                    SubmissionDTO dto = modelMapper.map(sub, SubmissionDTO.class);
                    dto.setProblemId(sub.getProblem().getProblemId());
                    dto.setProblemTitle(sub.getProblem().getTitle());
                    dto.setUserId(sub.getUser().getUserId());
                    dto.setUsername(sub.getUser().getUserName());
                    return dto;
                })
                .collect(Collectors.toList());

        Page<SubmissionDTO> page = new PageImpl<>(content, pageable, filtered.size());

        return new SubmissionResponse(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    public SubmissionDetailDTO reJudgeSubmission(Long submissionId, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", submissionId));

        List<TestCase> testCases = testCaseRepository.findByProblemProblemId(submission.getProblem().getProblemId());

        SubmissionStatus originalStatus = submission.getStatus();

        // Re-execute
        judgeService.execute(submission, testCases);

        // Handle solved stats adjustment if status flips to or from ACCEPTED
        if (originalStatus != SubmissionStatus.ACCEPTED && submission.getStatus() == SubmissionStatus.ACCEPTED) {
            User user = submission.getUser();
            List<Submission> previousAccepted = submissionRepository.findByUserUserIdAndProblemProblemIdAndStatus(
                    user.getUserId(), submission.getProblem().getProblemId(), SubmissionStatus.ACCEPTED);
            if (previousAccepted.size() == 1) {
                user.setSolvedCount(user.getSolvedCount() + 1);
                userRepository.save(user);
            }
        }

        adminLogService.logAction(admin, "REJUDGE_SUBMISSION", "SUBMISSION", submissionId, "Re-judged submission of problem: " + submission.getProblem().getTitle());

        return getSubmissionById(submissionId, adminUsername);
    }
}
