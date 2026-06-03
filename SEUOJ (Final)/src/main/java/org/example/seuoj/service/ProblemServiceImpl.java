package org.example.seuoj.service;

import org.example.seuoj.exceptions.APIException;
import org.example.seuoj.exceptions.ResourceNotFoundException;
import org.example.seuoj.model.*;
import org.example.seuoj.payload.Problem.ProblemDTO;
import org.example.seuoj.payload.Problem.ProblemDetailDTO;
import org.example.seuoj.payload.Problem.ProblemResponse;
import org.example.seuoj.payload.TestCase.TestCaseDTO;
import org.example.seuoj.repositories.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProblemServiceImpl implements ProblemService {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ProblemDetailDTO createProblem(ProblemDetailDTO problemDTO, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        if (problemRepository.findByTitleContainingIgnoreCaseAndIsVisibleTrue(problemDTO.getTitle(), Pageable.unpaged()).getTotalElements() > 0) {
            throw new APIException("A problem with the same title already exists!");
        }

        Problem problem = modelMapper.map(problemDTO, Problem.class);
        problem.setCreatedBy(admin);
        problem.setIsVisible(true);

        Problem savedProblem = problemRepository.save(problem);

        if (problemDTO.getTestCases() != null) {
            for (TestCaseDTO tcDTO : problemDTO.getTestCases()) {
                TestCase tc = modelMapper.map(tcDTO, TestCase.class);
                tc.setProblem(savedProblem);
                savedProblem.getTestCases().add(tc);
            }
            savedProblem = problemRepository.save(savedProblem);
        }

        adminLogService.logAction(admin, "CREATE_PROBLEM", "PROBLEM", savedProblem.getProblemId(), "Created problem titled: " + savedProblem.getTitle());

        return getProblemById(savedProblem.getProblemId());
    }

    @Override
    public ProblemDetailDTO updateProblem(Long problemId, ProblemDetailDTO problemDTO, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        problem.setTitle(problemDTO.getTitle());
        problem.setDescription(problemDTO.getDescription());
        problem.setInputFormat(problemDTO.getInputFormat());
        problem.setOutputFormat(problemDTO.getOutputFormat());
        problem.setConstraints(problemDTO.getConstraints());
        problem.setDifficulty(problemDTO.getDifficulty());
        problem.setTimeLimitMs(problemDTO.getTimeLimitMs());
        problem.setMemoryLimitMb(problemDTO.getMemoryLimitMb());
        problem.setTags(problemDTO.getTags());

        Problem savedProblem = problemRepository.save(problem);

        adminLogService.logAction(admin, "UPDATE_PROBLEM", "PROBLEM", problemId, "Updated problem fields.");

        return getProblemById(savedProblem.getProblemId());
    }

    @Override
    public void deleteProblem(Long problemId, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        problemRepository.delete(problem);

        adminLogService.logAction(admin, "DELETE_PROBLEM", "PROBLEM", problemId, "Deleted problem: " + problem.getTitle());
    }

    @Override
    public ProblemDetailDTO getProblemById(Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        ProblemDetailDTO detail = modelMapper.map(problem, ProblemDetailDTO.class);

        // Fetch ONLY sample test cases to return in the detail DTO
        List<TestCaseDTO> sampleCases = problem.getTestCases().stream()
                .filter(tc -> tc.getType() == TestCaseType.SAMPLE)
                .map(tc -> modelMapper.map(tc, TestCaseDTO.class))
                .collect(Collectors.toList());

        detail.setSampleTestCases(sampleCases);
        return detail;
    }

    @Override
    public Problem getProblemEntityById(Long problemId) {
        return problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));
    }

    @Override
    public ProblemResponse getAllProblems(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder,
                                          String search, Difficulty difficulty, String currentUsername) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<Problem> problemPage;

        // Perform filtering logic
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasDiff = difficulty != null;

        if (hasSearch && hasDiff) {
            problemPage = problemRepository.findByDifficultyAndTitleContainingIgnoreCaseAndIsVisibleTrue(difficulty, search, pageable);
        } else if (hasSearch) {
            problemPage = problemRepository.findByTitleContainingIgnoreCaseAndIsVisibleTrue(search, pageable);
        } else if (hasDiff) {
            problemPage = problemRepository.findByDifficultyAndIsVisibleTrue(difficulty, pageable);
        } else {
            problemPage = problemRepository.findByIsVisibleTrue(pageable);
        }

        User user = null;
        if (currentUsername != null) {
            user = userRepository.findByUserName(currentUsername).orElse(null);
        }
        final User finalUser = user;

        List<ProblemDTO> dtoList = problemPage.getContent().stream()
                .map(prob -> {
                    ProblemDTO dto = modelMapper.map(prob, ProblemDTO.class);

                    // Calculate acceptance rate
                    Pageable unpaged = Pageable.unpaged();
                    long totalSub = submissionRepository.findByProblemProblemId(prob.getProblemId(), unpaged).getTotalElements();
                    if (totalSub > 0) {
                        long acceptedSub = submissionRepository.findByProblemProblemId(prob.getProblemId(), unpaged)
                                .getContent().stream()
                                .filter(s -> s.getStatus() == SubmissionStatus.ACCEPTED)
                                .count();
                        dto.setAcceptanceRate((double) acceptedSub / totalSub * 100);
                    } else {
                        dto.setAcceptanceRate(0.0);
                    }

                    // Check if current user solved it
                    if (finalUser != null) {
                        boolean solved = !submissionRepository.findByUserUserIdAndProblemProblemIdAndStatus(
                                finalUser.getUserId(), prob.getProblemId(), SubmissionStatus.ACCEPTED).isEmpty();
                        dto.setIsSolvedByCurrentUser(solved);
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return new ProblemResponse(dtoList, problemPage.getNumber(), problemPage.getSize(),
                problemPage.getTotalElements(), problemPage.getTotalPages(), problemPage.isLast());
    }

    @Override
    public ProblemDetailDTO toggleProblemVisibility(Long problemId, Boolean isVisible, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        problem.setIsVisible(isVisible);
        Problem saved = problemRepository.save(problem);

        adminLogService.logAction(admin, "TOGGLE_PROBLEM_VISIBILITY", "PROBLEM", problemId, "Set visibility to " + isVisible);

        return getProblemById(saved.getProblemId());
    }

    @Override
    public ProblemDetailDTO proposeProblem(ProblemDetailDTO problemDTO, String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Problem problem = modelMapper.map(problemDTO, Problem.class);
        problem.setCreatedBy(user);
        problem.setIsVisible(false);

        Problem savedProblem = problemRepository.save(problem);

        if (problemDTO.getTestCases() != null) {
            for (TestCaseDTO tcDTO : problemDTO.getTestCases()) {
                TestCase tc = modelMapper.map(tcDTO, TestCase.class);
                tc.setProblem(savedProblem);
                savedProblem.getTestCases().add(tc);
            }
            savedProblem = problemRepository.save(savedProblem);
        }

        return getProblemById(savedProblem.getProblemId());
    }

    @Override
    public ProblemResponse getPendingProblems(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Problem> problemPage = problemRepository.findByIsVisibleFalse(pageable);

        List<ProblemDTO> dtoList = problemPage.getContent().stream()
                .map(p -> modelMapper.map(p, ProblemDTO.class))
                .collect(Collectors.toList());

        return new ProblemResponse(dtoList, problemPage.getNumber(), problemPage.getSize(),
                problemPage.getTotalElements(), problemPage.getTotalPages(), problemPage.isLast());
    }

    @Override
    public ProblemDetailDTO approveProblem(Long problemId, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        problem.setIsVisible(true);
        Problem saved = problemRepository.save(problem);

        adminLogService.logAction(admin, "APPROVE_PROBLEM", "PROBLEM", problemId, "Approved problem: " + problem.getTitle());

        return getProblemById(saved.getProblemId());
    }
}
