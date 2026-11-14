package com.railtrack.controller;

import com.railtrack.dto.ApiHealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ApiHealthResponse getHealth() {
        return new ApiHealthResponse("UP", "DEMO SIMULATION");
    }
}
