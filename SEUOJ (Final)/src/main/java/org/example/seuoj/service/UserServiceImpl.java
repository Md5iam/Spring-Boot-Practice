package org.example.seuoj.service;

import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.exceptions.ResourceNotFoundException;
import org.example.seuoj.model.*;
import org.example.seuoj.payload.Contest.ContestDTO;
import org.example.seuoj.payload.Problem.ProblemDTO;
import org.example.seuoj.payload.Submission.SubmissionDTO;
import org.example.seuoj.payload.User.RankDTO;
import org.example.seuoj.payload.User.UserDTO;
import org.example.seuoj.payload.User.UserDashboardDTO;
import org.example.seuoj.payload.User.UserProfileDTO;
import org.example.seuoj.repositories.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public UserProfileDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return buildUserProfile(user);
    }

    @Override
    public UserProfileDTO getUserProfileByUsername(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return buildUserProfile(user);
    }

    private UserProfileDTO buildUserProfile(User user) {
        UserProfileDTO profile = modelMapper.map(user, UserProfileDTO.class);
        profile.setGlobalRank(calculateGlobalRank(user));

        // Get recent submissions
        Pageable recentPageable = PageRequest.of(0, 10, Sort.by("submissionId").descending());
        List<SubmissionDTO> submissionDTOs = submissionRepository.findByUserUserId(user.getUserId(), recentPageable)
                .getContent().stream()
                .map(sub -> {
                    SubmissionDTO dto = modelMapper.map(sub, SubmissionDTO.class);
                    dto.setProblemId(sub.getProblem().getProblemId());
                    dto.setProblemTitle(sub.getProblem().getTitle());
                    dto.setUserId(sub.getUser().getUserId());
                    dto.setUsername(sub.getUser().getUserName());
                    return dto;
                })
                .collect(Collectors.toList());
        profile.setSubmissions(submissionDTOs);

        // Get unique solved problems
        List<ProblemDTO> solvedProblems = problemRepository.findAll().stream()
                .filter(prob -> !submissionRepository.findByUserUserIdAndProblemProblemIdAndStatus(user.getUserId(), prob.getProblemId(), SubmissionStatus.ACCEPTED).isEmpty())
                .map(prob -> {
                    ProblemDTO dto = modelMapper.map(prob, ProblemDTO.class);
                    dto.setIsSolvedByCurrentUser(true);
                    return dto;
                })
                .collect(Collectors.toList());
        profile.setSolvedProblems(solvedProblems);

        return profile;
    }

    @Override
    public UserDashboardDTO getUserDashboard(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        UserDashboardDTO dashboard = new UserDashboardDTO();
        dashboard.setSolvedCount(user.getSolvedCount());
        dashboard.setRating(user.getRating());
        dashboard.setGlobalRank(calculateGlobalRank(user));
        dashboard.setTotalSubmissions(submissionRepository.countByUserUserId(user.getUserId()));

        // Recent Submissions (last 5)
        Pageable recent5 = PageRequest.of(0, 5, Sort.by("submissionId").descending());
        List<SubmissionDTO> submissionDTOs = submissionRepository.findByUserUserId(user.getUserId(), recent5)
                .getContent().stream()
                .map(sub -> {
                    SubmissionDTO dto = modelMapper.map(sub, SubmissionDTO.class);
                    dto.setProblemId(sub.getProblem().getProblemId());
                    dto.setProblemTitle(sub.getProblem().getTitle());
                    dto.setUserId(sub.getUser().getUserId());
                    dto.setUsername(sub.getUser().getUserName());
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setRecentSubmissions(submissionDTOs);

        // Upcoming Contests
        List<ContestDTO> upcoming = contestRepository.findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now()).stream()
                .map(contest -> {
                    ContestDTO dto = modelMapper.map(contest, ContestDTO.class);
                    dto.setDurationMinutes(java.time.Duration.between(contest.getStartTime(), contest.getEndTime()).toMinutes());
                    dto.setParticipantCount(contest.getParticipants().size());
                    dto.setProblemCount(contest.getContestProblems().size());
                    dto.setStatus("UPCOMING");
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setUpcomingContests(upcoming);

        return dashboard;
    }

    @Override
    public List<RankDTO> getGlobalLeaderboard() {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "rating"));
        List<RankDTO> ranks = new ArrayList<>();
        int rank = 1;
        for (User u : users) {
            ranks.add(new RankDTO(rank++, u.getUserName(), u.getRating(), u.getSolvedCount()));
        }
        return ranks;
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll(Sort.by("userId")).stream()
                .map(u -> modelMapper.map(u, UserDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO banUser(Long userId, String reason, LocalDateTime until, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        user.setIsBanned(true);
        user.setBanReason(reason);
        user.setBanUntil(until);

        User savedUser = userRepository.save(user);

        // Log action
        adminLogService.logAction(admin, "BAN_USER", "USER", userId, "Banned until " + (until != null ? until : "permanently") + ". Reason: " + reason);

        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    public UserDTO unbanUser(Long userId, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        user.setIsBanned(false);
        user.setBanReason(null);
        user.setBanUntil(null);

        User savedUser = userRepository.save(user);

        // Log action
        adminLogService.logAction(admin, "UNBAN_USER", "USER", userId, "Unbanned user account.");

        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    public UserDTO promoteToAdmin(Long userId, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Role adminRole = roleRepository.findByRoleName(AppRole.ROLE_ADMIN)
                .orElseThrow(() -> new APIException("Admin role not found in database."));

        user.getRoles().add(adminRole);
        User savedUser = userRepository.save(user);

        // Log action
        adminLogService.logAction(admin, "PROMOTE_ADMIN", "USER", userId, "Promoted user to Admin role.");

        return modelMapper.map(savedUser, UserDTO.class);
    }

    private Integer calculateGlobalRank(User user) {
        List<User> list = userRepository.findAll(Sort.by(Sort.Direction.DESC, "rating"));
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getUserId().equals(user.getUserId())) {
                return i + 1;
            }
        }
        return 1;
    }

    @Override
    public org.example.seuoj.payload.User.UserSolveCountDTO getUserSolveCountByUsername(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new org.example.seuoj.exceptions.ResourceNotFoundException("User", "username", username));

        Long easy = submissionRepository.countDistinctProblemSolvedByUserIdAndDifficultyAndStatus(
                user.getUserId(), org.example.seuoj.model.Difficulty.EASY, org.example.seuoj.model.SubmissionStatus.ACCEPTED);
        Long medium = submissionRepository.countDistinctProblemSolvedByUserIdAndDifficultyAndStatus(
                user.getUserId(), org.example.seuoj.model.Difficulty.MEDIUM, org.example.seuoj.model.SubmissionStatus.ACCEPTED);
        Long hard = submissionRepository.countDistinctProblemSolvedByUserIdAndDifficultyAndStatus(
                user.getUserId(), org.example.seuoj.model.Difficulty.HARD, org.example.seuoj.model.SubmissionStatus.ACCEPTED);

        return new org.example.seuoj.payload.User.UserSolveCountDTO(easy, medium, hard);
    }
}
