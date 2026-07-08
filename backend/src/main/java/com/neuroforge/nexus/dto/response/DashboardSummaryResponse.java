package com.neuroforge.nexus.dto.response;

public record DashboardSummaryResponse(
        long activeProjects,
        long totalUsers,
        long totalTeams
) {}
