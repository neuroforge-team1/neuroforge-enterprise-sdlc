package com.neuroforge.nexus.service.impl;

import com.neuroforge.nexus.dto.response.DashboardSummaryResponse;
import com.neuroforge.nexus.entity.ProjectStatus;
import com.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.nexus.repository.TeamRepository;
import com.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.nexus.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    @Override
    public DashboardSummaryResponse getSummary() {
        return new DashboardSummaryResponse(
                projectRepository.countByStatus(ProjectStatus.ACTIVE),
                userRepository.count(),
                teamRepository.count()
        );
    }
}
