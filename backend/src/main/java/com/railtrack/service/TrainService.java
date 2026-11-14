package com.railtrack.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.railtrack.dto.TrainResponse;
import com.railtrack.dto.TrainStopResponse;
import com.railtrack.entity.RailTrackEnums.TrainType;
import com.railtrack.entity.Train;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.mapper.TrainMapper;
import com.railtrack.repository.TrainRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TrainService {

    private final TrainRepository trainRepository;
    private final TrainMapper trainMapper;

    public TrainService(TrainRepository trainRepository, TrainMapper trainMapper) {
        this.trainRepository = trainRepository;
        this.trainMapper = trainMapper;
    }

    public List<TrainResponse> findAll() {
        return trainRepository.findAllByOrderByNumberAsc().stream()
                .map(trainMapper::toResponse)
                .toList();
    }

    public TrainResponse findById(String id) {
        return trainRepository.findExpandedById(id)
                .map(trainMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found: " + id));
    }

    public List<TrainResponse> search(String query) {
        String term = query.trim().toLowerCase(Locale.ROOT);
        Map<String, Train> matches = trainRepository.searchExpandedByTerm(term).stream()
                .collect(Collectors.toMap(Train::getId, Function.identity(), (first, ignored) -> first));

        EnumSet<TrainType> matchingTypes = EnumSet.noneOf(TrainType.class);
        for (TrainType type : TrainType.values()) {
            if (TrainMapper.displayType(type).toLowerCase(Locale.ROOT).contains(term)) {
                matchingTypes.add(type);
            }
        }
        if (!matchingTypes.isEmpty()) {
            trainRepository.findByTypeIn(matchingTypes)
                    .forEach(train -> matches.putIfAbsent(train.getId(), train));
        }

        List<Train> ordered = new ArrayList<>(matches.values());
        ordered.sort(Comparator.comparing(Train::getNumber));
        return ordered.stream().map(trainMapper::toResponse).toList();
    }

    public List<TrainStopResponse> findStops(String trainId) {
        Train train = trainRepository.findExpandedById(trainId)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found: " + trainId));
        return train.getStops().stream()
                .map(trainMapper::toStopResponse)
                .toList();
    }
}
