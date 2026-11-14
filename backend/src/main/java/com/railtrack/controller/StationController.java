package com.railtrack.controller;

import java.util.List;

import com.railtrack.dto.StationResponse;
import com.railtrack.service.StationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public List<StationResponse> findAll() {
        return stationService.findAll();
    }

    @GetMapping("/{id}")
    public StationResponse findById(@PathVariable String id) {
        return stationService.findById(id);
    }
}
