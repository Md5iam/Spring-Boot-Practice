package org.example.seuoj.payload.User;

import lombok.Data;
import org.example.seuoj.payload.Problem.ProblemDTO;
import org.example.seuoj.payload.Submission.SubmissionDTO;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserProfileDTO {
    private Long userId;
    private String username;
    private String email;
    private Integer rating;
    private Integer solvedCount;
    private Integer globalRank;
    private LocalDateTime joinedDate;
    private List<ProblemDTO> solvedProblems;
    private List<SubmissionDTO> submissions;
}
