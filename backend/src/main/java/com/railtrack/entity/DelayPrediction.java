package com.railtrack.entity;

import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.railtrack.entity.RailTrackEnums.PredictionRisk;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "delay_predictions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_prediction_train_time", columnNames = {"train_id", "predicted_at"})
})
@Getter
@Setter
@NoArgsConstructor
public class DelayPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "train_id", nullable = false)
    private Train train;

    @NotNull
    @Column(name = "predicted_at", nullable = false)
    private Instant predictedAt;

    @Min(0)
    @Max(100)
    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 16)
    private PredictionRisk riskLevel;

    @Min(0)
    @Column(name = "predicted_delay_minutes", nullable = false)
    private int predictedDelayMinutes;

    @Min(0)
    @Max(100)
    @Column(name = "confidence_percent", nullable = false)
    private int confidencePercent;

    @NotNull
    @Column(name = "estimated_arrival_time", nullable = false)
    private LocalTime estimatedArrivalTime;

    @ElementCollection
    @CollectionTable(name = "delay_prediction_factors", joinColumns = @JoinColumn(name = "prediction_id"))
    @OrderColumn(name = "factor_order")
    @Column(name = "factor", nullable = false, length = 500)
    private List<String> factors = new ArrayList<>();

    @Column(length = 1000)
    private String recommendation;
}
