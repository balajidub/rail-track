package com.railtrack.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "simulation_state")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SimulationState {

    @Id
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 32)
    private String mode;

    @Column(nullable = false)
    private boolean running;

    @NotNull
    @Column(name = "simulated_at", nullable = false)
    private Instant simulatedAt;

    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private long version;
}
