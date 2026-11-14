package com.railtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentStatusRequest(
        @NotBlank @Size(max = 24) String status,
        Long responseTeamId) {
}
