package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.response.UserResponse;
import com.neuroforge.nexus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.syncAndGetCurrentUser(jwt));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Pulls every user from Keycloak into the local users table, so people
    // who've never logged into this app yet still show up in pickers (team
    // membership, project ownership, etc). See KeycloakAdminService.
    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserService.UserSyncResult> sync() {
        return ResponseEntity.ok(userService.syncAllFromKeycloak());
    }
}
