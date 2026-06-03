package org.example.seuoj.payload.Problem;

import lombok.Data;
import org.example.seuoj.model.Difficulty;
import org.example.seuoj.payload.TestCase.TestCaseDTO;

import java.util.List;

@Data
public class ProblemDetailDTO {
    private Long problemId;
    private String title;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String constraints;
    private Difficulty difficulty;
    private Integer timeLimitMs;
    private Integer memoryLimitMb;
    private String tags;
    private String explanation;
    private List<TestCaseDTO> sampleTestCases;
    private List<TestCaseDTO> testCases;
}
