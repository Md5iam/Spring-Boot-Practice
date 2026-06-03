package org.example.seuoj.payload.Contest;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContestDTO {
    private Long contestId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long durationMinutes;
    private Integer participantCount;
    private Integer problemCount;
    private String status; // UPCOMING, ONGOING, PAST
    private java.util.List<String> participantUsernames;
}
