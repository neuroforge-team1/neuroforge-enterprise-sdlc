package com.neuroforge.nexus.dto.response;

import com.neuroforge.nexus.entity.SprintStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SprintResponse(
        String id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        SprintStatus status,
        String projectId,
        String projectName,
        LocalDateTime createdAt
) {}
