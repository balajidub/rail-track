package com.railtrack.repository;

import java.util.Optional;

import com.railtrack.entity.SimulationState;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SimulationStateRepository extends JpaRepository<SimulationState, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select state from SimulationState state where state.id = :id")
    Optional<SimulationState> findLockedById(@Param("id") Long id);
}
