package com.railtrack.entity;

import static com.railtrack.entity.RailTrackEnums.IncidentCategory;
import static com.railtrack.entity.RailTrackEnums.IncidentPriority;
import static com.railtrack.entity.RailTrackEnums.IncidentSeverity;
import static com.railtrack.entity.RailTrackEnums.IncidentStatus;

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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "incidents", indexes = {
        @Index(name = "idx_incident_status_severity", columnList = "status, severity"),
        @Index(name = "idx_incident_updated_at", columnList = "updated_at"),
        @Index(name = "idx_incident_train", columnList = "train_id"),
        @Index(name = "idx_incident_station", columnList = "station_id")
})
@Getter
@Setter
@NoArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private IncidentCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private IncidentSeverity severity;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private IncidentPriority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private IncidentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id")
    private Train train;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id")
    private Station station;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_team_id")
    private ResponseTeam responseTeam;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IncidentHistory> history = new ArrayList<>();
}
