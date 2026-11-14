package com.railtrack.dto;

import java.util.List;

public record TrainResponse(
        String id,
        String number,
        String name,
        String type,
        String from,
        String to,
        String departure,
        String arrival,
        String duration,
        String status,
        int delayMinutes,
        int speed,
        String currentStationId,
        String nextStationId,
        double progress,
        String platform,
        int coaches,
        int occupancy,
        int distanceKm,
        String days,
        List<TrainStopResponse> stops) {
}
