package com.railtrack.entity;

import static com.railtrack.entity.RailTrackEnums.CongestionLevel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "platform_congestions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_snapshot_platform", columnNames = {"congestion_id", "platform_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class PlatformCongestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "congestion_id", nullable = false)
    private StationCongestion congestion;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "platform_id", nullable = false)
    private Platform platform;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "congestion_level", nullable = false, length = 16)
    private CongestionLevel level;

    @Min(0)
    @Max(100)
    @Column(name = "density_percent", nullable = false)
    private int densityPercent;

    @Min(0)
    @Column(name = "estimated_passengers", nullable = false)
    private int estimatedPassengers;
}
