package com.railtrack.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.railtrack.dto.PlatformCongestionResponse;
import com.railtrack.dto.StationCongestionResponse;
import com.railtrack.entity.Alert;
import com.railtrack.entity.Platform;
import com.railtrack.entity.PlatformCongestion;
import com.railtrack.entity.RailTrackEnums.AlertSeverity;
import com.railtrack.entity.RailTrackEnums.CongestionLevel;
import com.railtrack.entity.Station;
import com.railtrack.entity.StationCongestion;
import com.railtrack.entity.Train;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.repository.AlertRepository;
import com.railtrack.repository.PlatformRepository;
import com.railtrack.repository.StationCongestionRepository;
import com.railtrack.repository.StationRepository;
import com.railtrack.repository.TrainRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StationCongestionService {

    private final StationRepository stationRepository;
    private final TrainRepository trainRepository;
    private final PlatformRepository platformRepository;
    private final StationCongestionRepository congestionRepository;
    private final AlertRepository alertRepository;

    public StationCongestionService(
            StationRepository stationRepository,
            TrainRepository trainRepository,
            PlatformRepository platformRepository,
            StationCongestionRepository congestionRepository,
            AlertRepository alertRepository) {
        this.stationRepository = stationRepository;
        this.trainRepository = trainRepository;
        this.platformRepository = platformRepository;
        this.congestionRepository = congestionRepository;
        this.alertRepository = alertRepository;
    }

    @Transactional
    public StationCongestionResponse findLatest(String stationId) {
        stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + stationId));
        return congestionRepository.findTopByStation_IdOrderByRecordedAtDesc(stationId)
                .map(snapshot -> toResponse(snapshot, trainRepository.findAllByOrderByNumberAsc()))
                .orElseGet(() -> recordStation(stationId));
    }

    public List<StationCongestionResponse> findHistory(String stationId, int limit) {
        stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + stationId));
        List<Train> trains = trainRepository.findAllByOrderByNumberAsc();
        return congestionRepository.findByStation_IdOrderByRecordedAtDesc(stationId, PageRequest.of(0, limit))
                .stream()
                .map(snapshot -> toResponse(snapshot, trains))
                .toList();
    }

    @Transactional
    public void recordAll() {
        List<Station> stations = stationRepository.findAllByOrderByNameAsc();
        List<Train> trains = trainRepository.findAllByOrderByNumberAsc();
        Map<String, List<Platform>> platformsByStation = platformRepository
                .findAllByOrderByStation_IdAscPlatformNumberAsc()
                .stream()
                .collect(Collectors.groupingBy(platform -> platform.getStation().getId()));

        for (Station station : stations) {
            record(station, trains, platformsByStation.getOrDefault(station.getId(), List.of()));
        }
    }

    private StationCongestionResponse recordStation(String stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + stationId));
        List<Train> trains = trainRepository.findAllByOrderByNumberAsc();
        List<Platform> platforms = platformRepository
                .findAllByOrderByStation_IdAscPlatformNumberAsc()
                .stream()
                .filter(platform -> platform.getStation().getId().equals(stationId))
                .toList();
        return toResponse(record(station, trains, platforms), trains);
    }

    private StationCongestion record(Station station, List<Train> trains, List<Platform> platforms) {
        List<Train> services = trains.stream()
                .filter(train -> train.getStops().stream()
                        .anyMatch(stop -> stop.getStation().getId().equals(station.getId())))
                .toList();
        int incoming = (int) services.stream()
                .filter(train -> train.getNextStation().getId().equals(station.getId()))
                .count();
        int outgoing = (int) services.stream()
                .filter(train -> train.getCurrentStation().getId().equals(station.getId()))
                .count();
        Instant now = Instant.now();

        List<PlatformCongestion> platformSnapshots = new ArrayList<>();
        for (Platform platform : platforms) {
            List<Train> trainsOnPlatform = services.stream()
                    .filter(train -> train.getStops().stream().anyMatch(stop ->
                            stop.getStation().getId().equals(station.getId())
                                    && platform.getPlatformNumber() == parsePlatform(stop.getPlatformNumber())))
                    .toList();
            int density = bounded(
                    22 + ((station.getCode().charAt(0) + station.getCode().charAt(station.getCode().length() - 1))
                            * (platform.getPlatformNumber() + 3) + platform.getPlatformNumber() * 17) % 67
                            + trainsOnPlatform.size() * 9,
                    8,
                    99);

            PlatformCongestion snapshot = new PlatformCongestion();
            snapshot.setPlatform(platform);
            snapshot.setLevel(levelFor(density));
            snapshot.setDensityPercent(density);
            snapshot.setEstimatedPassengers((int) Math.round(density * 3.2 + trainsOnPlatform.size() * 48));
            platformSnapshots.add(snapshot);
        }

        int averageDensity = platformSnapshots.isEmpty()
                ? 0
                : (int) Math.round(platformSnapshots.stream()
                        .mapToInt(PlatformCongestion::getDensityPercent)
                        .average()
                        .orElse(0));
        int passengers = platformSnapshots.stream()
                .mapToInt(PlatformCongestion::getEstimatedPassengers)
                .sum();

        StationCongestion snapshot = new StationCongestion();
        snapshot.setStation(station);
        snapshot.setLevel(levelFor(averageDensity));
        snapshot.setEstimatedPassengers(passengers);
        snapshot.setIncomingTrains(incoming);
        snapshot.setOutgoingTrains(outgoing);
        snapshot.setActivityScore(averageDensity);
        snapshot.setRecordedAt(now);
        for (PlatformCongestion platformSnapshot : platformSnapshots) {
            platformSnapshot.setCongestion(snapshot);
        }
        snapshot.setPlatformSnapshots(platformSnapshots);

        StationCongestion saved = congestionRepository.save(snapshot);
        createAlertIfNeeded(saved, now);
        return saved;
    }

    private void createAlertIfNeeded(StationCongestion snapshot, Instant now) {
        if (snapshot.getLevel() == CongestionLevel.LOW || snapshot.getLevel() == CongestionLevel.MODERATE) {
            return;
        }
        String title = "Simulated congestion at " + snapshot.getStation().getCode();
        if (alertRepository.existsByStation_IdAndTitleAndCreatedAtAfter(
                snapshot.getStation().getId(),
                title,
                now.minus(15, ChronoUnit.MINUTES))) {
            return;
        }

        Alert alert = new Alert();
        alert.setTitle(title);
        alert.setMessage(snapshot.getLevel() + " simulated congestion estimate; activity score "
                + snapshot.getActivityScore() + ".");
        alert.setSeverity(snapshot.getLevel() == CongestionLevel.CRITICAL
                ? AlertSeverity.CRITICAL
                : AlertSeverity.WARNING);
        alert.setRead(false);
        alert.setStation(snapshot.getStation());
        alert.setCreatedAt(now);
        alertRepository.save(alert);
    }

    private StationCongestionResponse toResponse(StationCongestion snapshot, List<Train> trains) {
        List<PlatformCongestionResponse> platforms = snapshot.getPlatformSnapshots().stream()
                .map(platform -> {
                    List<String> trainNumbers = trains.stream()
                            .filter(train -> train.getStops().stream().anyMatch(stop ->
                                    stop.getStation().getId().equals(snapshot.getStation().getId())
                                            && parsePlatform(stop.getPlatformNumber())
                                                    == platform.getPlatform().getPlatformNumber()))
                            .map(Train::getNumber)
                            .toList();
                    return new PlatformCongestionResponse(
                            platform.getPlatform().getPlatformNumber(),
                            displayLevel(platform.getLevel()),
                            platform.getDensityPercent(),
                            platform.getEstimatedPassengers(),
                            trainNumbers);
                })
                .toList();
        return new StationCongestionResponse(
                snapshot.getStation().getId(),
                displayLevel(snapshot.getLevel()),
                snapshot.getEstimatedPassengers(),
                snapshot.getIncomingTrains(),
                snapshot.getOutgoingTrains(),
                snapshot.getActivityScore(),
                snapshot.getRecordedAt(),
                platforms);
    }

    private int parsePlatform(String platform) {
        try {
            return Integer.parseInt(platform);
        } catch (NumberFormatException exception) {
            return -1;
        }
    }

    private CongestionLevel levelFor(int density) {
        if (density >= 85) return CongestionLevel.CRITICAL;
        if (density >= 65) return CongestionLevel.HIGH;
        if (density >= 40) return CongestionLevel.MODERATE;
        return CongestionLevel.LOW;
    }

    private String displayLevel(CongestionLevel level) {
        return switch (level) {
            case LOW -> "Low";
            case MODERATE -> "Moderate";
            case HIGH -> "High";
            case CRITICAL -> "Critical";
        };
    }

    private int bounded(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
