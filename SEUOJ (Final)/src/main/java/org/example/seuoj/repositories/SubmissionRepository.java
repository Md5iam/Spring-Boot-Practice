package org.example.seuoj.repositories;

import org.example.seuoj.model.Submission;
import org.example.seuoj.model.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Page<Submission> findByUserUserId(Long userId, Pageable pageable);
    Page<Submission> findByProblemProblemId(Long problemId, Pageable pageable);
    Page<Submission> findByContestContestId(Long contestId, Pageable pageable);
    List<Submission> findByUserUserIdAndProblemProblemIdAndStatus(Long userId, Long problemId, SubmissionStatus status);
    Long countByUserUserIdAndStatus(Long userId, SubmissionStatus status);
    Long countByUserUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT s.problem.problemId) FROM Submission s WHERE s.user.userId = :userId AND s.problem.difficulty = :difficulty AND s.status = :status")
    Long countDistinctProblemSolvedByUserIdAndDifficultyAndStatus(
        @org.springframework.data.repository.query.Param("userId") Long userId,
        @org.springframework.data.repository.query.Param("difficulty") org.example.seuoj.model.Difficulty difficulty,
        @org.springframework.data.repository.query.Param("status") SubmissionStatus status
    );
}
