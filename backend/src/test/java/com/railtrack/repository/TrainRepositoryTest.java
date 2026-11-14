package com.railtrack.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import com.railtrack.entity.Train;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;

@DataJpaTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase
class TrainRepositoryTest {

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void insertTrainWithOutOfOrderStops() {
        insertStation("NDLS", "New Delhi", new BigDecimal("28.642000"), new BigDecimal("77.219000"));
        insertStation("BPL", "Bhopal Junction", new BigDecimal("23.268000"), new BigDecimal("77.414000"));
        insertTrain();
        insertStop(1, "BPL", "14:00:00", null);
        insertStop(0, "NDLS", null, "08:00:00");
    }

    @Test
    void loadsStationsAndOrderedTrainStopsThroughRelationships() {
        Train train = trainRepository.findExpandedById("t-test").orElseThrow();

        assertThat(train.getOrigin().getName()).isEqualTo("New Delhi");
        assertThat(train.getDestination().getId()).isEqualTo("BPL");
        assertThat(train.getStops())
                .extracting(stop -> stop.getStation().getId())
                .containsExactly("NDLS", "BPL");
        assertThat(trainRepository.searchExpandedByTerm("bhopal"))
                .extracting(Train::getId)
                .containsExactly("t-test");
    }

    @Test
    void listsStationsInNameOrder() {
        assertThat(stationRepository.findAllByOrderByNameAsc())
                .extracting(station -> station.getId())
                .containsExactly("BPL", "NDLS");
    }

    private void insertStation(String id, String name, BigDecimal latitude, BigDecimal longitude) {
        jdbcTemplate.update("""
                INSERT INTO stations
                    (id, station_code, name, city, state, zone, latitude, longitude, platform_count, elevation_meters)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                id,
                id,
                name,
                id.equals("NDLS") ? "Delhi" : "Bhopal",
                id.equals("NDLS") ? "Delhi" : "Madhya Pradesh",
                id.equals("NDLS") ? "NR" : "WCR",
                latitude,
                longitude,
                6,
                200);
    }

    private void insertTrain() {
        jdbcTemplate.update("""
                INSERT INTO trains (
                    id, train_number, name, type, origin_station_id, destination_station_id,
                    scheduled_departure, scheduled_arrival, duration_minutes, status, delay_minutes,
                    speed_kph, current_station_id, next_station_id, progress, platform_number,
                    coach_count, occupancy_percent, distance_km, service_days
                ) VALUES (
                    't-test', '12345', 'Test Express', 'EXPRESS', 'NDLS', 'BPL',
                    '08:00:00', '14:00:00', 360, 'ON_TIME', 0,
                    100, 'NDLS', 'BPL', 0.2500, '1',
                    10, 70, 700, 'Daily'
                )
                """);
    }

    private void insertStop(int sequence, String stationId, String arrival, String departure) {
        jdbcTemplate.update("""
                INSERT INTO train_stops
                    (train_id, sequence_number, station_id, arrival_time, departure_time, platform_number, distance_km, halt_minutes)
                VALUES ('t-test', ?, ?, ?, ?, '1', ?, 0)
                """,
                sequence,
                stationId,
                arrival,
                departure,
                sequence * 350);
    }
}
