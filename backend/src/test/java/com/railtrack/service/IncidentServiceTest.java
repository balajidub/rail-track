package com.railtrack.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;

import com.railtrack.dto.IncidentStatusRequest;
import com.railtrack.entity.Incident;
import static com.railtrack.entity.RailTrackEnums.IncidentStatus;

import com.railtrack.entity.RailTrackEnums.IncidentCategory;
import com.railtrack.entity.RailTrackEnums.IncidentPriority;
import com.railtrack.entity.RailTrackEnums.IncidentSeverity;
import com.railtrack.entity.ResponseTeam;
import com.railtrack.exception.InvalidIncidentTransitionException;
import com.railtrack.mapper.IncidentMapper;
import com.railtrack.repository.IncidentRepository;
import com.railtrack.repository.ResponseTeamRepository;
import com.railtrack.repository.StationRepository;
import com.railtrack.repository.TrainRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class IncidentServiceTest {

    private IncidentRepository incidentRepository;
    private ResponseTeamRepository responseTeamRepository;
    private IncidentService incidentService;
    private Incident incident;

    @BeforeEach
    void setUp() {
        incidentRepository = mock(IncidentRepository.class);
        responseTeamRepository = mock(ResponseTeamRepository.class);
        incidentService = new IncidentService(
                incidentRepository,
                mock(TrainRepository.class),
                mock(StationRepository.class),
                responseTeamRepository,
                new IncidentMapper());

        incident = new Incident();
        incident.setId(1L);
        incident.setTitle("Signal scenario");
        incident.setDescription("Fictional signal issue");
        incident.setCategory(IncidentCategory.SIGNAL_FAILURE);
        incident.setSeverity(IncidentSeverity.HIGH);
        incident.setPriority(IncidentPriority.URGENT);
        incident.setStatus(IncidentStatus.REPORTED);
        incident.setCreatedAt(Instant.parse("2026-11-14T04:00:00Z"));
        incident.setUpdatedAt(incident.getCreatedAt());
        incident.setHistory(new ArrayList<>());
        given(incidentRepository.findByIdAndDeletedFalse(1L)).willReturn(Optional.of(incident));
        given(incidentRepository.save(any(Incident.class)))
                .willAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void advancesIncidentInOrderAndAssignsAnActiveTeam() {
        ResponseTeam team = new ResponseTeam();
        team.setId(1L);
        team.setName("Track Response Team A");
        team.setSpecialty("Track and signal inspection");
        team.setActive(true);
        given(responseTeamRepository.findFirstByActiveTrueAndSpecialtyContainingIgnoreCaseOrderByIdAsc("track"))
                .willReturn(Optional.of(team));

        incidentService.advanceStatus("INC-000001", new IncidentStatusRequest("Acknowledged", null));
        var response = incidentService.advanceStatus(
                "INC-000001",
                new IncidentStatusRequest("Response Assigned", null));

        assertThat(response.status()).isEqualTo("Response Assigned");
        assertThat(response.responseTeam()).isEqualTo("Track Response Team A");
        assertThat(response.history()).extracting(entry -> entry.status())
                .containsExactly("Acknowledged", "Response Assigned");
    }

    @Test
    void rejectsSkippingWorkflowStates() {
        assertThatThrownBy(() -> incidentService.advanceStatus(
                "INC-000001",
                new IncidentStatusRequest("In Progress", null)))
                .isInstanceOf(InvalidIncidentTransitionException.class);
    }
}
