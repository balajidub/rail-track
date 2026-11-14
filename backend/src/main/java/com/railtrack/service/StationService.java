package com.railtrack.service;

import java.util.List;

import com.railtrack.dto.StationResponse;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.mapper.StationMapper;
import com.railtrack.repository.StationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StationService {

    private final StationRepository stationRepository;
    private final StationMapper stationMapper;

    public StationService(StationRepository stationRepository, StationMapper stationMapper) {
        this.stationRepository = stationRepository;
        this.stationMapper = stationMapper;
    }

    public List<StationResponse> findAll() {
        return stationRepository.findAllByOrderByNameAsc().stream()
                .map(stationMapper::toResponse)
                .toList();
    }

    public StationResponse findById(String id) {
        return stationRepository.findById(id)
                .map(stationMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + id));
    }
}
