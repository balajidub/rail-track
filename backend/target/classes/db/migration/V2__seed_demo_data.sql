INSERT INTO stations (id, station_code, name, city, state, zone, latitude, longitude, platform_count, elevation_meters) VALUES
('NDLS', 'NDLS', 'New Delhi', 'Delhi', 'Delhi', 'NR', 28.642000, 77.219000, 16, 216),
('AGC', 'AGC', 'Agra Cantt', 'Agra', 'Uttar Pradesh', 'NCR', 27.158000, 77.990000, 6, 170),
('KOTA', 'KOTA', 'Kota Junction', 'Kota', 'Rajasthan', 'WCR', 25.178000, 75.850000, 5, 256),
('BPL', 'BPL', 'Bhopal Junction', 'Bhopal', 'Madhya Pradesh', 'WCR', 23.268000, 77.414000, 6, 497),
('NGP', 'NGP', 'Nagpur Junction', 'Nagpur', 'Maharashtra', 'CR', 21.153000, 79.089000, 8, 310),
('MMCT', 'MMCT', 'Mumbai Central', 'Mumbai', 'Maharashtra', 'WR', 18.969000, 72.819000, 9, 8),
('MAS', 'MAS', 'Chennai Central', 'Chennai', 'Tamil Nadu', 'SR', 13.082000, 80.275000, 17, 9),
('CNB', 'CNB', 'Kanpur Central', 'Kanpur', 'Uttar Pradesh', 'NCR', 26.449000, 80.331000, 10, 129);

INSERT INTO platforms (id, station_id, platform_number, capacity) VALUES
(1, 'NDLS', 3, 1200), (2, 'AGC', 2, 800), (3, 'KOTA', 1, 700),
(4, 'BPL', 4, 750), (5, 'NGP', 5, 800), (6, 'MMCT', 2, 900),
(7, 'MAS', 5, 1000), (8, 'CNB', 6, 850);

INSERT INTO trains (
    id, train_number, name, type, origin_station_id, destination_station_id,
    scheduled_departure, scheduled_arrival, duration_minutes, status, delay_minutes,
    speed_kph, current_station_id, next_station_id, progress, platform_number,
    coach_count, occupancy_percent, distance_km, service_days
) VALUES
('t-12951', '12951', 'Mumbai Rajdhani', 'RAJDHANI', 'NDLS', 'MMCT',
 '16:35:00', '08:15:00', 940, 'ON_TIME', 0, 118, 'KOTA', 'BPL', 0.4200, '3', 20, 91, 1384, 'Daily'),
('t-12622', '12622', 'Tamil Nadu Express', 'SUPERFAST', 'NDLS', 'MAS',
 '22:30:00', '07:00:00', 1950, 'DELAYED', 47, 86, 'NGP', 'MAS', 0.4800, '4', 24, 94, 2175, 'Daily'),
('t-12301', '12301', 'Howrah Rajdhani', 'RAJDHANI', 'NDLS', 'CNB',
 '16:55:00', '22:50:00', 355, 'DELAYED', 28, 94, 'NDLS', 'CNB', 0.1800, '6', 20, 82, 440, 'Daily');

INSERT INTO train_stops (train_id, sequence_number, station_id, arrival_time, departure_time, platform_number, distance_km, halt_minutes) VALUES
('t-12951', 0, 'NDLS', NULL, '16:35:00', '3', 0, 0),
('t-12951', 1, 'AGC', '19:05:00', '19:10:00', '2', 195, 5),
('t-12951', 2, 'KOTA', '22:45:00', '22:50:00', '1', 465, 5),
('t-12951', 3, 'BPL', '03:20:00', '03:25:00', '4', 776, 5),
('t-12951', 4, 'MMCT', '08:15:00', NULL, '2', 1384, 0),
('t-12622', 0, 'NDLS', NULL, '22:30:00', '4', 0, 0),
('t-12622', 1, 'BPL', '07:55:00', '08:05:00', '3', 707, 10),
('t-12622', 2, 'NGP', '13:45:00', '13:55:00', '5', 1092, 10),
('t-12622', 3, 'MAS', '07:00:00', NULL, '5', 2175, 0),
('t-12301', 0, 'NDLS', NULL, '16:55:00', '6', 0, 0),
('t-12301', 1, 'CNB', '22:50:00', NULL, '6', 440, 0);

INSERT INTO delay_predictions (
    id, train_id, predicted_at, risk_score, risk_level, predicted_delay_minutes,
    confidence_percent, estimated_arrival_time, recommendation
) VALUES
(1, 't-12951', '2026-11-14 04:00:00.000000', 28, 'LOW', 12, 78, '08:27:00',
 'Continue routine monitoring; no additional simulated intervention indicated.'),
(2, 't-12622', '2026-11-14 04:00:00.000000', 69, 'HIGH', 47, 82, '07:47:00',
 'Prioritize a corridor review and check connecting service impacts.');

INSERT INTO delay_prediction_factors (prediction_id, factor_order, factor) VALUES
(1, 0, 'High simulated occupancy (91%)'),
(2, 0, 'Existing delay of 47 minutes'),
(2, 1, 'High simulated occupancy (94%)'),
(2, 2, 'Reduced simulated speed (86 km/h); a section restriction is possible but unconfirmed');

INSERT INTO station_congestions (
    id, station_id, congestion_level, estimated_passengers, incoming_trains,
    outgoing_trains, activity_score, recorded_at
) VALUES
(1, 'NDLS', 'HIGH', 8250, 2, 3, 78, '2026-11-14 04:00:00.000000'),
(2, 'BPL', 'MODERATE', 2960, 1, 1, 52, '2026-11-14 04:00:00.000000');

INSERT INTO platform_congestions (id, congestion_id, platform_id, congestion_level, density_percent, estimated_passengers) VALUES
(1, 1, 1, 'HIGH', 78, 960),
(2, 2, 4, 'MODERATE', 54, 405);

INSERT INTO response_teams (id, team_name, specialty, active) VALUES
(1, 'Track Response Team A', 'Track and signal inspection', TRUE),
(2, 'Station Operations Team', 'Station crowd management', TRUE);

INSERT INTO incidents (
    id, title, description, category, severity, priority, status, train_id, station_id,
    response_team_id, created_at, updated_at
) VALUES
(1, 'Signal caution scenario near Kanpur',
 'Simulated signal degradation requiring a precautionary speed restriction.',
 'SIGNAL_FAILURE', 'HIGH', 'URGENT', 'IN_PROGRESS', 't-12301', 'CNB', 1,
 '2026-11-14 03:15:00.000000', '2026-11-14 03:32:00.000000'),
(2, 'Platform crowding at New Delhi',
 'Illustrative passenger-density scenario during a peak departure window.',
 'STATION_OVERCROWDING', 'MEDIUM', 'ELEVATED', 'ACKNOWLEDGED', NULL, 'NDLS', 2,
 '2026-11-14 03:40:00.000000', '2026-11-14 03:45:00.000000');

INSERT INTO incident_history (incident_id, status, note, occurred_at, actor) VALUES
(1, 'REPORTED', 'Scenario reported to the control room.', '2026-11-14 03:15:00.000000', 'Demo seed'),
(1, 'ACKNOWLEDGED', 'Signal desk acknowledged the scenario.', '2026-11-14 03:20:00.000000', 'Demo seed'),
(1, 'RESPONSE_ASSIGNED', 'Response team assigned.', '2026-11-14 03:25:00.000000', 'Demo seed'),
(1, 'IN_PROGRESS', 'Inspection is in progress.', '2026-11-14 03:32:00.000000', 'Demo seed'),
(2, 'REPORTED', 'Crowding scenario reported.', '2026-11-14 03:40:00.000000', 'Demo seed'),
(2, 'ACKNOWLEDGED', 'Station desk acknowledged the scenario.', '2026-11-14 03:45:00.000000', 'Demo seed');

INSERT INTO coaches (id, train_id, coach_number, coach_type, capacity) VALUES
(1, 't-12951', 'A1', 'AC_FIRST', 48),
(2, 't-12951', 'A2', 'AC_FIRST', 48),
(3, 't-12622', 'S1', 'SLEEPER', 72),
(4, 't-12622', 'S2', 'SLEEPER', 72);

INSERT INTO coach_occupancies (coach_id, occupancy_percent, occupancy_level, estimated_passengers, recorded_at) VALUES
(1, 96, 'OVERCROWDED', 46, '2026-11-14 04:00:00.000000'),
(2, 82, 'HIGH', 39, '2026-11-14 04:00:00.000000'),
(3, 100, 'OVERCROWDED', 72, '2026-11-14 04:00:00.000000'),
(4, 88, 'HIGH', 63, '2026-11-14 04:00:00.000000');

INSERT INTO railway_routes (
    id, route_name, from_station_id, to_station_id, distance_km, duration_minutes,
    simulated_delay_minutes, active
) VALUES
(1, 'Demo NDLS-AGC', 'NDLS', 'AGC', 195, 150, 5, TRUE),
(2, 'Demo AGC-KOTA', 'AGC', 'KOTA', 270, 210, 8, TRUE),
(3, 'Demo KOTA-BPL', 'KOTA', 'BPL', 311, 275, 12, TRUE),
(4, 'Demo NDLS-BPL', 'NDLS', 'BPL', 707, 575, 20, TRUE),
(5, 'Demo BPL-NGP', 'BPL', 'NGP', 385, 340, 10, TRUE),
(6, 'Demo NGP-MAS', 'NGP', 'MAS', 1083, 900, 15, TRUE);

INSERT INTO simulation_state (id, mode, running, simulated_at, updated_at, version) VALUES
(1, 'DEMO_SIMULATION', FALSE, '2026-11-14 04:00:00.000000', '2026-11-14 04:00:00.000000', 0);

INSERT INTO alerts (id, title, message, severity, is_read, train_id, station_id, created_at) VALUES
(1, 'Tamil Nadu Express delayed',
 '12622 is 47 minutes behind its fictional timetable in the demo simulation.',
 'WARNING', FALSE, 't-12622', 'NGP', '2026-11-14 04:00:00.000000'),
(2, 'Station crowding scenario',
 'Illustrative passenger-density estimate is elevated at New Delhi.',
 'WARNING', FALSE, NULL, 'NDLS', '2026-11-14 04:00:00.000000');
