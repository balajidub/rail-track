package com.railtrack.entity;

import static com.railtrack.entity.RailTrackEnums.CoachOccupancyLevel;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coach_occupancies", indexes = {
        @Index(name = "idx_coach_occupancy_time", columnList = "coach_id, recorded_at")
})
@Getter
@Setter
@NoArgsConstructor
public class CoachOccupancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_id", nullable = false)
    private Coach coach;

    @Min(0)
    @Max(100)
    @Column(name = "occupancy_percent", nullable = false)
    private int occupancyPercent;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "occupancy_level", nullable = false, length = 16)
    private CoachOccupancyLevel level;

    @Min(0)
    @Column(name = "estimated_passengers", nullable = false)
    private int estimatedPassengers;

    @NotNull
    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
}
