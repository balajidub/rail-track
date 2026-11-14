package com.railtrack.entity;

import static com.railtrack.entity.RailTrackEnums.CongestionLevel;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "station_congestions", indexes = {
        @Index(name = "idx_congestion_station_time", columnList = "station_id, recorded_at")
})
@Getter
@Setter
@NoArgsConstructor
public class StationCongestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "congestion_level", nullable = false, length = 16)
    private CongestionLevel level;

    @Min(0)
    @Column(name = "estimated_passengers", nullable = false)
    private int estimatedPassengers;

    @Min(0)
    @Column(name = "incoming_trains", nullable = false)
    private int incomingTrains;

    @Min(0)
    @Column(name = "outgoing_trains", nullable = false)
    private int outgoingTrains;

    @Min(0)
    @Column(name = "activity_score", nullable = false)
    private int activityScore;

    @NotNull
    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @OneToMany(mappedBy = "congestion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlatformCongestion> platformSnapshots = new ArrayList<>();
}
