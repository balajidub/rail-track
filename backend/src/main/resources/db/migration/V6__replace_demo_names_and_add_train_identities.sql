-- Public train identities; timetable and operating values are not a live feed.
INSERT INTO stations (
    id, station_code, name, city, state, zone, latitude, longitude, platform_count, elevation_meters
) VALUES
('RKMP', 'RKMP', 'Rani Kamalapati', 'Bhopal', 'Madhya Pradesh', 'WCR', 23.221500, 77.437500, 6, 497),
('NZM', 'NZM', 'Hazrat Nizamuddin', 'Delhi', 'Delhi', 'NR', 28.588300, 77.250000, 7, 215),
('JHS', 'JHS', 'Jhansi Junction', 'Jhansi', 'Uttar Pradesh', 'NCR', 25.448400, 78.568500, 8, 259),
('MS', 'MS', 'Chennai Egmore', 'Chennai', 'Tamil Nadu', 'SR', 13.078600, 80.261400, 11, 9),
('HWH', 'HWH', 'Howrah Junction', 'Howrah', 'West Bengal', 'ER', 22.583700, 88.342600, 23, 12),
('ADI', 'ADI', 'Ahmedabad Junction', 'Ahmedabad', 'Gujarat', 'WR', 23.022500, 72.571400, 12, 53),
('MYS', 'MYS', 'Mysuru Junction', 'Mysuru', 'Karnataka', 'SWR', 12.312900, 76.645300, 6, 763),
('TVC', 'TVC', 'Thiruvananthapuram Central', 'Thiruvananthapuram', 'Kerala', 'SR', 8.487500, 76.952500, 5, 5),
('INDB', 'INDB', 'Indore Junction', 'Indore', 'Madhya Pradesh', 'WR', 22.717700, 75.868600, 6, 550),
('JBP', 'JBP', 'Jabalpur Junction', 'Jabalpur', 'Madhya Pradesh', 'WCR', 23.168600, 79.933900, 7, 412);

UPDATE trains SET
    name = 'Howrah-New Delhi Rajdhani Express', origin_station_id = 'HWH', destination_station_id = 'NDLS',
    current_station_id = 'HWH', next_station_id = 'NDLS', distance_km = 1451, duration_minutes = 1015
WHERE id = 't-12301';

UPDATE trains SET
    name = 'Mumbai Central-New Delhi Tejas Rajdhani Express',
    origin_station_id = 'MMCT', destination_station_id = 'NDLS',
    current_station_id = 'MMCT', next_station_id = 'NDLS', distance_km = 1384, duration_minutes = 940
WHERE id = 't-12951';

UPDATE trains SET
    train_number = '12001', name = 'Rani Kamalapati-New Delhi Shatabdi Express',
    type = 'SHATABDI', origin_station_id = 'NDLS', destination_station_id = 'RKMP',
    current_station_id = 'NDLS', next_station_id = 'RKMP', distance_km = 707, duration_minutes = 440
WHERE id = 't-demo-1001';

UPDATE trains SET
    train_number = '12002', name = 'Rani Kamalapati-New Delhi Shatabdi Express',
    type = 'SHATABDI', origin_station_id = 'RKMP', destination_station_id = 'NDLS',
    current_station_id = 'RKMP', next_station_id = 'NDLS', distance_km = 707, duration_minutes = 440
WHERE id = 't-demo-1002';

UPDATE trains SET
    train_number = '12033', name = 'Kanpur-New Delhi Shatabdi Express',
    type = 'SHATABDI', origin_station_id = 'NDLS', destination_station_id = 'CNB',
    current_station_id = 'NDLS', next_station_id = 'CNB', distance_km = 440, duration_minutes = 355
WHERE id = 't-demo-1003';

UPDATE trains SET
    train_number = '12034', name = 'Kanpur-New Delhi Shatabdi Express',
    type = 'SHATABDI', origin_station_id = 'CNB', destination_station_id = 'NDLS',
    current_station_id = 'CNB', next_station_id = 'NDLS', distance_km = 440, duration_minutes = 355
WHERE id = 't-demo-1004';

UPDATE trains SET
    train_number = '12615', name = 'Grand Trunk Express',
    type = 'SUPERFAST', origin_station_id = 'MS', destination_station_id = 'NDLS',
    current_station_id = 'MS', next_station_id = 'NDLS', distance_km = 2211, duration_minutes = 2160
WHERE id = 't-demo-1005';

UPDATE trains SET
    train_number = '12616', name = 'Grand Trunk Express',
    type = 'SUPERFAST', origin_station_id = 'NDLS', destination_station_id = 'MS',
    current_station_id = 'NDLS', next_station_id = 'MS', distance_km = 2211, duration_minutes = 2160
WHERE id = 't-demo-1006';

UPDATE trains SET
    train_number = '12952', name = 'Mumbai Central-New Delhi Tejas Rajdhani Express',
    type = 'RAJDHANI', origin_station_id = 'NDLS', destination_station_id = 'MMCT',
    current_station_id = 'NDLS', next_station_id = 'MMCT', distance_km = 1384, duration_minutes = 940
WHERE id = 't-demo-1007';

UPDATE trains SET
    train_number = '12621', name = 'Tamil Nadu Express',
    type = 'SUPERFAST', origin_station_id = 'MAS', destination_station_id = 'NDLS',
    current_station_id = 'MAS', next_station_id = 'NDLS', distance_km = 2182, duration_minutes = 1950
WHERE id = 't-demo-1008';

DELETE FROM train_stops WHERE train_id IN (
    't-demo-1001', 't-demo-1002', 't-demo-1003', 't-demo-1004',
    't-demo-1005', 't-demo-1006', 't-demo-1007', 't-demo-1008',
    't-12301', 't-12951'
);

INSERT INTO train_stops (train_id, sequence_number, station_id, arrival_time, departure_time, platform_number, distance_km, halt_minutes) VALUES
('t-12301', 0, 'HWH', NULL, '16:55:00', '9', 0, 0),
('t-12301', 1, 'NDLS', '09:50:00', NULL, '3', 1451, 0),
('t-12951', 0, 'MMCT', NULL, '16:35:00', '2', 0, 0),
('t-12951', 1, 'NDLS', '08:15:00', NULL, '3', 1384, 0),
('t-demo-1001', 0, 'NDLS', NULL, '06:00:00', '3', 0, 0),
('t-demo-1001', 1, 'RKMP', '13:20:00', NULL, '2', 707, 0),
('t-demo-1002', 0, 'RKMP', NULL, '14:00:00', '2', 0, 0),
('t-demo-1002', 1, 'NDLS', '21:20:00', NULL, '3', 707, 0),
('t-demo-1003', 0, 'NDLS', NULL, '06:00:00', '6', 0, 0),
('t-demo-1003', 1, 'CNB', '11:55:00', NULL, '6', 440, 0),
('t-demo-1004', 0, 'CNB', NULL, '15:00:00', '6', 0, 0),
('t-demo-1004', 1, 'NDLS', '20:55:00', NULL, '6', 440, 0),
('t-demo-1005', 0, 'MS', NULL, '18:00:00', '5', 0, 0),
('t-demo-1005', 1, 'NDLS', '06:00:00', NULL, '3', 2211, 0),
('t-demo-1006', 0, 'NDLS', NULL, '18:00:00', '3', 0, 0),
('t-demo-1006', 1, 'MS', '06:00:00', NULL, '5', 2211, 0),
('t-demo-1007', 0, 'NDLS', NULL, '16:00:00', '3', 0, 0),
('t-demo-1007', 1, 'MMCT', '08:00:00', NULL, '2', 1384, 0),
('t-demo-1008', 0, 'MAS', NULL, '22:00:00', '5', 0, 0),
('t-demo-1008', 1, 'NDLS', '06:30:00', NULL, '3', 2182, 0);

INSERT INTO trains (
    id, train_number, name, type, origin_station_id, destination_station_id,
    scheduled_departure, scheduled_arrival, duration_minutes, status, delay_minutes,
    speed_kph, current_station_id, next_station_id, progress, platform_number,
    coach_count, occupancy_percent, distance_km, service_days
) VALUES
('t-12049', '12049', 'Gatimaan Express', 'EXPRESS', 'NZM', 'JHS',
 '08:10:00', '12:35:00', 265, 'ON_TIME', 0, 0, 'NZM', 'JHS', 0.0000, '4', 8, 0, 403, 'Daily'),
('t-12050', '12050', 'Gatimaan Express', 'EXPRESS', 'JHS', 'NZM',
 '15:05:00', '19:30:00', 265, 'ON_TIME', 0, 0, 'JHS', 'NZM', 0.0000, '2', 8, 0, 403, 'Daily'),
('t-12953', '12953', 'August Kranti Tejas Rajdhani Express', 'RAJDHANI', 'MMCT', 'NZM',
 '17:10:00', '10:55:00', 1065, 'ON_TIME', 0, 0, 'MMCT', 'NZM', 0.0000, '3', 20, 0, 1386, 'Daily'),
('t-12954', '12954', 'August Kranti Tejas Rajdhani Express', 'RAJDHANI', 'NZM', 'MMCT',
 '16:50:00', '10:35:00', 1065, 'ON_TIME', 0, 0, 'NZM', 'MMCT', 0.0000, '2', 20, 0, 1386, 'Daily'),
('t-12302', '12302', 'Howrah-New Delhi Rajdhani Express', 'RAJDHANI', 'NDLS', 'HWH',
 '16:50:00', '10:05:00', 1035, 'ON_TIME', 0, 0, 'NDLS', 'HWH', 0.0000, '3', 20, 0, 1451, 'Daily'),
('t-12009', '12009', 'Mumbai Central-Ahmedabad Shatabdi Express', 'SHATABDI', 'MMCT', 'ADI',
 '06:00:00', '12:40:00', 400, 'ON_TIME', 0, 0, 'MMCT', 'ADI', 0.0000, '5', 16, 0, 491, 'Daily'),
('t-12010', '12010', 'Mumbai Central-Ahmedabad Shatabdi Express', 'SHATABDI', 'ADI', 'MMCT',
 '14:40:00', '21:20:00', 400, 'ON_TIME', 0, 0, 'ADI', 'MMCT', 0.0000, '3', 16, 0, 491, 'Daily'),
('t-12007', '12007', 'MGR Chennai Central-Mysuru Shatabdi Express', 'SHATABDI', 'MAS', 'MYS',
 '06:00:00', '13:00:00', 420, 'ON_TIME', 0, 0, 'MAS', 'MYS', 0.0000, '6', 16, 0, 497, 'Daily'),
('t-12008', '12008', 'MGR Chennai Central-Mysuru Shatabdi Express', 'SHATABDI', 'MYS', 'MAS',
 '14:15:00', '21:15:00', 420, 'ON_TIME', 0, 0, 'MYS', 'MAS', 0.0000, '2', 16, 0, 497, 'Daily'),
('t-12625', '12625', 'Kerala Express', 'SUPERFAST', 'NDLS', 'TVC',
 '11:25:00', '15:00:00', 3095, 'ON_TIME', 0, 0, 'NDLS', 'TVC', 0.0000, '7', 22, 0, 3036, 'Daily'),
('t-12626', '12626', 'Kerala Express', 'SUPERFAST', 'TVC', 'NDLS',
 '11:15:00', '14:50:00', 3095, 'ON_TIME', 0, 0, 'TVC', 'NDLS', 0.0000, '3', 22, 0, 3036, 'Daily'),
('t-12961', '12961', 'Avantika Superfast Express', 'SUPERFAST', 'MMCT', 'INDB',
 '20:55:00', '10:00:00', 785, 'ON_TIME', 0, 0, 'MMCT', 'INDB', 0.0000, '4', 18, 0, 829, 'Daily'),
('t-12962', '12962', 'Avantika Superfast Express', 'SUPERFAST', 'INDB', 'MMCT',
 '16:00:00', '05:05:00', 785, 'ON_TIME', 0, 0, 'INDB', 'MMCT', 0.0000, '1', 18, 0, 829, 'Daily'),
('t-12061', '12061', 'Rani Kamalapati-Jabalpur Jan Shatabdi Express', 'SHATABDI', 'RKMP', 'JBP',
 '17:40:00', '23:05:00', 325, 'ON_TIME', 0, 0, 'RKMP', 'JBP', 0.0000, '1', 16, 0, 311, 'Daily'),
('t-12062', '12062', 'Rani Kamalapati-Jabalpur Jan Shatabdi Express', 'SHATABDI', 'JBP', 'RKMP',
 '06:00:00', '11:25:00', 325, 'ON_TIME', 0, 0, 'JBP', 'RKMP', 0.0000, '4', 16, 0, 311, 'Daily');

INSERT INTO train_stops (train_id, sequence_number, station_id, arrival_time, departure_time, platform_number, distance_km, halt_minutes) VALUES
('t-12049', 0, 'NZM', NULL, '08:10:00', '4', 0, 0),
('t-12049', 1, 'JHS', '12:35:00', NULL, '2', 403, 0),
('t-12050', 0, 'JHS', NULL, '15:05:00', '2', 0, 0),
('t-12050', 1, 'NZM', '19:30:00', NULL, '4', 403, 0),
('t-12953', 0, 'MMCT', NULL, '17:10:00', '3', 0, 0),
('t-12953', 1, 'NZM', '10:55:00', NULL, '2', 1386, 0),
('t-12954', 0, 'NZM', NULL, '16:50:00', '2', 0, 0),
('t-12954', 1, 'MMCT', '10:35:00', NULL, '3', 1386, 0),
('t-12302', 0, 'NDLS', NULL, '16:50:00', '3', 0, 0),
('t-12302', 1, 'HWH', '10:05:00', NULL, '9', 1451, 0),
('t-12009', 0, 'MMCT', NULL, '06:00:00', '5', 0, 0),
('t-12009', 1, 'ADI', '12:40:00', NULL, '1', 491, 0),
('t-12010', 0, 'ADI', NULL, '14:40:00', '1', 0, 0),
('t-12010', 1, 'MMCT', '21:20:00', NULL, '5', 491, 0),
('t-12007', 0, 'MAS', NULL, '06:00:00', '6', 0, 0),
('t-12007', 1, 'MYS', '13:00:00', NULL, '2', 497, 0),
('t-12008', 0, 'MYS', NULL, '14:15:00', '2', 0, 0),
('t-12008', 1, 'MAS', '21:15:00', NULL, '6', 497, 0),
('t-12625', 0, 'NDLS', NULL, '11:25:00', '7', 0, 0),
('t-12625', 1, 'TVC', '15:00:00', NULL, '3', 3036, 0),
('t-12626', 0, 'TVC', NULL, '11:15:00', '3', 0, 0),
('t-12626', 1, 'NDLS', '14:50:00', NULL, '7', 3036, 0),
('t-12961', 0, 'MMCT', NULL, '20:55:00', '4', 0, 0),
('t-12961', 1, 'INDB', '10:00:00', NULL, '1', 829, 0),
('t-12962', 0, 'INDB', NULL, '16:00:00', '1', 0, 0),
('t-12962', 1, 'MMCT', '05:05:00', NULL, '4', 829, 0),
('t-12061', 0, 'RKMP', NULL, '17:40:00', '1', 0, 0),
('t-12061', 1, 'JBP', '23:05:00', NULL, '4', 311, 0),
('t-12062', 0, 'JBP', NULL, '06:00:00', '4', 0, 0),
('t-12062', 1, 'RKMP', '11:25:00', NULL, '1', 311, 0);
