package com.railtrack.dto;

import java.util.List;

public record PlatformCongestionResponse(
        int platform,
        String level,
        int densityPercent,
        int estimatedPassengers,
        List<String> trainNumbers) {
}
