package com.railtrack.controller;

import java.util.List;

import com.railtrack.dto.IncidentRequest;
import com.railtrack.dto.IncidentResponse;
import com.railtrack.dto.IncidentStatusRequest;
import com.railtrack.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public List<IncidentResponse> findAll() {
        return incidentService.findAll();
    }

    @GetMapping("/{id}")
    public IncidentResponse findById(@PathVariable String id) {
        return incidentService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse create(@Valid @RequestBody IncidentRequest request) {
        return incidentService.create(request);
    }

    @PutMapping("/{id}")
    public IncidentResponse update(
            @PathVariable String id,
            @Valid @RequestBody IncidentRequest request) {
        return incidentService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public IncidentResponse advanceStatus(
            @PathVariable String id,
            @Valid @RequestBody IncidentStatusRequest request) {
        return incidentService.advanceStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        incidentService.delete(id);
    }
}
