package com.neuroforge.nexus.dto.request;

import com.neuroforge.nexus.entity.SprintStatus;
import jakarta.validation.constraints.NotNull;

public record SprintStatusUpdateRequest(
        @NotNull(message = "status is required")
        SprintStatus status
) {}
