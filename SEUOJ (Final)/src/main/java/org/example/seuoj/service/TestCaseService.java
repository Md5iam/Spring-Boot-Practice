package org.example.seuoj.service;

import org.example.seuoj.payload.TestCase.TestCaseDTO;
import java.util.List;

public interface TestCaseService {
    TestCaseDTO addTestCase(Long problemId, TestCaseDTO testCaseDTO, String adminUsername);
    TestCaseDTO updateTestCase(Long testCaseId, TestCaseDTO testCaseDTO, String adminUsername);
    void deleteTestCase(Long testCaseId, String adminUsername);
    List<TestCaseDTO> getTestCasesByProblem(Long problemId, String adminUsername);
}
