package com.neuroforge.nexus.dto.request;

import com.neuroforge.nexus.entity.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record ProjectStatusUpdateRequest(
        @NotNull(message = "status is required")
        ProjectStatus status
) {}
