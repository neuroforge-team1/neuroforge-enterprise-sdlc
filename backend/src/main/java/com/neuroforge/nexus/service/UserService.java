package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.response.UserResponse;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public interface UserService {
    /** Ensures a local profile-mirror row exists for the authenticated Keycloak user, creating it on first login. */
    UserResponse syncAndGetCurrentUser(Jwt jwt);
    List<UserResponse> getAllUsers();

    // Pulls every user from Keycloak (not just the ones who've logged in
    // here before) and upserts them into the local users table. See
    // KeycloakAdminService for the required client setup.
    UserSyncResult syncAllFromKeycloak();

    record UserSyncResult(int created, int updated, int total) {}
}
