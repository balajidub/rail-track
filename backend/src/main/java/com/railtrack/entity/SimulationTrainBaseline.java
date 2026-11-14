package com.railtrack.entity;

import static com.railtrack.entity.RailTrackEnums.TrainStatus;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "simulation_train_baselines")
@Getter
@Setter
@NoArgsConstructor
public class SimulationTrainBaseline {

    @Id
    @Column(name = "train_id", length = 32)
    private String id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "train_id", nullable = false)
    private Train train;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal progress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TrainStatus status;

    @Column(name = "delay_minutes", nullable = false)
    private int delayMinutes;

    @Column(name = "speed_kph", nullable = false)
    private int speedKph;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "current_station_id", nullable = false)
    private Station currentStation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "next_station_id", nullable = false)
    private Station nextStation;
}
