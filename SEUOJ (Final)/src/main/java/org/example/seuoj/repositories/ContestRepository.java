package org.example.seuoj.repositories;

import org.example.seuoj.model.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    List<Contest> findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime time); // upcoming contest
    List<Contest> findByStartTimeBeforeAndEndTimeAfterOrderByStartTimeDesc(LocalDateTime now1, LocalDateTime now2); // ongoing
    List<Contest> findByEndTimeBeforeOrderByEndTimeDesc(LocalDateTime time); // past
}
