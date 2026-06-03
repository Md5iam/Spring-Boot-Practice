package org.example.seuoj.payload.Submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.seuoj.model.Language;

@Data
public class SubmissionRequest {
    @NotNull
    private Long problemId;

    @NotBlank
    private String code;

    @NotNull
    private Language language;

    private Long contestId; // Optional parameter if submitting in a contest
}
