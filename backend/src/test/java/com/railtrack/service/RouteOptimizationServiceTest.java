package com.railtrack.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import java.util.List;
import java.util.Optional;

import com.railtrack.dto.RouteComparisonRequest;
import com.railtrack.entity.Train;
import com.railtrack.intelligence.RouteOptimizationEngine;
import com.railtrack.repository.RailwayRouteRepository;
import com.railtrack.repository.TrainRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RouteOptimizationServiceTest {

    private RailwayRouteRepository routeRepository;
    private TrainRepository trainRepository;
    private RouteOptimizationEngine routeEngine;
    private RouteOptimizationService routeService;

    @BeforeEach
    void setUp() {
        routeRepository = mock(RailwayRouteRepository.class);
        trainRepository = mock(TrainRepository.class);
        routeEngine = mock(RouteOptimizationEngine.class);
        routeService = new RouteOptimizationService(routeRepository, trainRepository, routeEngine);
    }

    @Test
    void returnsEmptyAlternativesWhenNoRouteConnectsTrainEndpoints() {
        Train train = mock(Train.class);
        given(train.getId()).willReturn("t-demo-1001");
        given(trainRepository.findExpandedById("t-demo-1001")).willReturn(Optional.of(train));
        given(trainRepository.findAllByOrderByNumberAsc()).willReturn(List.of(train));
        given(routeRepository.findAllByActiveTrue()).willReturn(List.of());
        given(routeEngine.compare(train, List.of(train), List.of())).willReturn(List.of());

        var response = routeService.compare(new RouteComparisonRequest("t-demo-1001"));

        assertThat(response.trainId()).isEqualTo("t-demo-1001");
        assertThat(response.alternatives()).isEmpty();
    }
}
