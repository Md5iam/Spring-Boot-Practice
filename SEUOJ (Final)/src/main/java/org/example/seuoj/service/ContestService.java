package org.example.seuoj.service;

import org.example.seuoj.payload.Contest.ContestDTO;
import org.example.seuoj.payload.Contest.ContestDetailDTO;
import org.example.seuoj.payload.Contest.ContestStandingsDTO;

import java.util.List;

public interface ContestService {
    ContestDTO createContest(ContestDTO contestDTO, String adminUsername);
    ContestDTO updateContest(Long contestId, ContestDTO contestDTO, String adminUsername);
    void deleteContest(Long contestId, String adminUsername);
    ContestDetailDTO.ContestProblemDTO addProblemToContest(Long contestId, Long problemId, Integer points, String adminUsername);
    void removeProblemFromContest(Long contestId, Long problemId, String adminUsername);
    ContestDTO getContestById(Long contestId);
    ContestDetailDTO getContestDetail(Long contestId, String username);
    void registerForContest(Long contestId, String username);
    ContestStandingsDTO getContestStandings(Long contestId);
    List<ContestDTO> getUpcomingContests();
    List<ContestDTO> getOngoingContests();
    List<ContestDTO> getPastContests();
}
