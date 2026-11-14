ALTER TABLE incidents
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE simulation_train_baselines (
    train_id VARCHAR(32) NOT NULL,
    progress DECIMAL(5, 4) NOT NULL,
    status VARCHAR(16) NOT NULL,
    delay_minutes INT NOT NULL,
    speed_kph INT NOT NULL,
    current_station_id VARCHAR(16) NOT NULL,
    next_station_id VARCHAR(16) NOT NULL,
    PRIMARY KEY (train_id),
    CONSTRAINT fk_baseline_train FOREIGN KEY (train_id) REFERENCES trains (id),
    CONSTRAINT fk_baseline_current_station FOREIGN KEY (current_station_id) REFERENCES stations (id),
    CONSTRAINT fk_baseline_next_station FOREIGN KEY (next_station_id) REFERENCES stations (id)
) ENGINE=InnoDB;

INSERT INTO simulation_train_baselines (
    train_id, progress, status, delay_minutes, speed_kph, current_station_id, next_station_id
)
SELECT id, progress, status, delay_minutes, speed_kph, current_station_id, next_station_id
FROM trains;
