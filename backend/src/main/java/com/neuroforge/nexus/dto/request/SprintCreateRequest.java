package com.neuroforge.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SprintCreateRequest(

        @NotBlank(message = "Sprint name is required")
        @Size(max = 150, message = "Sprint name must be at most 150 characters")
        String name,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotBlank(message = "projectId is required")
        String projectId
) {}
