package com.neuroforge.nexus.dto.request;

import com.neuroforge.nexus.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ProjectUpdateRequest(

        @NotBlank(message = "Project name is required")
        @Size(max = 150, message = "Project name must be at most 150 characters")
        String name,

        String description,

        ProjectStatus status,

        String teamId,

        LocalDate milestoneDueDate
) {}
