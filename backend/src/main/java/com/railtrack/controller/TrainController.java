package com.railtrack.controller;

import java.util.List;

import com.railtrack.dto.TrainResponse;
import com.railtrack.dto.TrainStopResponse;
import com.railtrack.service.TrainService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/trains")
public class TrainController {

    private final TrainService trainService;

    public TrainController(TrainService trainService) {
        this.trainService = trainService;
    }

    @GetMapping
    public List<TrainResponse> findAll() {
        return trainService.findAll();
    }

    @GetMapping("/search")
    public List<TrainResponse> search(
            @RequestParam("q") @NotBlank @Size(max = 100) String query) {
        return trainService.search(query);
    }

    @GetMapping("/{id}/stops")
    public List<TrainStopResponse> findStops(@PathVariable String id) {
        return trainService.findStops(id);
    }

    @GetMapping("/{id}")
    public TrainResponse findById(@PathVariable String id) {
        return trainService.findById(id);
    }
}
