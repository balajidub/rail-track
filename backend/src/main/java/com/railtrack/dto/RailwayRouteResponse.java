package com.railtrack.dto;

public record RailwayRouteResponse(
        Long id,
        String name,
        String fromStationId,
        String toStationId,
        int distanceKm,
        int durationMinutes,
        int simulatedDelayMinutes,
        boolean active,
        boolean officiallyApproved) {
}
