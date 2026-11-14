package com.railtrack.repository;

import java.util.List;

import com.railtrack.entity.Coach;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachRepository extends JpaRepository<Coach, Long> {

    @EntityGraph(attributePaths = "train")
    List<Coach> findAllByTrain_IdOrderByCoachNumberAsc(String trainId);

    @EntityGraph(attributePaths = "train")
    List<Coach> findAllByOrderByTrain_IdAscCoachNumberAsc();
}
