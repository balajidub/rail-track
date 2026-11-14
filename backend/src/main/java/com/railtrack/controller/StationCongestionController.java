package com.railtrack.controller;

import java.util.List;

import com.railtrack.dto.StationCongestionResponse;
import com.railtrack.service.StationCongestionService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/stations/{stationId}/congestion")
public class StationCongestionController {

    private final StationCongestionService congestionService;

    public StationCongestionController(StationCongestionService congestionService) {
        this.congestionService = congestionService;
    }

    @GetMapping
    public StationCongestionResponse findLatest(@PathVariable String stationId) {
        return congestionService.findLatest(stationId);
    }

    @GetMapping("/history")
    public List<StationCongestionResponse> findHistory(
            @PathVariable String stationId,
            @RequestParam(defaultValue = "50") @Min(1) @Max(100) int limit) {
        return congestionService.findHistory(stationId, limit);
    }
}
