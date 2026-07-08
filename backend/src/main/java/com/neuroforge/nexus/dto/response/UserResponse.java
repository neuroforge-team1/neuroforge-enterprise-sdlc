package com.neuroforge.nexus.dto.response;

public record UserResponse(
        String id,
        String fullName,
        String email
) {}
