package com.railtrack.controller;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.railtrack.dto.TrainResponse;
import com.railtrack.dto.TrainStopResponse;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.service.TrainService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TrainController.class)
class TrainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TrainService trainService;

    @Test
    void listsTrainsUsingTheFrontendContract() throws Exception {
        given(trainService.findAll()).willReturn(List.of(demoTrain()));

        mockMvc.perform(get("/api/trains"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].number").value("12345"))
                .andExpect(jsonPath("$[0].type").value("Vande Bharat"))
                .andExpect(jsonPath("$[0].status").value("on-time"))
                .andExpect(jsonPath("$[0].stops[0].stationId").value("NDLS"));
    }

    @Test
    void rejectsBlankSearchTerms() throws Exception {
        mockMvc.perform(get("/api/trains/search").param("q", "  "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void listsStopsForATrain() throws Exception {
        given(trainService.findStops("t-demo"))
                .willReturn(List.of(new TrainStopResponse("NDLS", null, "08:00", "1", 0, 0)));

        mockMvc.perform(get("/api/trains/t-demo/stops"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stationId").value("NDLS"))
                .andExpect(jsonPath("$[0].departure").value("08:00"));
    }

    @Test
    void reportsMissingTrainAsNotFound() throws Exception {
        given(trainService.findById("missing"))
                .willThrow(new ResourceNotFoundException("Train not found: missing"));

        mockMvc.perform(get("/api/trains/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Train not found: missing"));
    }

    private TrainResponse demoTrain() {
        return new TrainResponse(
                "t-demo",
                "12345",
                "Demo Vande Bharat",
                "Vande Bharat",
                "NDLS",
                "BPL",
                "08:00",
                "14:00",
                "6h 0m",
                "on-time",
                0,
                110,
                "NDLS",
                "BPL",
                0.25,
                "1",
                16,
                70,
                700,
                "Daily",
                List.of(new TrainStopResponse("NDLS", null, "08:00", "1", 0, 0)));
    }
}
