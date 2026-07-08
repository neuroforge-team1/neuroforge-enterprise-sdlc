package com.neuroforge.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ProjectCreateRequest(

        @NotBlank(message = "Project name is required")
        @Size(max = 150, message = "Project name must be at most 150 characters")
        String name,

        String description,

        String teamId,

        LocalDate milestoneDueDate
) {}
