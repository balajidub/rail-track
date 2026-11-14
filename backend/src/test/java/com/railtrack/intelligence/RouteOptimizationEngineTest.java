package com.railtrack.intelligence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import com.railtrack.dto.RouteAlternativeResponse;
import com.railtrack.entity.RailwayRoute;
import com.railtrack.entity.Station;
import com.railtrack.entity.Train;
import org.junit.jupiter.api.Test;

class RouteOptimizationEngineTest {

    private final RouteOptimizationEngine engine = new RouteOptimizationEngine();

    @Test
    void comparesShortestPathsAndNeverMarksThemOfficiallyApproved() {
        Train train = mock(Train.class);
        Station origin = station("NDLS");
        Station destination = station("MAS");
        when(train.getId()).thenReturn("t-1");
        when(train.getOrigin()).thenReturn(origin);
        when(train.getDestination()).thenReturn(destination);
        when(train.getStops()).thenReturn(List.of());

        List<RailwayRoute> graph = List.of(
                edge(1L, origin, station("BPL"), 100, 10),
                edge(2L, station("BPL"), destination, 100, 10),
                edge(3L, origin, station("AGC"), 130, 0),
                edge(4L, station("AGC"), destination, 130, 0));

        List<RouteAlternativeResponse> alternatives = engine.compare(train, List.of(train), graph);

        assertThat(alternatives).hasSize(2);
        assertThat(alternatives.get(0).recommended()).isTrue();
        assertThat(alternatives.get(0).durationMinutes()).isEqualTo(200);
        assertThat(alternatives.get(0).predictedDelayMinutes()).isEqualTo(20);
        assertThat(alternatives).allMatch(route -> !route.officiallyApproved());
        assertThat(alternatives.get(1).waypointId()).isEqualTo("AGC");
    }

    private Station station(String id) {
        Station station = mock(Station.class);
        when(station.getId()).thenReturn(id);
        return station;
    }

    private RailwayRoute edge(Long id, Station from, Station to, int duration, int delay) {
        RailwayRoute route = mock(RailwayRoute.class);
        when(route.getId()).thenReturn(id);
        when(route.getFromStation()).thenReturn(from);
        when(route.getToStation()).thenReturn(to);
        when(route.getDurationMinutes()).thenReturn(duration);
        when(route.getSimulatedDelayMinutes()).thenReturn(delay);
        return route;
    }
}
