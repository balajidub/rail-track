package com.railtrack.repository;

import java.util.List;

import com.railtrack.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationRepository extends JpaRepository<Station, String> {

    List<Station> findAllByOrderByNameAsc();
}
