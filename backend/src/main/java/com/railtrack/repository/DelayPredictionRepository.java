package com.railtrack.repository;

import java.util.Optional;

import com.railtrack.entity.DelayPrediction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DelayPredictionRepository extends JpaRepository<DelayPrediction, Long> {

    Optional<DelayPrediction> findTopByTrain_IdOrderByPredictedAtDesc(String trainId);
}
