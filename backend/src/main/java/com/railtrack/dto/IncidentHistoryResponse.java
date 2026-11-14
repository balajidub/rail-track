package com.railtrack.dto;

import java.time.Instant;

public record IncidentHistoryResponse(
        Instant timestamp,
        String note,
        String status) {
}
