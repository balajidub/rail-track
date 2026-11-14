package com.railtrack.entity;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.railtrack.entity.RailTrackEnums.TrainStatus;
import com.railtrack.entity.RailTrackEnums.TrainType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "trains", uniqueConstraints = {
        @UniqueConstraint(name = "uk_train_number", columnNames = "train_number")
}, indexes = {
        @Index(name = "idx_train_status", columnList = "status"),
        @Index(name = "idx_train_current_station", columnList = "current_station_id"),
        @Index(name = "idx_train_next_station", columnList = "next_station_id")
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Train {

    @Id
    @Column(length = 32)
    private String id;

    @NotBlank
    @Column(name = "train_number", nullable = false, length = 16)
    private String number;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private TrainType type;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "origin_station_id", nullable = false)
    private Station origin;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_station_id", nullable = false)
    private Station destination;

    @NotNull
    @Column(name = "scheduled_departure", nullable = false)
    private LocalTime scheduledDeparture;

    @NotNull
    @Column(name = "scheduled_arrival", nullable = false)
    private LocalTime scheduledArrival;

    @Min(0)
    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TrainStatus status;

    @PositiveOrZero
    @Column(name = "delay_minutes", nullable = false)
    private int delayMinutes;

    @Min(0)
    @Column(name = "speed_kph", nullable = false)
    private int speedKph;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "current_station_id", nullable = false)
    private Station currentStation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "next_station_id", nullable = false)
    private Station nextStation;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal progress;

    @NotBlank
    @Column(name = "platform_number", nullable = false, length = 8)
    private String platformNumber;

    @Min(0)
    @Column(name = "coach_count", nullable = false)
    private int coachCount;

    @Min(0)
    @Max(100)
    @Column(name = "occupancy_percent", nullable = false)
    private int occupancyPercent;

    @PositiveOrZero
    @Column(name = "distance_km", nullable = false)
    private int distanceKm;

    @NotBlank
    @Column(name = "service_days", nullable = false, length = 64)
    private String serviceDays;

    @OneToMany(mappedBy = "train")
    @OrderBy("sequenceNumber ASC")
    private List<TrainStop> stops = new ArrayList<>();
}
