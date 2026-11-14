package com.railtrack.controller;

import java.util.List;

import com.railtrack.dto.DelayPredictionResponse;
import com.railtrack.service.DelayPredictionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private final DelayPredictionService predictionService;

    public PredictionController(DelayPredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping
    public List<DelayPredictionResponse> findAll() {
        return predictionService.findAll();
    }

    @GetMapping("/{trainId}")
    public DelayPredictionResponse findByTrainId(@PathVariable String trainId) {
        return predictionService.findByTrainId(trainId);
    }
}
