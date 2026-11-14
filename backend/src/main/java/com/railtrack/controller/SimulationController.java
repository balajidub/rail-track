package com.railtrack.controller;

import com.railtrack.dto.SimulationStatusResponse;
import com.railtrack.service.SimulationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/status")
    public SimulationStatusResponse status() {
        return simulationService.status();
    }

    @PostMapping("/start")
    public SimulationStatusResponse start() {
        return simulationService.start();
    }

    @PostMapping("/pause")
    public SimulationStatusResponse pause() {
        return simulationService.pause();
    }

    @PostMapping("/reset")
    public SimulationStatusResponse reset() {
        return simulationService.reset();
    }
}
