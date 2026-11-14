package com.railtrack.repository;

import java.util.List;
import java.util.Optional;

import com.railtrack.entity.Incident;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    @EntityGraph(attributePaths = {"train", "station", "responseTeam", "history"})
    List<Incident> findAllByDeletedFalseOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {"train", "station", "responseTeam", "history"})
    Optional<Incident> findByIdAndDeletedFalse(Long id);
}
