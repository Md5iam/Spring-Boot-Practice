package org.example.seuoj.repositories;

import org.example.seuoj.model.ContestProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestProblemRepository extends JpaRepository<ContestProblem, Long> {
    List<ContestProblem> findByContestContestId(Long contestId);
    Optional<ContestProblem> findByContestContestIdAndProblemProblemId(Long contestId, Long problemId);
}
