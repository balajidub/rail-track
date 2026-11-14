package com.railtrack.dto;

import java.time.Instant;

public record CoachOccupancyResponse(
        Long coachId,
        String coach,
        int occupancyPercent,
        String level,
        int estimatedPassengers,
        Instant recordedAt) {
}
