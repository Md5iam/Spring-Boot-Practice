package org.example.seuoj.repositories;

import org.example.seuoj.model.Difficulty;
import org.example.seuoj.model.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Page<Problem> findByIsVisibleTrue(Pageable pageable);
    Page<Problem> findByDifficultyAndIsVisibleTrue(Difficulty difficulty, Pageable pageable);
    Page<Problem> findByTitleContainingIgnoreCaseAndIsVisibleTrue(String title, Pageable pageable);
    Page<Problem> findByDifficultyAndTitleContainingIgnoreCaseAndIsVisibleTrue(Difficulty difficulty, String title, Pageable pageable);
    Page<Problem> findByIsVisibleFalse(Pageable pageable);
}
