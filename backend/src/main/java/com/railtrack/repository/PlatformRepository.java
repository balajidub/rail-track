package com.railtrack.repository;

import java.util.List;

import com.railtrack.entity.Platform;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformRepository extends JpaRepository<Platform, Long> {

    @EntityGraph(attributePaths = "station")
    List<Platform> findAllByOrderByStation_IdAscPlatformNumberAsc();
}
