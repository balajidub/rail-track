package com.railtrack.dto;

import java.math.BigDecimal;

public record StationResponse(
        String id,
        String code,
        String name,
        String city,
        String state,
        String zone,
        BigDecimal lat,
        BigDecimal lng,
        int platforms,
        int elevationM) {
}
