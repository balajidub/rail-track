package com.railtrack.dto;

import java.time.Instant;
import java.util.List;

public record IncidentResponse(
        String id,
        String title,
        String description,
        String category,
        String severity,
        String priority,
        String status,
        String trainId,
        String stationId,
        String responseTeam,
        Instant createdAt,
        Instant updatedAt,
        List<IncidentHistoryResponse> history) {
}
