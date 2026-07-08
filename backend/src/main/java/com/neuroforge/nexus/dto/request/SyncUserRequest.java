package com.neuroforge.nexus.dto.request;

/**
 * Used by /api/users/me on first login to create the local profile mirror
 * row for a Keycloak identity that doesn't have one yet. Fields are sourced
 * directly from the validated JWT claims on the backend, not trusted from
 * client input beyond what the token itself asserts.
 */
public record SyncUserRequest(
        String keycloakId,
        String fullName,
        String email
) {}
