package org.example.seuoj.payload.Contest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContestStandingsDTO {
    private Long contestId;
    private String contestTitle;
    private List<StandingRow> standings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StandingRow {
        private Integer rank;
        private String username;
        private Integer totalScore;
        private Integer solvedCount;
        private LocalDateTime lastSubmissionTime;
    }
}
