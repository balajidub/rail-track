package com.railtrack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "response_teams", indexes = {
        @Index(name = "idx_response_team_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
public class ResponseTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "team_name", nullable = false, length = 120)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String specialty;

    @Column(nullable = false)
    private boolean active;
}
