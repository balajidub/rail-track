package com.railtrack.dto;

import java.util.List;

public record RouteComparisonResponse(
        String trainId,
        List<RouteAlternativeResponse> alternatives,
        String notice) {
}
