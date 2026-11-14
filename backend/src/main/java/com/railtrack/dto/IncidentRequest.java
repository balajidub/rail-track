package com.railtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentRequest(
        @NotBlank @Size(max = 100) String title,
        @NotBlank @Size(max = 1000) String description,
        @NotBlank @Size(max = 40) String category,
        @NotBlank @Size(max = 16) String severity,
        @NotBlank @Size(max = 16) String priority,
        String trainId,
        String stationId) {
}
