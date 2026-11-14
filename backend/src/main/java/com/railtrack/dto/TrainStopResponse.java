package com.railtrack.dto;

public record TrainStopResponse(
        String stationId,
        String arrival,
        String departure,
        String platform,
        int distanceKm,
        int haltMin) {
}
