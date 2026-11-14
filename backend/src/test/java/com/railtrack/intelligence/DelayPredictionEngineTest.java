package com.railtrack.intelligence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

import com.railtrack.dto.DelayPredictionResponse;
import com.railtrack.entity.RailTrackEnums.TrainStatus;
import com.railtrack.entity.Train;
import org.junit.jupiter.api.Test;

class DelayPredictionEngineTest {

    private final DelayPredictionEngine engine = new DelayPredictionEngine();

    @Test
    void producesBoundedExplainableCriticalRiskFromElevatedIndicators() {
        Train train = train("t-delay", TrainStatus.DELAYED, 100, 95, 60, 0.9, List.of());

        DelayPredictionResponse result = engine.predict(train, List.of(train));

        assertThat(result.riskScore()).isBetween(0, 100);
        assertThat(result.risk()).isEqualTo("Critical");
        assertThat(result.predictedDelayMinutes()).isEqualTo(100);
        assertThat(result.factors())
                .anyMatch(factor -> factor.contains("Existing delay"))
                .anyMatch(factor -> factor.contains("High simulated occupancy"))
                .anyMatch(factor -> factor.contains("Reduced simulated speed"));
        assertThat(result.estimatedArrival()).isEqualTo("09:40");
    }

    @Test
    void returnsLowRiskForAnUnimpededSimulatedTrain() {
        Train train = train("t-on-time", TrainStatus.ON_TIME, 0, 60, 110, 0.2, List.of());

        DelayPredictionResponse result = engine.predict(train, List.of(train));

        assertThat(result.risk()).isEqualTo("Low");
        assertThat(result.riskScore()).isEqualTo(5);
        assertThat(result.predictedDelayMinutes()).isEqualTo(2);
        assertThat(result.factors())
                .contains("No elevated indicators in the current simulation")
                .anyMatch(factor -> factor.contains("Weather observations are unavailable"));
    }

    private Train train(
            String id,
            TrainStatus status,
            int delay,
            int occupancy,
            int speed,
            double progress,
            List<com.railtrack.entity.TrainStop> stops) {
        Train train = mock(Train.class);
        when(train.getId()).thenReturn(id);
        when(train.getStatus()).thenReturn(status);
        when(train.getDelayMinutes()).thenReturn(delay);
        when(train.getOccupancyPercent()).thenReturn(occupancy);
        when(train.getSpeedKph()).thenReturn(speed);
        when(train.getProgress()).thenReturn(BigDecimal.valueOf(progress));
        when(train.getScheduledArrival()).thenReturn(LocalTime.of(8, 0));
        when(train.getStops()).thenReturn(stops);
        return train;
    }
}
