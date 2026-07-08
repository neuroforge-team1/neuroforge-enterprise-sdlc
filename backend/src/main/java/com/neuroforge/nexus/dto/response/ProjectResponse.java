package com.neuroforge.nexus.dto.response;

import com.neuroforge.nexus.entity.ProjectStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProjectResponse(
        String id,
        String name,
        String description,
        ProjectStatus status,
        LocalDate milestoneDueDate,
        TeamSummary team,
        UserResponse createdBy,
        LocalDateTime createdAt
) {
    public record TeamSummary(String id, String name, int memberCount) {}
}
