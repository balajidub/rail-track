package com.railtrack.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.railtrack.dto.CoachOccupancyResponse;
import com.railtrack.dto.TrainCoachOccupancyResponse;
import com.railtrack.entity.Coach;
import com.railtrack.entity.CoachOccupancy;
import com.railtrack.entity.RailTrackEnums.CoachOccupancyLevel;
import com.railtrack.entity.Train;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.repository.CoachOccupancyRepository;
import com.railtrack.repository.CoachRepository;
import com.railtrack.repository.TrainRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CoachOccupancyService {

    private static final int[] OFFSETS = {14, -9, -24, 5, 10, -16, 2, 18, -12, 7, -5, 11};

    private final CoachRepository coachRepository;
    private final CoachOccupancyRepository occupancyRepository;
    private final TrainRepository trainRepository;

    public CoachOccupancyService(
            CoachRepository coachRepository,
            CoachOccupancyRepository occupancyRepository,
            TrainRepository trainRepository) {
        this.coachRepository = coachRepository;
        this.occupancyRepository = occupancyRepository;
        this.trainRepository = trainRepository;
    }

    public TrainCoachOccupancyResponse findForTrain(String trainId) {
        Train train = trainRepository.findExpandedById(trainId)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found: " + trainId));
        List<Coach> coaches = coachRepository.findAllByTrain_IdOrderByCoachNumberAsc(trainId);
        List<CoachOccupancyResponse> occupancies = coaches.stream()
                .map(this::latestForCoach)
                .toList();
        int totalCapacity = coaches.stream().mapToInt(Coach::getCapacity).sum();
        int estimatedPassengers = occupancies.stream().mapToInt(CoachOccupancyResponse::estimatedPassengers).sum();
        int average = totalCapacity == 0 ? 0 : (int) Math.round(100.0 * estimatedPassengers / totalCapacity);
        int overcrowded = (int) occupancies.stream()
                .filter(occupancy -> occupancy.level().equals("Overcrowded"))
                .count();
        return new TrainCoachOccupancyResponse(
                train.getId(),
                train.getNumber(),
                train.getOccupancyPercent(),
                average,
                overcrowded,
                occupancies);
    }

    public CoachOccupancyResponse findLatestForCoach(Long coachId) {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found: " + coachId));
        return latestForCoach(coach);
    }

    @Transactional
    public void recordAll() {
        List<Coach> coaches = coachRepository.findAllByOrderByTrain_IdAscCoachNumberAsc();
        Map<String, Train> trains = trainRepository.findAllByOrderByNumberAsc().stream()
                .collect(Collectors.toMap(Train::getId, train -> train));
        Instant now = Instant.now();
        List<CoachOccupancy> snapshots = new ArrayList<>();
        for (Coach coach : coaches) {
            Train train = trains.get(coach.getTrain().getId());
            if (train == null) {
                throw new IllegalStateException("Coach references a train missing from the simulation.");
            }
            int coachIndex = coachIndex(coach.getCoachNumber());
            int percent = bounded(train.getOccupancyPercent() + OFFSETS[coachIndex % OFFSETS.length], 0, 100);
            CoachOccupancy snapshot = new CoachOccupancy();
            snapshot.setCoach(coach);
            snapshot.setOccupancyPercent(percent);
            snapshot.setLevel(levelFor(percent));
            snapshot.setEstimatedPassengers((int) Math.round(coach.getCapacity() * percent / 100.0));
            snapshot.setRecordedAt(now);
            snapshots.add(snapshot);
        }
        occupancyRepository.saveAll(snapshots);
    }

    private CoachOccupancyResponse latestForCoach(Coach coach) {
        CoachOccupancy snapshot = occupancyRepository.findTopByCoach_IdOrderByRecordedAtDesc(coach.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No occupancy snapshot found for coach: " + coach.getCoachNumber()));
        return new CoachOccupancyResponse(
                coach.getId(),
                coach.getCoachNumber(),
                snapshot.getOccupancyPercent(),
                display(snapshot.getLevel()),
                snapshot.getEstimatedPassengers(),
                snapshot.getRecordedAt());
    }

    private int coachIndex(String coachNumber) {
        int suffixStart = coachNumber.length();
        while (suffixStart > 0 && Character.isDigit(coachNumber.charAt(suffixStart - 1))) {
            suffixStart--;
        }
        try {
            return Math.max(Integer.parseInt(coachNumber.substring(suffixStart)) - 1, 0);
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private CoachOccupancyLevel levelFor(int percent) {
        if (percent >= 90) return CoachOccupancyLevel.OVERCROWDED;
        if (percent >= 75) return CoachOccupancyLevel.HIGH;
        if (percent >= 50) return CoachOccupancyLevel.MODERATE;
        return CoachOccupancyLevel.AVAILABLE;
    }

    private String display(CoachOccupancyLevel level) {
        return switch (level) {
            case AVAILABLE -> "Available";
            case MODERATE -> "Moderate";
            case HIGH -> "High";
            case OVERCROWDED -> "Overcrowded";
        };
    }

    private int bounded(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
