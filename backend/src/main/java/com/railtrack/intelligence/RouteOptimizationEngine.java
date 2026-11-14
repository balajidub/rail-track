package com.railtrack.intelligence;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;

import com.railtrack.dto.RouteAlternativeResponse;
import com.railtrack.entity.RailwayRoute;
import com.railtrack.entity.Train;
import org.springframework.stereotype.Component;

@Component
public class RouteOptimizationEngine {

    public List<RouteAlternativeResponse> compare(
            Train selectedTrain,
            List<Train> allTrains,
            List<RailwayRoute> routes) {
        Map<String, List<RailwayRoute>> outgoing = new HashMap<>();
        for (RailwayRoute route : routes) {
            outgoing.computeIfAbsent(route.getFromStation().getId(), ignored -> new ArrayList<>()).add(route);
        }

        RoutePath primary = shortestPath(
                selectedTrain.getOrigin().getId(),
                selectedTrain.getDestination().getId(),
                outgoing,
                Set.of());
        if (primary == null) {
            return List.of();
        }

        Map<String, RoutePath> paths = new HashMap<>();
        paths.put(primary.key(), primary);
        for (RailwayRoute edge : primary.edges()) {
            RoutePath alternative = shortestPath(
                    selectedTrain.getOrigin().getId(),
                    selectedTrain.getDestination().getId(),
                    outgoing,
                    Set.of(edge.getId()));
            if (alternative != null) {
                paths.putIfAbsent(alternative.key(), alternative);
            }
        }

        List<RoutePath> ordered = paths.values().stream()
                .sorted(Comparator.comparingInt(RoutePath::totalCost).thenComparing(RoutePath::key))
                .limit(3)
                .toList();
        return ordered.stream()
                .map(path -> toResponse(path, selectedTrain, allTrains, path.key().equals(ordered.get(0).key())))
                .toList();
    }

    private RoutePath shortestPath(
            String origin,
            String destination,
            Map<String, List<RailwayRoute>> outgoing,
            Set<Long> excludedRouteIds) {
        Map<String, Integer> distances = new HashMap<>();
        Map<String, RailwayRoute> previousEdges = new HashMap<>();
        PriorityQueue<QueueEntry> queue = new PriorityQueue<>(Comparator.comparingInt(QueueEntry::cost));
        distances.put(origin, 0);
        queue.add(new QueueEntry(origin, 0));

        while (!queue.isEmpty()) {
            QueueEntry current = queue.poll();
            if (current.cost() != distances.getOrDefault(current.stationId(), Integer.MAX_VALUE)) continue;
            if (current.stationId().equals(destination)) break;
            for (RailwayRoute route : outgoing.getOrDefault(current.stationId(), List.of())) {
                if (excludedRouteIds.contains(route.getId())) continue;
                String next = route.getToStation().getId();
                int candidate = current.cost() + route.getDurationMinutes() + route.getSimulatedDelayMinutes();
                if (candidate < distances.getOrDefault(next, Integer.MAX_VALUE)) {
                    distances.put(next, candidate);
                    previousEdges.put(next, route);
                    queue.add(new QueueEntry(next, candidate));
                }
            }
        }

        if (!distances.containsKey(destination)) return null;
        List<RailwayRoute> reversed = new ArrayList<>();
        String current = destination;
        while (!current.equals(origin)) {
            RailwayRoute previous = previousEdges.get(current);
            if (previous == null) return null;
            reversed.add(previous);
            current = previous.getFromStation().getId();
        }
        java.util.Collections.reverse(reversed);
        return new RoutePath(reversed);
    }

    private RouteAlternativeResponse toResponse(
            RoutePath path,
            Train selectedTrain,
            List<Train> allTrains,
            boolean recommended) {
        List<String> stationIds = path.stationIds();
        Set<String> routeStations = new HashSet<>(stationIds);
        List<String> affectedTrains = allTrains.stream()
                .filter(train -> !train.getId().equals(selectedTrain.getId()))
                .filter(train -> train.getStops().stream()
                        .anyMatch(stop -> routeStations.contains(stop.getStation().getId())))
                .map(Train::getNumber)
                .distinct()
                .toList();
        String waypoint = stationIds.size() > 2 ? stationIds.get(1) : null;
        String label = waypoint == null ? "Direct simulated path" : "Scenario via " + waypoint;
        String rationale = "Dijkstra compared simulated travel minutes plus delay impact. "
                + "Track connectivity and operational feasibility are not verified.";
        return new RouteAlternativeResponse(
                path.key(),
                label,
                waypoint,
                path.durationMinutes(),
                path.delayMinutes(),
                stationIds.size(),
                affectedTrains,
                rationale,
                recommended,
                false);
    }

    private record QueueEntry(String stationId, int cost) {
    }

    private record RoutePath(List<RailwayRoute> edges) {
        private int durationMinutes() {
            return edges.stream().mapToInt(RailwayRoute::getDurationMinutes).sum();
        }

        private int delayMinutes() {
            return edges.stream().mapToInt(RailwayRoute::getSimulatedDelayMinutes).sum();
        }

        private int totalCost() {
            return durationMinutes() + delayMinutes();
        }

        private List<String> stationIds() {
            if (edges.isEmpty()) return List.of();
            List<String> result = new ArrayList<>();
            result.add(edges.get(0).getFromStation().getId());
            edges.forEach(edge -> result.add(edge.getToStation().getId()));
            return result;
        }

        private String key() {
            return edges.stream()
                    .map(edge -> String.valueOf(edge.getId()))
                    .collect(java.util.stream.Collectors.joining("-"));
        }
    }
}
