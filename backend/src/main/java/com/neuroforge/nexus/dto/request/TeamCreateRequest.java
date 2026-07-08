package com.neuroforge.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeamCreateRequest(

        @NotBlank(message = "Team name is required")
        @Size(max = 100, message = "Team name must be at most 100 characters")
        String name
) {}
