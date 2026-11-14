package com.railtrack.repository;

import java.util.List;

import com.railtrack.entity.RailwayRoute;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RailwayRouteRepository extends JpaRepository<RailwayRoute, Long> {

    @EntityGraph(attributePaths = {"fromStation", "toStation"})
    List<RailwayRoute> findAllByActiveTrue();
}
