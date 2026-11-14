package com.railtrack.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(name = "stations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_station_code", columnNames = "station_code")
}, indexes = {
        @Index(name = "idx_station_name", columnList = "name"),
        @Index(name = "idx_station_city", columnList = "city")
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Station {

    @Id
    @Column(length = 16)
    private String id;

    @NotBlank
    @Column(name = "station_code", nullable = false, length = 16)
    private String code;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String city;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String state;

    @NotBlank
    @Column(nullable = false, length = 16)
    private String zone;

    @NotNull
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @NotNull
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    @Min(0)
    @Column(name = "platform_count", nullable = false)
    private int platformCount;

    @Column(name = "elevation_meters", nullable = false)
    private int elevationMeters;
}
