package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.request.SprintCreateRequest;
import com.neuroforge.nexus.dto.request.SprintStatusUpdateRequest;
import com.neuroforge.nexus.dto.response.SprintResponse;
import com.neuroforge.nexus.service.SprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Basic sprint tracking (create + status only) — see Sprint entity javadoc
 * for scope. Status transitions are open to DEVELOPER as well as
 * PROJECT_MANAGER/ADMIN, since moving a sprint from PLANNED -> ACTIVE ->
 * COMPLETED reflects real engineering work, not planning.
 */
@RestController
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<SprintResponse> create(@Valid @RequestBody SprintCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sprintService.createSprint(request));
    }

    @GetMapping
    public ResponseEntity<List<SprintResponse>> getForProject(@RequestParam String projectId) {
        return ResponseEntity.ok(sprintService.getSprintsForProject(projectId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DEVELOPER','PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<SprintResponse> updateStatus(@PathVariable String id,
                                                         @Valid @RequestBody SprintStatusUpdateRequest request) {
        return ResponseEntity.ok(sprintService.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }
}
