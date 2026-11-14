package com.railtrack.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import com.railtrack.dto.SimulationStatusResponse;
import com.railtrack.entity.SimulationState;
import com.railtrack.entity.SimulationTrainBaseline;
import com.railtrack.entity.Train;
import com.railtrack.entity.TrainStop;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.repository.SimulationStateRepository;
import com.railtrack.repository.SimulationTrainBaselineRepository;
import com.railtrack.repository.TrainRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SimulationService {

    private static final long STATE_ID = 1L;
    private static final int ARRIVAL_THRESHOLD_PERCENT = 99;

    private final SimulationStateRepository stateRepository;
    private final SimulationTrainBaselineRepository baselineRepository;
    private final TrainRepository trainRepository;
    private final DelayPredictionService predictionService;
    private final StationCongestionService congestionService;
    private final CoachOccupancyService coachOccupancyService;

    public SimulationService(
            SimulationStateRepository stateRepository,
            SimulationTrainBaselineRepository baselineRepository,
            TrainRepository trainRepository,
            DelayPredictionService predictionService,
            StationCongestionService congestionService,
            CoachOccupancyService coachOccupancyService) {
        this.stateRepository = stateRepository;
        this.baselineRepository = baselineRepository;
        this.trainRepository = trainRepository;
        this.predictionService = predictionService;
        this.congestionService = congestionService;
        this.coachOccupancyService = coachOccupancyService;
    }

    @Transactional(readOnly = true)
    public SimulationStatusResponse status() {
        return toResponse(stateRepository.findById(STATE_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Simulation state is not initialized.")));
    }

    @Transactional
    public SimulationStatusResponse start() {
        SimulationState state = lockedState();
        state.setRunning(true);
        state.setUpdatedAt(Instant.now());
        return toResponse(stateRepository.save(state));
    }

    @Transactional
    public SimulationStatusResponse pause() {
        SimulationState state = lockedState();
        state.setRunning(false);
        state.setUpdatedAt(Instant.now());
        return toResponse(stateRepository.save(state));
    }

    @Transactional
    public SimulationStatusResponse reset() {
        SimulationState state = lockedState();
        List<SimulationTrainBaseline> baselines = baselineRepository.findAllByOrderByIdAsc();
        List<Train> trains = new ArrayList<>();
        for (SimulationTrainBaseline baseline : baselines) {
            Train train = baseline.getTrain();
            train.setProgress(baseline.getProgress());
            train.setStatus(baseline.getStatus());
            train.setDelayMinutes(baseline.getDelayMinutes());
            train.setSpeedKph(baseline.getSpeedKph());
            train.setCurrentStation(baseline.getCurrentStation());
            train.setNextStation(baseline.getNextStation());
            trains.add(train);
        }
        trainRepository.saveAll(trains);
        Instant now = Instant.now();
        state.setRunning(false);
        state.setSimulatedAt(now);
        state.setUpdatedAt(now);
        return toResponse(stateRepository.save(state));
    }

    @Transactional
    public void advanceIfRunning() {
        SimulationState state = lockedState();
        if (!state.isRunning()) return;

        List<Train> trains = trainRepository.findAllByOrderByNumberAsc();
        for (Train train : trains) {
            advanceTrain(train);
        }
        trainRepository.saveAll(trains);

        Instant now = Instant.now();
        state.setSimulatedAt(state.getSimulatedAt().plus(1, ChronoUnit.MINUTES));
        state.setUpdatedAt(now);
        stateRepository.save(state);

        predictionService.recordCurrentPredictions();
        congestionService.recordAll();
        coachOccupancyService.recordAll();
    }

    private void advanceTrain(Train train) {
        if (train.getStatus() == com.railtrack.entity.RailTrackEnums.TrainStatus.CANCELLED
                || train.getStatus() == com.railtrack.entity.RailTrackEnums.TrainStatus.ARRIVED) {
            return;
        }
        List<TrainStop> stops = train.getStops();
        if (stops.size() < 2) return;

        double progress = Math.min(1.0, train.getProgress().doubleValue() + 0.008 + train.getSpeedKph() / 18000.0);
        train.setProgress(BigDecimal.valueOf(progress));
        int index = Math.min((int) Math.floor(progress * (stops.size() - 1)), stops.size() - 1);
        train.setCurrentStation(stops.get(index).getStation());
        train.setNextStation(stops.get(Math.min(index + 1, stops.size() - 1)).getStation());

        if (progress * 100 >= ARRIVAL_THRESHOLD_PERCENT) {
            train.setStatus(com.railtrack.entity.RailTrackEnums.TrainStatus.ARRIVED);
            train.setSpeedKph(0);
        } else {
            train.setStatus(train.getDelayMinutes() >= 15
                    ? com.railtrack.entity.RailTrackEnums.TrainStatus.DELAYED
                    : com.railtrack.entity.RailTrackEnums.TrainStatus.ON_TIME);
            int variation = (int) Math.round((progress * 10) % 5 - 2);
            train.setSpeedKph(Math.max(42, Math.min(140, train.getSpeedKph() + variation)));
        }
    }

    private SimulationState lockedState() {
        return stateRepository.findLockedById(STATE_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Simulation state is not initialized."));
    }

    private SimulationStatusResponse toResponse(SimulationState state) {
        return new SimulationStatusResponse(
                state.getMode(),
                state.isRunning(),
                state.getSimulatedAt(),
                state.getUpdatedAt(),
                state.getVersion());
    }
}
