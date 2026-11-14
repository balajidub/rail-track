package com.railtrack.mapper;

import com.railtrack.dto.StationResponse;
import com.railtrack.entity.Station;
import org.springframework.stereotype.Component;

@Component
public class StationMapper {

    public StationResponse toResponse(Station station) {
        return new StationResponse(
                station.getId(),
                station.getCode(),
                station.getName(),
                station.getCity(),
                station.getState(),
                station.getZone(),
                station.getLatitude(),
                station.getLongitude(),
                station.getPlatformCount(),
                station.getElevationMeters());
    }
}
