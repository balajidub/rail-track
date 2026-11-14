package com.railtrack.dto;

import java.util.List;

public record RouteAlternativeResponse(
        String id,
        String label,
        String waypointId,
        int durationMinutes,
        int predictedDelayMinutes,
        int affectedStations,
        List<String> affectedTrains,
        String rationale,
        boolean recommended,
        boolean officiallyApproved) {
}
