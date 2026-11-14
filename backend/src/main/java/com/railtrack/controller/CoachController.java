package com.railtrack.controller;

import com.railtrack.dto.CoachOccupancyResponse;
import com.railtrack.dto.TrainCoachOccupancyResponse;
import com.railtrack.service.CoachOccupancyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CoachController {

    private final CoachOccupancyService occupancyService;

    public CoachController(CoachOccupancyService occupancyService) {
        this.occupancyService = occupancyService;
    }

    @GetMapping("/api/trains/{trainId}/coaches")
    public TrainCoachOccupancyResponse findForTrain(@PathVariable String trainId) {
        return occupancyService.findForTrain(trainId);
    }

    @GetMapping("/api/coaches/{id}/occupancy")
    public CoachOccupancyResponse findLatestForCoach(@PathVariable Long id) {
        return occupancyService.findLatestForCoach(id);
    }
}
