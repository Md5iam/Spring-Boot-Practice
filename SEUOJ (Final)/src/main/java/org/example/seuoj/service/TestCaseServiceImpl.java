package org.example.seuoj.service;

import org.example.seuoj.exceptions.ResourceNotFoundException;
import org.example.seuoj.model.Problem;
import org.example.seuoj.model.TestCase;
import org.example.seuoj.model.User;
import org.example.seuoj.payload.TestCase.TestCaseDTO;
import org.example.seuoj.repositories.ProblemRepository;
import org.example.seuoj.repositories.TestCaseRepository;
import org.example.seuoj.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TestCaseServiceImpl implements TestCaseService {

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public TestCaseDTO addTestCase(Long problemId, TestCaseDTO testCaseDTO, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        TestCase testCase = modelMapper.map(testCaseDTO, TestCase.class);
        testCase.setProblem(problem);

        TestCase saved = testCaseRepository.save(testCase);

        adminLogService.logAction(admin, "ADD_TESTCASE", "PROBLEM", problemId, "Added test case ID: " + saved.getTestCaseId());

        return modelMapper.map(saved, TestCaseDTO.class);
    }

    @Override
    public TestCaseDTO updateTestCase(Long testCaseId, TestCaseDTO testCaseDTO, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", testCaseId));

        testCase.setInput(testCaseDTO.getInput());
        testCase.setExpectedOutput(testCaseDTO.getExpectedOutput());
        testCase.setType(testCaseDTO.getType());

        TestCase saved = testCaseRepository.save(testCase);

        adminLogService.logAction(admin, "UPDATE_TESTCASE", "TESTCASE", testCaseId, "Updated testcase ID: " + testCaseId);

        return modelMapper.map(saved, TestCaseDTO.class);
    }

    @Override
    public void deleteTestCase(Long testCaseId, String adminUsername) {
        User admin = userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", testCaseId));

        testCaseRepository.delete(testCase);

        adminLogService.logAction(admin, "DELETE_TESTCASE", "TESTCASE", testCaseId, "Deleted testcase ID: " + testCaseId);
    }

    @Override
    public List<TestCaseDTO> getTestCasesByProblem(Long problemId, String adminUsername) {
        // Enforce that user is authenticated admin (validated in controller layer too)
        userRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        return testCaseRepository.findByProblemProblemId(problemId).stream()
                .map(tc -> modelMapper.map(tc, TestCaseDTO.class))
                .collect(Collectors.toList());
    }
}
