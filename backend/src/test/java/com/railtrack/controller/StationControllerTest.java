package com.railtrack.controller;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import com.railtrack.dto.StationResponse;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.service.StationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StationController.class)
class StationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StationService stationService;

    @Test
    void listsStationsUsingTheFrontendContract() throws Exception {
        given(stationService.findAll()).willReturn(List.of(demoStation()));

        mockMvc.perform(get("/api/stations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("NDLS"))
                .andExpect(jsonPath("$[0].code").value("NDLS"))
                .andExpect(jsonPath("$[0].lat").value(28.642))
                .andExpect(jsonPath("$[0].platforms").value(16));
    }

    @Test
    void reportsMissingStationAsNotFound() throws Exception {
        given(stationService.findById("unknown"))
                .willThrow(new ResourceNotFoundException("Station not found: unknown"));

        mockMvc.perform(get("/api/stations/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Station not found: unknown"));
    }

    private StationResponse demoStation() {
        return new StationResponse(
                "NDLS",
                "NDLS",
                "New Delhi",
                "Delhi",
                "Delhi",
                "NR",
                new BigDecimal("28.642000"),
                new BigDecimal("77.219000"),
                16,
                216);
    }
}
