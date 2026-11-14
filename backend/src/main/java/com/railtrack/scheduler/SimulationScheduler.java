package com.railtrack.scheduler;

import com.railtrack.service.SimulationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SimulationScheduler {

    private final SimulationService simulationService;

    public SimulationScheduler(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @Scheduled(fixedDelayString = "${railtrack.simulation.interval-ms:10000}")
    public void updateSimulation() {
        simulationService.advanceIfRunning();
    }
}
