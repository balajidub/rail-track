package com.railtrack.service;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

import com.railtrack.dto.DelayPredictionResponse;
import com.railtrack.entity.DelayPrediction;
import com.railtrack.entity.RailTrackEnums.PredictionRisk;
import com.railtrack.entity.Train;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.intelligence.DelayPredictionEngine;
import com.railtrack.repository.DelayPredictionRepository;
import com.railtrack.repository.TrainRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DelayPredictionService {

    private final TrainRepository trainRepository;
    private final DelayPredictionRepository predictionRepository;
    private final DelayPredictionEngine predictionEngine;

    public DelayPredictionService(
            TrainRepository trainRepository,
            DelayPredictionRepository predictionRepository,
            DelayPredictionEngine predictionEngine) {
        this.trainRepository = trainRepository;
        this.predictionRepository = predictionRepository;
        this.predictionEngine = predictionEngine;
    }

    public List<DelayPredictionResponse> findAll() {
        List<Train> trains = trainRepository.findAllByOrderByNumberAsc();
        return trains.stream()
                .map(train -> predictionEngine.predict(train, trains))
                .toList();
    }

    public DelayPredictionResponse findByTrainId(String trainId) {
        Train train = trainRepository.findExpandedById(trainId)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found: " + trainId));
        return predictionEngine.predict(train, trainRepository.findAllByOrderByNumberAsc());
    }

    @Transactional
    public void recordCurrentPredictions() {
        List<Train> trains = trainRepository.findAllByOrderByNumberAsc();
        Instant now = Instant.now();
        List<DelayPrediction> predictions = trains.stream()
                .map(train -> toEntity(train, predictionEngine.predict(train, trains), now))
                .toList();
        predictionRepository.saveAll(predictions);
    }

    private DelayPrediction toEntity(Train train, DelayPredictionResponse response, Instant now) {
        DelayPrediction prediction = new DelayPrediction();
        prediction.setTrain(train);
        prediction.setPredictedAt(now);
        prediction.setRiskScore(response.riskScore());
        prediction.setRiskLevel(PredictionRisk.valueOf(response.risk().toUpperCase(Locale.ROOT)));
        prediction.setPredictedDelayMinutes(response.predictedDelayMinutes());
        prediction.setConfidencePercent(response.confidence());
        prediction.setEstimatedArrivalTime(LocalTime.parse(response.estimatedArrival()));
        prediction.setFactors(response.factors());
        prediction.setRecommendation(response.recommendation());
        return prediction;
    }
}
