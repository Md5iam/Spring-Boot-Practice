package org.example.seuoj.payload.Submission;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RunResultDTO {
    private String status;      // "SUCCESS", "COMPILATION_ERROR", "RUNTIME_ERROR", "TIMEOUT"
    private String stdout;      // Raw program output
    private String stderr;      // Compiler / runtime error message
    private long executionTimeMs;
}
