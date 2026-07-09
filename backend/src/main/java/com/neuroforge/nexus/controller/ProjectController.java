package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.request.ProjectCreateRequest;
import com.neuroforge.nexus.dto.request.ProjectStatusUpdateRequest;
import com.neuroforge.nexus.dto.request.ProjectUpdateRequest;
import com.neuroforge.nexus.dto.response.ProjectResponse;
import com.neuroforge.nexus.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectCreateRequest request,
                                                   @AuthenticationPrincipal Jwt jwt) {
        ProjectResponse created = projectService.createProject(request, jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<ProjectResponse> update(@PathVariable String id,
                                                   @Valid @RequestBody ProjectUpdateRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // Lighter-weight than the full PUT above: lets a TESTER move a project
    // through ACTIVE / ON_HOLD / COMPLETED after QA sign-off, without
    // needing PROJECT_MANAGER's full edit rights over name/team/dates.
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TESTER','PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<ProjectResponse> updateStatus(@PathVariable String id,
                                                          @Valid @RequestBody ProjectStatusUpdateRequest request) {
        return ResponseEntity.ok(projectService.updateStatus(id, request.status()));
    }
}
