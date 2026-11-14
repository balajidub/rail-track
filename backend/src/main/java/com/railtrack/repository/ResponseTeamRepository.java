package com.railtrack.repository;

import java.util.Optional;

import com.railtrack.entity.ResponseTeam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponseTeamRepository extends JpaRepository<ResponseTeam, Long> {

    Optional<ResponseTeam> findFirstByActiveTrueAndSpecialtyContainingIgnoreCaseOrderByIdAsc(String specialty);

    Optional<ResponseTeam> findFirstByActiveTrueOrderByIdAsc();
}
