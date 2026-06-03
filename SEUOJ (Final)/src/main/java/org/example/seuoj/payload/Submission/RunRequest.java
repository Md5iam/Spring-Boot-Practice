package org.example.seuoj.payload.Submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.seuoj.model.Language;

@Data
public class RunRequest {
    @NotBlank
    private String code;

    @NotNull
    private Language language;

    private String stdin; // Custom stdin from the editor, can be empty
}
