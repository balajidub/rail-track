package com.railtrack.dto;

import jakarta.validation.constraints.NotBlank;

public record RouteComparisonRequest(@NotBlank String trainId) {
}
