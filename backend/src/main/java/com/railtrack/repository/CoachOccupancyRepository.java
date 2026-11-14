package com.railtrack.repository;

import java.util.Optional;

import com.railtrack.entity.CoachOccupancy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachOccupancyRepository extends JpaRepository<CoachOccupancy, Long> {

    Optional<CoachOccupancy> findTopByCoach_IdOrderByRecordedAtDesc(Long coachId);
}
