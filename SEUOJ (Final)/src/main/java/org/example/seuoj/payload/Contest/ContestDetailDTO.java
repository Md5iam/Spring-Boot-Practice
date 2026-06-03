package org.example.seuoj.payload.Contest;

import lombok.Data;
import org.example.seuoj.model.Difficulty;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContestDetailDTO {
    private Long contestId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // UPCOMING, ONGOING, PAST
    private Boolean registered;
    private Boolean registrationOpen;
    private Boolean canParticipate;
    private List<ContestProblemDTO> problems;

    @Data
    public static class ContestProblemDTO {
        private Long problemId;
        private String title;
        private Difficulty difficulty;
        private Integer points;
        private String tags;
    }
}
