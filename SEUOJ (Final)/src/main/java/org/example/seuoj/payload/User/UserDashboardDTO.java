package org.example.seuoj.payload.User;

import lombok.Data;
import org.example.seuoj.payload.Submission.SubmissionDTO;
import org.example.seuoj.payload.Contest.ContestDTO;

import java.util.List;

@Data
public class UserDashboardDTO {
    private Integer solvedCount;
    private Integer rating;
    private Integer globalRank;
    private Long totalSubmissions;
    private List<SubmissionDTO> recentSubmissions;
    private List<ContestDTO> upcomingContests;
}
