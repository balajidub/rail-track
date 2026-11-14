package com.railtrack.repository;

import java.util.List;

import com.railtrack.entity.SimulationTrainBaseline;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SimulationTrainBaselineRepository extends JpaRepository<SimulationTrainBaseline, String> {

    @EntityGraph(attributePaths = {"train", "currentStation", "nextStation"})
    List<SimulationTrainBaseline> findAllByOrderByIdAsc();
}
