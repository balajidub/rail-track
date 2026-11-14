package com.railtrack.dto;

import java.util.List;

public record TrainCoachOccupancyResponse(
        String trainId,
        String trainNumber,
        int trainOccupancyPercent,
        int averageOccupancyPercent,
        int overcrowdedCoaches,
        List<CoachOccupancyResponse> coaches) {
}
