package com.neuroforge.nexus.service;

// Minimal shape of a user record returned by
// GET /admin/realms/{realm}/users — only the fields we actually use.
public record KeycloakUserDto(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        Boolean enabled
) {
    public String displayName() {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isEmpty() ? username : full;
    }
}
