package com.railtrack.dto;

import java.time.Instant;
import java.util.List;

public record StationCongestionResponse(
        String stationId,
        String level,
        int estimatedPassengers,
        int incomingTrains,
        int outgoingTrains,
        int activityScore,
        Instant recordedAt,
        List<PlatformCongestionResponse> platforms) {
}
