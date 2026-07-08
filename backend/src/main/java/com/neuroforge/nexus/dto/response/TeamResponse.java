package com.neuroforge.nexus.dto.response;

import java.util.List;

public record TeamResponse(
        String id,
        String name,
        List<UserResponse> members
) {}
