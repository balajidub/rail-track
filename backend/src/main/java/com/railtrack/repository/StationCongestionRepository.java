package com.railtrack.repository;

import java.util.List;
import java.util.Optional;

import com.railtrack.entity.StationCongestion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationCongestionRepository extends JpaRepository<StationCongestion, Long> {

    @EntityGraph(attributePaths = {"station", "platformSnapshots", "platformSnapshots.platform"})
    Optional<StationCongestion> findTopByStation_IdOrderByRecordedAtDesc(String stationId);

    @EntityGraph(attributePaths = {"station", "platformSnapshots", "platformSnapshots.platform"})
    List<StationCongestion> findByStation_IdOrderByRecordedAtDesc(String stationId, Pageable pageable);
}
