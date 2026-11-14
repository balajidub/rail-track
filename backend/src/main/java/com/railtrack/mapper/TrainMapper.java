package com.railtrack.mapper;

import java.util.List;

import com.railtrack.dto.TrainResponse;
import com.railtrack.dto.TrainStopResponse;
import com.railtrack.entity.RailTrackEnums.TrainStatus;
import com.railtrack.entity.RailTrackEnums.TrainType;
import com.railtrack.entity.Train;
import com.railtrack.entity.TrainStop;
import org.springframework.stereotype.Component;

@Component
public class TrainMapper {

    public TrainResponse toResponse(Train train) {
        List<TrainStopResponse> stops = train.getStops().stream()
                .map(this::toStopResponse)
                .toList();

        return new TrainResponse(
                train.getId(),
                train.getNumber(),
                train.getName(),
                displayType(train.getType()),
                train.getOrigin().getId(),
                train.getDestination().getId(),
                formatTime(train.getScheduledDeparture()),
                formatTime(train.getScheduledArrival()),
                formatDuration(train.getDurationMinutes()),
                displayStatus(train.getStatus()),
                train.getDelayMinutes(),
                train.getSpeedKph(),
                train.getCurrentStation().getId(),
                train.getNextStation().getId(),
                train.getProgress().doubleValue(),
                train.getPlatformNumber(),
                train.getCoachCount(),
                train.getOccupancyPercent(),
                train.getDistanceKm(),
                train.getServiceDays(),
                stops);
    }

    public TrainStopResponse toStopResponse(TrainStop stop) {
        return new TrainStopResponse(
                stop.getStation().getId(),
                stop.getArrivalTime() == null ? null : formatTime(stop.getArrivalTime()),
                stop.getDepartureTime() == null ? null : formatTime(stop.getDepartureTime()),
                stop.getPlatformNumber(),
                stop.getDistanceKm(),
                stop.getHaltMinutes());
    }

    public static String displayType(TrainType type) {
        return switch (type) {
            case VANDE_BHARAT -> "Vande Bharat";
            case RAJDHANI -> "Rajdhani";
            case SHATABDI -> "Shatabdi";
            case DURONTO -> "Duronto";
            case SUPERFAST -> "Superfast";
            case EXPRESS -> "Express";
            case MAIL -> "Mail";
        };
    }

    private String displayStatus(TrainStatus status) {
        return switch (status) {
            case ON_TIME -> "on-time";
            case DELAYED -> "delayed";
            case CANCELLED -> "cancelled";
            case ARRIVED -> "arrived";
        };
    }

    private String formatTime(java.time.LocalTime time) {
        return time.toString().length() == 5 ? time.toString() : time.toString().substring(0, 5);
    }

    private String formatDuration(int durationMinutes) {
        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;
        return hours == 0 ? minutes + "m" : hours + "h " + minutes + "m";
    }
}
