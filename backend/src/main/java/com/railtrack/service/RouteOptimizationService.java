package com.railtrack.service;

import java.util.List;

import com.railtrack.dto.RailwayRouteResponse;
import com.railtrack.dto.RouteAlternativeResponse;
import com.railtrack.dto.RouteComparisonRequest;
import com.railtrack.dto.RouteComparisonResponse;
import com.railtrack.entity.RailwayRoute;
import com.railtrack.entity.Train;
import com.railtrack.exception.NoRouteException;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.intelligence.RouteOptimizationEngine;
import com.railtrack.repository.RailwayRouteRepository;
import com.railtrack.repository.TrainRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RouteOptimizationService {

    private static final String NOTICE =
            "Illustrative simulation only. Alternatives are not officially approved railway routes or dispatch guidance.";

    private final RailwayRouteRepository routeRepository;
    private final TrainRepository trainRepository;
    private final RouteOptimizationEngine routeEngine;

    public RouteOptimizationService(
            RailwayRouteRepository routeRepository,
            TrainRepository trainRepository,
            RouteOptimizationEngine routeEngine) {
        this.routeRepository = routeRepository;
        this.trainRepository = trainRepository;
        this.routeEngine = routeEngine;
    }

    public RouteComparisonResponse compare(RouteComparisonRequest request) {
        Train selectedTrain = trainRepository.findExpandedById(request.trainId())
                .orElseThrow(() -> new ResourceNotFoundException("Train not found: " + request.trainId()));
        List<Train> trains = trainRepository.findAllByOrderByNumberAsc();
        List<RouteAlternativeResponse> alternatives = routeEngine.compare(
                selectedTrain,
                trains,
                routeRepository.findAllByActiveTrue());
        if (alternatives.isEmpty()) {
            throw new NoRouteException("No simulated route connects the selected train's endpoints.");
        }
        return new RouteComparisonResponse(selectedTrain.getId(), alternatives, NOTICE);
    }

    public RailwayRouteResponse findById(Long id) {
        RailwayRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + id));
        return new RailwayRouteResponse(
                route.getId(),
                route.getName(),
                route.getFromStation().getId(),
                route.getToStation().getId(),
                route.getDistanceKm(),
                route.getDurationMinutes(),
                route.getSimulatedDelayMinutes(),
                route.isActive(),
                false);
    }
}
