package com.railtrack.entity;

public final class RailTrackEnums {

    private RailTrackEnums() {
    }

    public enum TrainStatus {
        ON_TIME,
        DELAYED,
        CANCELLED,
        ARRIVED
    }

    public enum TrainType {
        RAJDHANI,
        SHATABDI,
        VANDE_BHARAT,
        DURONTO,
        SUPERFAST,
        EXPRESS,
        MAIL
    }

    public enum PredictionRisk {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum CongestionLevel {
        LOW,
        MODERATE,
        HIGH,
        CRITICAL
    }

    public enum IncidentCategory {
        TRACK_OBSTRUCTION,
        SIGNAL_FAILURE,
        TECHNICAL_FAILURE,
        WEATHER_DISRUPTION,
        STATION_OVERCROWDING,
        UNSCHEDULED_TRAIN_STOPPAGE
    }

    public enum IncidentSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum IncidentPriority {
        ROUTINE,
        ELEVATED,
        URGENT
    }

    public enum IncidentStatus {
        REPORTED,
        ACKNOWLEDGED,
        RESPONSE_ASSIGNED,
        IN_PROGRESS,
        RESOLVED
    }

    public enum CoachOccupancyLevel {
        AVAILABLE,
        MODERATE,
        HIGH,
        OVERCROWDED
    }

    public enum AlertSeverity {
        INFO,
        WARNING,
        CRITICAL
    }
}
