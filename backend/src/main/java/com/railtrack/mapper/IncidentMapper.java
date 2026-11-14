package com.railtrack.mapper;

import java.util.Comparator;
import java.util.List;

import com.railtrack.dto.IncidentHistoryResponse;
import com.railtrack.dto.IncidentResponse;
import com.railtrack.entity.Incident;
import com.railtrack.entity.IncidentHistory;
import com.railtrack.entity.RailTrackEnums.IncidentCategory;
import org.springframework.stereotype.Component;

@Component
public class IncidentMapper {

    public IncidentResponse toResponse(Incident incident) {
        List<IncidentHistoryResponse> history = incident.getHistory().stream()
                .sorted(Comparator.comparing(IncidentHistory::getOccurredAt))
                .map(this::toHistoryResponse)
                .toList();
        return new IncidentResponse(
                formatId(incident.getId()),
                incident.getTitle(),
                incident.getDescription(),
                displayCategory(incident.getCategory()),
                display(incident.getSeverity().name()),
                display(incident.getPriority().name()),
                display(incident.getStatus().name()),
                incident.getTrain() == null ? null : incident.getTrain().getId(),
                incident.getStation() == null ? null : incident.getStation().getId(),
                incident.getResponseTeam() == null ? null : incident.getResponseTeam().getName(),
                incident.getCreatedAt(),
                incident.getUpdatedAt(),
                history);
    }

    private IncidentHistoryResponse toHistoryResponse(IncidentHistory history) {
        return new IncidentHistoryResponse(
                history.getOccurredAt(),
                history.getNote(),
                display(history.getStatus().name()));
    }

    private String displayCategory(IncidentCategory category) {
        return switch (category) {
            case TRACK_OBSTRUCTION -> "Track obstruction";
            case SIGNAL_FAILURE -> "Signal failure";
            case TECHNICAL_FAILURE -> "Technical failure";
            case WEATHER_DISRUPTION -> "Weather disruption";
            case STATION_OVERCROWDING -> "Station overcrowding";
            case UNSCHEDULED_TRAIN_STOPPAGE -> "Unscheduled train stoppage";
        };
    }

    public String formatId(Long id) {
        return "INC-" + String.format("%06d", id);
    }

    private String display(String value) {
        String[] words = value.toLowerCase(java.util.Locale.ROOT).split("_");
        return java.util.Arrays.stream(words)
                .map(word -> Character.toUpperCase(word.charAt(0)) + word.substring(1))
                .collect(java.util.stream.Collectors.joining(" "));
    }
}
