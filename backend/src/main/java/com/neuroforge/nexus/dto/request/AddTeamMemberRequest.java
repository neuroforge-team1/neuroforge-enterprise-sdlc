package com.neuroforge.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AddTeamMemberRequest(

        @NotBlank(message = "userId is required")
        String userId
) {}
