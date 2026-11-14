package com.railtrack.repository;

import java.time.Instant;

import com.railtrack.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    boolean existsByStation_IdAndTitleAndCreatedAtAfter(String stationId, String title, Instant createdAt);
}
