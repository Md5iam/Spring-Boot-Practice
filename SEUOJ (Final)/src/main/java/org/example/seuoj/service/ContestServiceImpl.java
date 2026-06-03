package org.example.seuoj.service;

import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.exceptions.ResourceNotFoundException;
import org.example.seuoj.model.*;
import org.example.seuoj.payload.Contest.ContestDTO;
import org.example.seuoj.payload.Contest.ContestDetailDTO;
import org.example.seuoj.payload.Contest.ContestStandingsDTO;
import org.example.seuoj.repositories.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ContestServiceImpl implements ContestService {

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private ContestProblemRepository contestProblemRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private ModelMapper modelMapper;

    // ─────────────────────────────────────────────
    // Admin CRUD
    // ─────────────────────────────────────────────

    @Override
    public ContestDTO createContest(ContestDTO contestDTO, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Contest contest = modelMapper.map(contestDTO, Contest.class);
        Contest saved = contestRepository.save(contest);

        adminLogService.logAction(admin, "CREATE_CONTEST", "CONTEST", saved.getContestId(),
                "Created contest: " + saved.getTitle());

        return getContestById(saved.getContestId());
    }

    @Override
    public ContestDTO updateContest(Long contestId, ContestDTO contestDTO, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", contestId));

        contest.setTitle(contestDTO.getTitle());
        contest.setDescription(contestDTO.getDescription());
        contest.setStartTime(contestDTO.getStartTime());
        contest.setEndTime(contestDTO.getEndTime());

        Contest saved = contestRepository.save(contest);

        adminLogService.logAction(admin, "UPDATE_CONTEST", "CONTEST", contestId, "Updated contest settings.");

        return getContestById(saved.getContestId());
    }

    @Override
    public void deleteContest(Long contestId, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", contestId));

        contestRepository.delete(contest);

        adminLogService.logAction(admin, "DELETE_CONTEST", "CONTEST", contestId,
                "Deleted contest: " + contest.getTitle());
    }

    @Override
    public ContestDetailDTO.ContestProblemDTO addProblemToContest(
            Long contestId, Long problemId, Integer points, String adminUsername) {

        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", contestId));

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        if (contestProblemRepository
                .findByContestContestIdAndProblemProblemId(contestId, problemId)
                .isPresent()) {
            throw new APIException("Problem is already added to this contest!");
        }

        ContestProblem cp = new ContestProblem();
        cp.setContest(contest);
        cp.setProblem(problem);
        cp.setPoints(points);
        contestProblemRepository.save(cp);

        adminLogService.logAction(admin, "ADD_CONTEST_PROBLEM", "CONTEST", contestId,
                "Added problem " + problemId + " to contest with " + points + " points.");

        ContestDetailDTO.ContestProblemDTO dto = new ContestDetailDTO.ContestProblemDTO();
        dto.setProblemId(problem.getProblemId());
        dto.setTitle(problem.getTitle());
        dto.setDifficulty(problem.getDifficulty());
        dto.setPoints(points);
        dto.setTags(problem.getTags());
        return dto;
    }

    @Override
    public void removeProblemFromContest(Long contestId, Long problemId, String adminUsername) {
        userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        ContestProblem cp = contestProblemRepository
                .findByContestContestIdAndProblemProblemId(contestId, problemId)
                .orElseThrow(() -> new APIException("Problem not associated with this contest!"));

        contestProblemRepository.delete(cp);

        adminLogService.logAction(
                userRepository.findByUserName(adminUsername).get(),
                "REMOVE_CONTEST_PROBLEM", "CONTEST", contestId,
                "Removed problem " + problemId + " from contest.");
    }

    // ─────────────────────────────────────────────
    // Public / participant reads
    // ─────────────────────────────────────────────

    @Override
    public ContestDTO getContestById(Long contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", contestId));
        return toContestDTO(contest);
    }

    @Override
    public ContestDetailDTO getContestDetail(Long contestId, String username) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", contestId));

        String status = resolveStatus(contest);
        boolean isOngoing = "ONGOING".equals(status);
        boolean isUpcoming = "UPCOMING".equals(status);

        // Anonymous users: block live contests entirely; allow viewing upcoming/past
        if (username == null) {
            if (isOngoing) {
                throw new APIException("Contest is live. Please sign in and register to participate.");
            }
            ContestDetailDTO detail = modelMapper.map(contest, ContestDetailDTO.class);
            detail.setStatus(status);
            detail.setRegistered(false);
            detail.setRegistrationOpen(isUpcoming);
            detail.setCanParticipate(false);
            detail.setProblems(new ArrayList<>());
            return detail;
        }

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getRoleName() == AppRole.ROLE_ADMIN);
        boolean isRegistered = contest.getParticipants().stream()
                .anyMatch(u -> u.getUserId().equals(user.getUserId()));

        // Registered-only gate for live contests
        if (!isAdmin && isOngoing && !isRegistered) {
            throw new APIException("Contest is live. Only registered users can enter and participate.");
        }

        ContestDetailDTO detail = modelMapper.map(contest, ContestDetailDTO.class);
        detail.setStatus(status);
        detail.setRegistered(isRegistered);
        detail.setRegistrationOpen(isUpcoming);
        detail.setCanParticipate(isAdmin || (isOngoing && isRegistered));

        // Hide problem list from non-admins before contest starts
        if (!isAdmin && isUpcoming) {
            detail.setProblems(new ArrayList<>());
        } else {
            detail.setProblems(buildProblemList(contest));
        }

        return detail;
    }

    @Override
    public void registerForContest(Long contestId, String username) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", contestId));

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (contest.getParticipants().stream()
                .anyMatch(u -> u.getUserId().equals(user.getUserId()))) {
            throw new APIException("You are already registered for this contest!");
        }

        if (!LocalDateTime.now().isBefore(contest.getStartTime())) {
            throw new APIException("Registration is closed! You can only register before the contest starts.");
        }

        contest.getParticipants().add(user);
        contestRepository.save(contest);
    }

    @Override
    public ContestStandingsDTO getContestStandings(Long contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", contestId));

        // Only calculate ratings once the contest is over
        if ("PAST".equals(resolveStatus(contest))) {
            checkAndCalculateContestRatings(contest);
        }

        List<Submission> allSubs = submissionRepository
                .findByContestContestId(contestId, Pageable.unpaged())
                .getContent();

        // Preload ContestProblem points into a map to avoid N+1 queries
        Map<Long, Integer> pointsByProblemId = contestProblemRepository
                .findByContestContestId(contestId)
                .stream()
                .collect(Collectors.toMap(
                        cp -> cp.getProblem().getProblemId(),
                        ContestProblem::getPoints));

        Map<User, List<Submission>> acceptedByUser = allSubs.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.ACCEPTED)
                .collect(Collectors.groupingBy(Submission::getUser));

        Map<User, List<Submission>> allByUser = allSubs.stream()
                .collect(Collectors.groupingBy(Submission::getUser));

        List<ContestStandingsDTO.StandingRow> rows = new ArrayList<>();

        for (User participant : contest.getParticipants()) {
            List<Submission> accepted = acceptedByUser.getOrDefault(participant, new ArrayList<>());
            List<Submission> all = allByUser.getOrDefault(participant, new ArrayList<>());

            Set<Long> solvedIds = new HashSet<>();
            int totalScore = 0;

            for (Submission sub : accepted) {
                Long pid = sub.getProblem().getProblemId();
                if (solvedIds.add(pid)) {           // add() returns false if already present
                    totalScore += pointsByProblemId.getOrDefault(pid, 0);
                }
            }

            // Tiebreaker: time of last accepted submission (earlier = better)
            LocalDateTime lastAccepted = accepted.stream()
                    .map(Submission::getSubmittedAt)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            rows.add(new ContestStandingsDTO.StandingRow(
                    0, participant.getUserName(), totalScore, solvedIds.size(), lastAccepted));
        }

        // Sort: highest score first; on tie, earliest last-accepted-submission first
        rows.sort((a, b) -> {
            int cmp = b.getTotalScore().compareTo(a.getTotalScore());
            if (cmp != 0) return cmp;
            if (a.getLastSubmissionTime() == null && b.getLastSubmissionTime() == null) return 0;
            if (a.getLastSubmissionTime() == null) return 1;
            if (b.getLastSubmissionTime() == null) return -1;
            return a.getLastSubmissionTime().compareTo(b.getLastSubmissionTime());
        });

        int rank = 1;
        for (ContestStandingsDTO.StandingRow r : rows) {
            r.setRank(rank++);
        }

        ContestStandingsDTO standings = new ContestStandingsDTO();
        standings.setContestId(contestId);
        standings.setContestTitle(contest.getTitle());
        standings.setStandings(rows);
        return standings;
    }

    @Override
    public List<ContestDTO> getUpcomingContests() {
        return contestRepository
                .findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now())
                .stream()
                .map(this::toContestDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContestDTO> getOngoingContests() {
        LocalDateTime now = LocalDateTime.now();
        return contestRepository
                .findByStartTimeBeforeAndEndTimeAfterOrderByStartTimeDesc(now, now)
                .stream()
                .map(this::toContestDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContestDTO> getPastContests() {
        List<Contest> past = contestRepository.findByEndTimeBeforeOrderByEndTimeDesc(LocalDateTime.now());
        // Do NOT call checkAndCalculateContestRatings in a listing loop —
        // ratings are calculated lazily when standings are fetched for a specific contest.
        return past.stream()
                .map(this::toContestDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // Rating calculation (called once per contest)
    // ─────────────────────────────────────────────

    /**
     * Codeforces-style Elo: for each pair of players we compute the expected
     * score (probability that player A beats player B) and compare it to the
     * actual outcome (1 if A ranked higher, 0 if lower, 0.5 for a draw).
     * The sum of those differences, multiplied by K, gives the rating delta.
     *
     * This keeps expected and actual values on the SAME 0-to-N scale,
     * fixing the original bug where expectedRank (probability sum, 0‥N-1)
     * was compared directly to actualRank (integer position, 1‥N).
     */
    private synchronized void checkAndCalculateContestRatings(Contest contest) {
        Contest current = contestRepository.findById(contest.getContestId()).orElse(contest);
        if (Boolean.TRUE.equals(current.getIsRatingCalculated())) return;
        if (LocalDateTime.now().isBefore(current.getEndTime())) return;

        Set<User> participants = new HashSet<>(current.getParticipants());
        if (participants.isEmpty()) {
            current.setIsRatingCalculated(true);
            contestRepository.save(current);
            return;
        }

        // Preload points map
        Map<Long, Integer> pointsByProblemId = contestProblemRepository
                .findByContestContestId(current.getContestId())
                .stream()
                .collect(Collectors.toMap(
                        cp -> cp.getProblem().getProblemId(),
                        ContestProblem::getPoints));

        List<Submission> submissions = submissionRepository
                .findByContestContestId(current.getContestId(), Pageable.unpaged())
                .getContent();

        Map<User, List<Submission>> acceptedByUser = submissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.ACCEPTED)
                .collect(Collectors.groupingBy(Submission::getUser));

        // Build score rows for ranking
        List<ContestStandingsDTO.StandingRow> rows = new ArrayList<>();
        for (User user : participants) {
            List<Submission> accepted = acceptedByUser.getOrDefault(user, new ArrayList<>());
            Set<Long> solved = new HashSet<>();
            int score = 0;
            LocalDateTime lastAcc = null;

            for (Submission sub : accepted) {
                Long pid = sub.getProblem().getProblemId();
                if (solved.add(pid)) {
                    score += pointsByProblemId.getOrDefault(pid, 0);
                }
                if (lastAcc == null || sub.getSubmittedAt().isAfter(lastAcc)) {
                    lastAcc = sub.getSubmittedAt();
                }
            }
            rows.add(new ContestStandingsDTO.StandingRow(0, user.getUserName(), score, solved.size(), lastAcc));
        }

        rows.sort((a, b) -> {
            int cmp = b.getTotalScore().compareTo(a.getTotalScore());
            if (cmp != 0) return cmp;
            if (a.getLastSubmissionTime() == null && b.getLastSubmissionTime() == null) return 0;
            if (a.getLastSubmissionTime() == null) return 1;
            if (b.getLastSubmissionTime() == null) return -1;
            return a.getLastSubmissionTime().compareTo(b.getLastSubmissionTime());
        });

        // Assign 1-based ranks; participants with no submissions get the bottom ranks
        Map<String, Integer> rankMap = new HashMap<>();
        int r = 1;
        for (ContestStandingsDTO.StandingRow row : rows) {
            rankMap.put(row.getUsername(), r++);
        }
        for (User user : participants) {
            rankMap.putIfAbsent(user.getUserName(), r++);
        }

        int n = participants.size();

        // Compute deltas using pairwise expected vs actual score
        Map<String, Double> deltas = new HashMap<>();
        for (User player : participants) {
            int playerRating = safeRating(player);
            int playerRank = rankMap.get(player.getUserName());

            double expectedScore = 0.0;  // sum of P(player beats each opponent)
            double actualScore   = 0.0;  // sum of actual results vs each opponent

            for (User opponent : participants) {
                if (player.getUserId().equals(opponent.getUserId())) continue;

                int opponentRating = safeRating(opponent);
                // P(player beats opponent) via standard Elo formula
                double pWin = 1.0 / (1.0 + Math.pow(10.0, (opponentRating - playerRating) / 400.0));
                expectedScore += pWin;

                int opponentRank = rankMap.get(opponent.getUserName());
                // Actual outcome: 1 = player ranked higher (lower number), 0.5 = tie, 0 = lower
                if (playerRank < opponentRank)       actualScore += 1.0;
                else if (playerRank == opponentRank) actualScore += 0.5;
                // else actualScore += 0.0
            }

            // K=32; positive delta when player out-performed expectation
            double delta = 32.0 * (actualScore - expectedScore);
            deltas.put(player.getUserName(), delta);
        }

        // Apply and persist
        for (User player : participants) {
            int newRating = Math.max(0, (int) Math.round(safeRating(player) + deltas.getOrDefault(player.getUserName(), 0.0)));
            player.setRating(newRating);
            userRepository.save(player);
        }

        current.setIsRatingCalculated(true);
        contestRepository.save(current);
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    private ContestDTO toContestDTO(Contest c) {
        ContestDTO dto = modelMapper.map(c, ContestDTO.class);
        dto.setDurationMinutes(java.time.Duration.between(c.getStartTime(), c.getEndTime()).toMinutes());
        dto.setParticipantCount(c.getParticipants().size());
        dto.setProblemCount(c.getContestProblems().size());
        dto.setStatus(resolveStatus(c));
        dto.setParticipantUsernames(
                c.getParticipants().stream().map(User::getUserName).collect(Collectors.toList()));
        return dto;
    }

    private List<ContestDetailDTO.ContestProblemDTO> buildProblemList(Contest contest) {
        return contest.getContestProblems().stream()
                .map(cp -> {
                    ContestDetailDTO.ContestProblemDTO pdto = new ContestDetailDTO.ContestProblemDTO();
                    pdto.setProblemId(cp.getProblem().getProblemId());
                    pdto.setTitle(cp.getProblem().getTitle());
                    pdto.setDifficulty(cp.getProblem().getDifficulty());
                    pdto.setPoints(cp.getPoints());
                    pdto.setTags(cp.getProblem().getTags());
                    return pdto;
                })
                .collect(Collectors.toList());
    }

    private String resolveStatus(Contest contest) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(contest.getStartTime()))  return "UPCOMING";
        if (now.isAfter(contest.getEndTime()))     return "PAST";
        return "ONGOING";
    }

    private int safeRating(User user) {
        return user.getRating() != null ? user.getRating() : 0;
    }
}