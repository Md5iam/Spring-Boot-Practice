package org.example.seuoj.payload.Problem;

import lombok.Data;
import org.example.seuoj.model.Difficulty;

@Data
public class ProblemDTO {
    private Long problemId;
    private String title;
    private Difficulty difficulty;
    private String tags;
    private Double acceptanceRate;
    private Boolean isSolvedByCurrentUser = false;
    private Boolean isVisible = true;
}
