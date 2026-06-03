package org.example.seuoj.payload.TestCase;

import lombok.Data;
import org.example.seuoj.model.TestCaseType;

@Data
public class TestCaseDTO {
    private Long testCaseId;
    private String input;
    private String expectedOutput;
    private TestCaseType type;
}
