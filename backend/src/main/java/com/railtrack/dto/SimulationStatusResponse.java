package com.railtrack.dto;

import java.time.Instant;

public record SimulationStatusResponse(
        String mode,
        boolean running,
        Instant simulatedAt,
        Instant updatedAt,
        long version) {
}
