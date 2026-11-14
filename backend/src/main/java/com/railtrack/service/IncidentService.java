package com.railtrack.service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

import com.railtrack.dto.IncidentRequest;
import com.railtrack.dto.IncidentResponse;
import com.railtrack.dto.IncidentStatusRequest;
import com.railtrack.entity.Incident;
import com.railtrack.entity.IncidentHistory;
import com.railtrack.entity.RailTrackEnums.IncidentCategory;
import com.railtrack.entity.RailTrackEnums.IncidentPriority;
import com.railtrack.entity.RailTrackEnums.IncidentSeverity;
import com.railtrack.entity.RailTrackEnums.IncidentStatus;
import com.railtrack.entity.ResponseTeam;
import com.railtrack.entity.Station;
import com.railtrack.entity.Train;
import com.railtrack.exception.InvalidIncidentTransitionException;
import com.railtrack.exception.ResourceNotFoundException;
import com.railtrack.mapper.IncidentMapper;
import com.railtrack.repository.IncidentRepository;
import com.railtrack.repository.ResponseTeamRepository;
import com.railtrack.repository.StationRepository;
import com.railtrack.repository.TrainRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class IncidentService {

    private static final List<IncidentStatus> WORKFLOW = List.of(
            IncidentStatus.REPORTED,
            IncidentStatus.ACKNOWLEDGED,
            IncidentStatus.RESPONSE_ASSIGNED,
            IncidentStatus.IN_PROGRESS,
            IncidentStatus.RESOLVED);

    private final IncidentRepository incidentRepository;
    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;
    private final ResponseTeamRepository responseTeamRepository;
    private final IncidentMapper incidentMapper;

    public IncidentService(
            IncidentRepository incidentRepository,
            TrainRepository trainRepository,
            StationRepository stationRepository,
            ResponseTeamRepository responseTeamRepository,
            IncidentMapper incidentMapper) {
        this.incidentRepository = incidentRepository;
        this.trainRepository = trainRepository;
        this.stationRepository = stationRepository;
        this.responseTeamRepository = responseTeamRepository;
        this.incidentMapper = incidentMapper;
    }

    public List<IncidentResponse> findAll() {
        return incidentRepository.findAllByDeletedFalseOrderByUpdatedAtDesc().stream()
                .map(incidentMapper::toResponse)
                .toList();
    }

    public IncidentResponse findById(String incidentId) {
        return incidentMapper.toResponse(findActive(parseId(incidentId)));
    }

    @Transactional
    public IncidentResponse create(IncidentRequest request) {
        Instant now = Instant.now();
        Incident incident = new Incident();
        applyRequest(incident, request);
        incident.setStatus(IncidentStatus.REPORTED);
        incident.setCreatedAt(now);
        incident.setUpdatedAt(now);
        incident.setDeleted(false);
        incidentRepository.save(incident);
        appendHistory(incident, IncidentStatus.REPORTED, "Incident reported to the control room.", now);
        return incidentMapper.toResponse(incidentRepository.save(incident));
    }

    @Transactional
    public IncidentResponse update(String incidentId, IncidentRequest request) {
        Incident incident = findActive(parseId(incidentId));
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new InvalidIncidentTransitionException("Resolved incidents cannot be edited.");
        }
        applyRequest(incident, request);
        Instant now = Instant.now();
        incident.setUpdatedAt(now);
        appendHistory(incident, incident.getStatus(), "Incident details updated.", now);
        return incidentMapper.toResponse(incidentRepository.save(incident));
    }

    @Transactional
    public IncidentResponse advanceStatus(String incidentId, IncidentStatusRequest request) {
        Incident incident = findActive(parseId(incidentId));
        IncidentStatus nextStatus = parseEnum(IncidentStatus.class, request.status());
        int nextIndex = WORKFLOW.indexOf(incident.getStatus()) + 1;
        if (nextIndex >= WORKFLOW.size() || WORKFLOW.get(nextIndex) != nextStatus) {
            throw new InvalidIncidentTransitionException(
                    "Incident must advance from " + display(incident.getStatus()) + " to its next workflow state.");
        }

        if (nextStatus == IncidentStatus.RESPONSE_ASSIGNED) {
            incident.setResponseTeam(selectResponseTeam(incident.getCategory(), request.responseTeamId()));
        }
        incident.setStatus(nextStatus);
        Instant now = Instant.now();
        incident.setUpdatedAt(now);
        appendHistory(incident, nextStatus, "Status advanced to " + display(nextStatus) + ".", now);
        return incidentMapper.toResponse(incidentRepository.save(incident));
    }

    @Transactional
    public void delete(String incidentId) {
        Incident incident = findActive(parseId(incidentId));
        incident.setDeleted(true);
        incident.setUpdatedAt(Instant.now());
        incidentRepository.save(incident);
    }

    private Incident findActive(Long id) {
        return incidentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + incidentMapper.formatId(id)));
    }

    private void applyRequest(Incident incident, IncidentRequest request) {
        incident.setTitle(request.title().trim());
        incident.setDescription(request.description().trim());
        incident.setCategory(parseEnum(IncidentCategory.class, request.category()));
        incident.setSeverity(parseEnum(IncidentSeverity.class, request.severity()));
        incident.setPriority(parseEnum(IncidentPriority.class, request.priority()));
        incident.setTrain(resolveTrain(request.trainId()));
        incident.setStation(resolveStation(request.stationId()));
    }

    private Train resolveTrain(String trainId) {
        if (trainId == null || trainId.isBlank()) return null;
        return trainRepository.findById(trainId)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found: " + trainId));
    }

    private Station resolveStation(String stationId) {
        if (stationId == null || stationId.isBlank()) return null;
        return stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + stationId));
    }

    private ResponseTeam selectResponseTeam(IncidentCategory category, Long requestedTeamId) {
        if (requestedTeamId != null) {
            ResponseTeam team = responseTeamRepository.findById(requestedTeamId)
                    .orElseThrow(() -> new ResourceNotFoundException("Response team not found: " + requestedTeamId));
            if (!team.isActive()) {
                throw new InvalidIncidentTransitionException("The selected response team is inactive.");
            }
            return team;
        }

        String specialty = category == IncidentCategory.STATION_OVERCROWDING ? "station" : "track";
        return responseTeamRepository
                .findFirstByActiveTrueAndSpecialtyContainingIgnoreCaseOrderByIdAsc(specialty)
                .or(() -> responseTeamRepository.findFirstByActiveTrueOrderByIdAsc())
                .orElseThrow(() -> new InvalidIncidentTransitionException(
                        "No active response team is available for this incident."));
    }

    private void appendHistory(Incident incident, IncidentStatus status, String note, Instant timestamp) {
        IncidentHistory entry = new IncidentHistory();
        entry.setIncident(incident);
        entry.setStatus(status);
        entry.setNote(note);
        entry.setOccurredAt(timestamp);
        incident.getHistory().add(entry);
    }

    private Long parseId(String incidentId) {
        String normalized = incidentId.trim().toUpperCase(Locale.ROOT);
        if (normalized.startsWith("INC-")) normalized = normalized.substring(4);
        try {
            return Long.parseLong(normalized);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid incident id: " + incidentId);
        }
    }

    private <T extends Enum<T>> T parseEnum(Class<T> enumType, String value) {
        String normalized = value.trim()
                .replace('-', '_')
                .replace(' ', '_')
                .toUpperCase(Locale.ROOT);
        try {
            return Enum.valueOf(enumType, normalized);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid " + enumType.getSimpleName() + ": " + value);
        }
    }

    private String display(IncidentStatus status) {
        return status.name().toLowerCase(Locale.ROOT).replace('_', ' ');
    }
}
