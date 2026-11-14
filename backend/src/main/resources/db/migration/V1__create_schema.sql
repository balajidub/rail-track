CREATE TABLE stations (
    id VARCHAR(16) NOT NULL,
    station_code VARCHAR(16) NOT NULL,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    zone VARCHAR(16) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    platform_count INT NOT NULL,
    elevation_meters INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_station_code UNIQUE (station_code),
    INDEX idx_station_name (name),
    INDEX idx_station_city (city)
) ENGINE=InnoDB;

CREATE TABLE trains (
    id VARCHAR(32) NOT NULL,
    train_number VARCHAR(16) NOT NULL,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(24) NOT NULL,
    origin_station_id VARCHAR(16) NOT NULL,
    destination_station_id VARCHAR(16) NOT NULL,
    scheduled_departure TIME NOT NULL,
    scheduled_arrival TIME NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(16) NOT NULL,
    delay_minutes INT NOT NULL,
    speed_kph INT NOT NULL,
    current_station_id VARCHAR(16) NOT NULL,
    next_station_id VARCHAR(16) NOT NULL,
    progress DECIMAL(5, 4) NOT NULL,
    platform_number VARCHAR(8) NOT NULL,
    coach_count INT NOT NULL,
    occupancy_percent INT NOT NULL,
    distance_km INT NOT NULL,
    service_days VARCHAR(64) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_train_number UNIQUE (train_number),
    INDEX idx_train_status (status),
    INDEX idx_train_current_station (current_station_id),
    INDEX idx_train_next_station (next_station_id),
    CONSTRAINT fk_train_origin FOREIGN KEY (origin_station_id) REFERENCES stations (id),
    CONSTRAINT fk_train_destination FOREIGN KEY (destination_station_id) REFERENCES stations (id),
    CONSTRAINT fk_train_current_station FOREIGN KEY (current_station_id) REFERENCES stations (id),
    CONSTRAINT fk_train_next_station FOREIGN KEY (next_station_id) REFERENCES stations (id)
) ENGINE=InnoDB;

CREATE TABLE train_stops (
    id BIGINT NOT NULL AUTO_INCREMENT,
    train_id VARCHAR(32) NOT NULL,
    sequence_number INT NOT NULL,
    station_id VARCHAR(16) NOT NULL,
    arrival_time TIME NULL,
    departure_time TIME NULL,
    platform_number VARCHAR(8) NOT NULL,
    distance_km INT NOT NULL,
    halt_minutes INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_train_stop_sequence UNIQUE (train_id, sequence_number),
    INDEX idx_train_stop_station (station_id),
    CONSTRAINT fk_train_stop_train FOREIGN KEY (train_id) REFERENCES trains (id),
    CONSTRAINT fk_train_stop_station FOREIGN KEY (station_id) REFERENCES stations (id)
) ENGINE=InnoDB;

CREATE TABLE delay_predictions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    train_id VARCHAR(32) NOT NULL,
    predicted_at TIMESTAMP(6) NOT NULL,
    risk_score INT NOT NULL,
    risk_level VARCHAR(16) NOT NULL,
    predicted_delay_minutes INT NOT NULL,
    confidence_percent INT NOT NULL,
    estimated_arrival_time TIME NOT NULL,
    recommendation VARCHAR(1000) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_prediction_train_time UNIQUE (train_id, predicted_at),
    CONSTRAINT fk_prediction_train FOREIGN KEY (train_id) REFERENCES trains (id)
) ENGINE=InnoDB;

CREATE TABLE delay_prediction_factors (
    prediction_id BIGINT NOT NULL,
    factor_order INT NOT NULL,
    factor VARCHAR(500) NOT NULL,
    PRIMARY KEY (prediction_id, factor_order),
    CONSTRAINT fk_prediction_factor FOREIGN KEY (prediction_id) REFERENCES delay_predictions (id)
) ENGINE=InnoDB;

CREATE TABLE station_congestions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    station_id VARCHAR(16) NOT NULL,
    congestion_level VARCHAR(16) NOT NULL,
    estimated_passengers INT NOT NULL,
    incoming_trains INT NOT NULL,
    outgoing_trains INT NOT NULL,
    activity_score INT NOT NULL,
    recorded_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_congestion_station_time (station_id, recorded_at),
    CONSTRAINT fk_congestion_station FOREIGN KEY (station_id) REFERENCES stations (id)
) ENGINE=InnoDB;

CREATE TABLE platforms (
    id BIGINT NOT NULL AUTO_INCREMENT,
    station_id VARCHAR(16) NOT NULL,
    platform_number INT NOT NULL,
    capacity INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_platform_station_number UNIQUE (station_id, platform_number),
    CONSTRAINT fk_platform_station FOREIGN KEY (station_id) REFERENCES stations (id)
) ENGINE=InnoDB;

CREATE TABLE platform_congestions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    congestion_id BIGINT NOT NULL,
    platform_id BIGINT NOT NULL,
    congestion_level VARCHAR(16) NOT NULL,
    density_percent INT NOT NULL,
    estimated_passengers INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_snapshot_platform UNIQUE (congestion_id, platform_id),
    CONSTRAINT fk_platform_congestion_snapshot FOREIGN KEY (congestion_id) REFERENCES station_congestions (id),
    CONSTRAINT fk_platform_congestion_platform FOREIGN KEY (platform_id) REFERENCES platforms (id)
) ENGINE=InnoDB;

CREATE TABLE response_teams (
    id BIGINT NOT NULL AUTO_INCREMENT,
    team_name VARCHAR(120) NOT NULL,
    specialty VARCHAR(80) NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_response_team_active (active)
) ENGINE=InnoDB;

CREATE TABLE incidents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    category VARCHAR(40) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    priority VARCHAR(16) NOT NULL,
    status VARCHAR(24) NOT NULL,
    train_id VARCHAR(32) NULL,
    station_id VARCHAR(16) NULL,
    response_team_id BIGINT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_incident_status_severity (status, severity),
    INDEX idx_incident_updated_at (updated_at),
    INDEX idx_incident_train (train_id),
    INDEX idx_incident_station (station_id),
    CONSTRAINT fk_incident_train FOREIGN KEY (train_id) REFERENCES trains (id),
    CONSTRAINT fk_incident_station FOREIGN KEY (station_id) REFERENCES stations (id),
    CONSTRAINT fk_incident_response_team FOREIGN KEY (response_team_id) REFERENCES response_teams (id)
) ENGINE=InnoDB;

CREATE TABLE incident_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    incident_id BIGINT NOT NULL,
    status VARCHAR(24) NOT NULL,
    note VARCHAR(500) NOT NULL,
    occurred_at TIMESTAMP(6) NOT NULL,
    actor VARCHAR(80) NULL,
    PRIMARY KEY (id),
    INDEX idx_incident_history_time (incident_id, occurred_at),
    CONSTRAINT fk_incident_history_incident FOREIGN KEY (incident_id) REFERENCES incidents (id)
) ENGINE=InnoDB;

CREATE TABLE coaches (
    id BIGINT NOT NULL AUTO_INCREMENT,
    train_id VARCHAR(32) NOT NULL,
    coach_number VARCHAR(12) NOT NULL,
    coach_type VARCHAR(32) NOT NULL,
    capacity INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_coach_train_number UNIQUE (train_id, coach_number),
    CONSTRAINT fk_coach_train FOREIGN KEY (train_id) REFERENCES trains (id)
) ENGINE=InnoDB;

CREATE TABLE coach_occupancies (
    id BIGINT NOT NULL AUTO_INCREMENT,
    coach_id BIGINT NOT NULL,
    occupancy_percent INT NOT NULL,
    occupancy_level VARCHAR(16) NOT NULL,
    estimated_passengers INT NOT NULL,
    recorded_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_coach_occupancy_time (coach_id, recorded_at),
    CONSTRAINT fk_coach_occupancy_coach FOREIGN KEY (coach_id) REFERENCES coaches (id)
) ENGINE=InnoDB;

CREATE TABLE railway_routes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    route_name VARCHAR(120) NOT NULL,
    from_station_id VARCHAR(16) NOT NULL,
    to_station_id VARCHAR(16) NOT NULL,
    distance_km INT NOT NULL,
    duration_minutes INT NOT NULL,
    simulated_delay_minutes INT NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_route_station_pair UNIQUE (from_station_id, to_station_id),
    INDEX idx_route_from_active (from_station_id, active),
    INDEX idx_route_to (to_station_id),
    CONSTRAINT fk_route_from_station FOREIGN KEY (from_station_id) REFERENCES stations (id),
    CONSTRAINT fk_route_to_station FOREIGN KEY (to_station_id) REFERENCES stations (id)
) ENGINE=InnoDB;

CREATE TABLE simulation_state (
    id BIGINT NOT NULL,
    mode VARCHAR(32) NOT NULL,
    running BOOLEAN NOT NULL,
    simulated_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE alerts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(120) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    is_read BOOLEAN NOT NULL,
    train_id VARCHAR(32) NULL,
    station_id VARCHAR(16) NULL,
    incident_id BIGINT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_alert_read_created (is_read, created_at),
    INDEX idx_alert_train (train_id),
    CONSTRAINT fk_alert_train FOREIGN KEY (train_id) REFERENCES trains (id),
    CONSTRAINT fk_alert_station FOREIGN KEY (station_id) REFERENCES stations (id),
    CONSTRAINT fk_alert_incident FOREIGN KEY (incident_id) REFERENCES incidents (id)
) ENGINE=InnoDB;
