package com.railtrack.controller;

import com.railtrack.dto.RailwayRouteResponse;
import com.railtrack.dto.RouteComparisonRequest;
import com.railtrack.dto.RouteComparisonResponse;
import com.railtrack.service.RouteOptimizationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteOptimizationService routeService;

    public RouteController(RouteOptimizationService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/compare")
    public RouteComparisonResponse compare(@Valid @RequestBody RouteComparisonRequest request) {
        return routeService.compare(request);
    }

    @GetMapping("/{id}")
    public RailwayRouteResponse findById(@PathVariable Long id) {
        return routeService.findById(id);
    }
}
