package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.request.AddTeamMemberRequest;
import com.neuroforge.nexus.dto.request.TeamCreateRequest;
import com.neuroforge.nexus.dto.response.TeamResponse;
import com.neuroforge.nexus.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<TeamResponse> create(@Valid @RequestBody TeamCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(request));
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getAll() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<TeamResponse> addMember(@PathVariable String id,
                                                   @Valid @RequestBody AddTeamMemberRequest request) {
        return ResponseEntity.ok(teamService.addMember(id, request));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<Void> removeMember(@PathVariable String id, @PathVariable String userId) {
        teamService.removeMember(id, userId);
        return ResponseEntity.noContent().build();
    }
}
