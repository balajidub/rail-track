package com.railtrack.intelligence;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.railtrack.dto.DelayPredictionResponse;
import com.railtrack.dto.PredictionTrendPoint;
import com.railtrack.entity.RailTrackEnums.PredictionRisk;
import com.railtrack.entity.RailTrackEnums.TrainStatus;
import com.railtrack.entity.Train;
import org.springframework.stereotype.Component;

@Component
public class DelayPredictionEngine {

    public DelayPredictionResponse predict(Train train, List<Train> allTrains) {
        int sharedServices = (int) allTrains.stream()
                .filter(other -> !other.getId().equals(train.getId()))
                .filter(other -> other.getStops().stream().anyMatch(otherStop ->
                        train.getStops().stream().anyMatch(stop ->
                                stop.getStation().getId().equals(otherStop.getStation().getId()))))
                .count();

        int score = switch (train.getStatus()) {
            case CANCELLED -> 100;
            case ARRIVED -> 8;
            default -> bounded((int) Math.round(
                    train.getDelayMinutes() * 0.8
                            + Math.max(0, train.getOccupancyPercent() - 65) * 0.42
                            + (train.getSpeedKph() < 70 ? 18 : train.getSpeedKph() < 95 ? 8 : 0)
                            + Math.min(sharedServices * 2, 12)
                            + (train.getProgress().doubleValue() > 0.85 && train.getDelayMinutes() > 0 ? 8 : 0)),
                    5,
                    98);
        };

        List<String> factors = factorsFor(train, sharedServices);
        boolean hasElevatedIndicators = !factors.isEmpty();
        if (factors.isEmpty()) {
            factors = List.of("No elevated indicators in the current simulation");
        }
        if (train.getStatus() != TrainStatus.ARRIVED && train.getStatus() != TrainStatus.CANCELLED) {
            factors = append(factors, "Weather observations are unavailable and are not included in this estimate");
        }

        PredictionRisk risk = riskFor(score);
        int predictedDelayMinutes = train.getStatus() == TrainStatus.CANCELLED
                ? 0
                : train.getStatus() == TrainStatus.ARRIVED
                        ? train.getDelayMinutes()
                        : Math.max(train.getDelayMinutes(), (int) Math.round(score * 0.42));
        LocalTime arrival = train.getScheduledArrival().plusMinutes(predictedDelayMinutes);
        int confidence = bounded(
                70 + (int) Math.round(train.getProgress().doubleValue() * 12) - (hasElevatedIndicators ? 0 : 8),
                55,
                94);

        return new DelayPredictionResponse(
                train.getId(),
                score,
                displayRisk(risk),
                predictedDelayMinutes,
                confidence,
                arrival.toString().substring(0, 5),
                factors,
                recommendationFor(risk),
                List.of(
                        new PredictionTrendPoint("−30m", bounded(score - 12, 0, 100)),
                        new PredictionTrendPoint("−20m", bounded(score - 7, 0, 100)),
                        new PredictionTrendPoint("−10m", bounded(score - 3, 0, 100)),
                        new PredictionTrendPoint("Now", score)));
    }

    private List<String> factorsFor(Train train, int sharedServices) {
        List<String> factors = new ArrayList<>();
        if (train.getDelayMinutes() > 0) {
            factors.add("Existing delay of " + train.getDelayMinutes() + " minutes");
        }
        if (train.getOccupancyPercent() >= 85) {
            factors.add("High simulated occupancy (" + train.getOccupancyPercent() + "%)");
        }
        if (sharedServices > 1) {
            factors.add("Potential corridor congestion: " + sharedServices
                    + " simulated services share listed stops");
        }
        if (train.getSpeedKph() > 0 && train.getSpeedKph() < 90) {
            factors.add("Reduced simulated speed (" + train.getSpeedKph()
                    + " km/h); a section restriction is possible but unconfirmed");
        }
        if (train.getProgress().doubleValue() > 0.8 && train.getDelayMinutes() > 0) {
            factors.add("Limited recovery time near destination");
        }
        return factors;
    }

    private List<String> append(List<String> values, String value) {
        ArrayList<String> result = new ArrayList<>(values);
        result.add(value);
        return result;
    }

    private PredictionRisk riskFor(int score) {
        if (score >= 80) return PredictionRisk.CRITICAL;
        if (score >= 60) return PredictionRisk.HIGH;
        if (score >= 35) return PredictionRisk.MEDIUM;
        return PredictionRisk.LOW;
    }

    private String displayRisk(PredictionRisk risk) {
        return switch (risk) {
            case LOW -> "Low";
            case MEDIUM -> "Medium";
            case HIGH -> "High";
            case CRITICAL -> "Critical";
        };
    }

    private String recommendationFor(PredictionRisk risk) {
        return switch (risk) {
            case LOW -> "Continue routine monitoring; no additional simulated intervention indicated.";
            case MEDIUM -> "Review the next scheduled stop and monitor for a change in running time.";
            case HIGH -> "Prioritize a corridor review and check connecting service impacts.";
            case CRITICAL -> "Escalate to the simulation control desk for immediate scenario review.";
        };
    }

    private int bounded(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
