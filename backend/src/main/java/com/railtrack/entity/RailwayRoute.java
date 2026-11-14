package com.railtrack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "railway_routes", uniqueConstraints = {
        @UniqueConstraint(name = "uk_route_station_pair", columnNames = {"from_station_id", "to_station_id"})
}, indexes = {
        @Index(name = "idx_route_from_active", columnList = "from_station_id, active"),
        @Index(name = "idx_route_to", columnList = "to_station_id")
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RailwayRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "route_name", nullable = false, length = 120)
    private String name;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_station_id", nullable = false)
    private Station fromStation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_station_id", nullable = false)
    private Station toStation;

    @Min(1)
    @Column(name = "distance_km", nullable = false)
    private int distanceKm;

    @Min(1)
    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Min(0)
    @Column(name = "simulated_delay_minutes", nullable = false)
    private int simulatedDelayMinutes;

    @Column(nullable = false)
    private boolean active;
}
