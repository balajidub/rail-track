package com.railtrack.dto;

import java.util.List;

public record DelayPredictionResponse(
        String trainId,
        int riskScore,
        String risk,
        int predictedDelayMinutes,
        int confidence,
        String estimatedArrival,
        List<String> factors,
        String recommendation,
        List<PredictionTrendPoint> trend) {
}
