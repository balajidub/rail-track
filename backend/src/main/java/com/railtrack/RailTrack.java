package com.railtrack;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.railtrack.dto.TrainResponse;
import com.railtrack.service.TrainService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/train-summary")
public class RailTrack {

    private final TrainService trainService;

    public RailTrack(TrainService trainService) {
        this.trainService = trainService;
    }

    @GetMapping
    public TrainSummaryResponse summarizeTrains() {
        List<TrainResponse> source = trainService.findAll();
        List<TrainStatusSummary> summaries = new ArrayList<>();
        int invalidTrains = 0;
        int onTimeTrains = 0;
        int delayedTrains = 0;
        int cancelledTrains = 0;
        int arrivedTrains = 0;
        long totalDelayMinutes = 0;
        int maximumDelayMinutes = 0;

        for (TrainResponse train : source) {
            if (!isValid(train)) {
                invalidTrains++;
                continue;
            }

            String status = normalizeStatus(train.status());
            int delayMinutes = train.delayMinutes();
            switch (status) {
                case "on-time" -> onTimeTrains++;
                case "delayed" -> delayedTrains++;
                case "cancelled" -> cancelledTrains++;
                case "arrived" -> arrivedTrains++;
                default -> throw new IllegalStateException("Validated train status was not recognized.");
            }

            totalDelayMinutes += delayMinutes;
            maximumDelayMinutes = Math.max(maximumDelayMinutes, delayMinutes);
            summaries.add(new TrainStatusSummary(
                    train.id(),
                    train.number(),
                    train.name(),
                    status,
                    delayMinutes,
                    createStatusSummary(status, delayMinutes)));
        }

        int validTrains = summaries.size();
        double averageDelayMinutes = validTrains == 0
                ? 0
                : (double) totalDelayMinutes / validTrains;

        return new TrainSummaryResponse(
                source.size(),
                validTrains,
                invalidTrains,
                onTimeTrains,
                delayedTrains,
                cancelledTrains,
                arrivedTrains,
                totalDelayMinutes,
                averageDelayMinutes,
                maximumDelayMinutes,
                summaries);
    }

    private static boolean isValid(TrainResponse train) {
        if (train == null
                || isBlank(train.id())
                || isBlank(train.number())
                || isBlank(train.name())
                || train.delayMinutes() < 0) {
            return false;
        }

        return switch (normalizeStatus(train.status())) {
            case "on-time", "delayed", "cancelled", "arrived" -> true;
            default -> false;
        };
    }

    private static String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String createStatusSummary(String status, int delayMinutes) {
        String label = switch (status) {
            case "on-time" -> "On time";
            case "delayed" -> "Delayed";
            case "cancelled" -> "Cancelled";
            case "arrived" -> "Arrived";
            default -> throw new IllegalArgumentException("Unsupported train status: " + status);
        };

        return delayMinutes == 0
                ? label
                : label + " (reported delay: " + delayMinutes + " minutes)";
    }

    public record TrainSummaryResponse(
            int totalTrains,
            int validTrains,
            int invalidTrains,
            int onTimeTrains,
            int delayedTrains,
            int cancelledTrains,
            int arrivedTrains,
            long totalDelayMinutes,
            double averageDelayMinutes,
            int maximumDelayMinutes,
            List<TrainStatusSummary> trains) {
    }

    public record TrainStatusSummary(
            String id,
            String number,
            String name,
            String status,
            int delayMinutes,
            String summary) {
    }
}
