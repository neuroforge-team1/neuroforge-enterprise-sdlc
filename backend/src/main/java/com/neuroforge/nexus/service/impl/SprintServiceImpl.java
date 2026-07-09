package com.neuroforge.nexus.service.impl;

import com.neuroforge.nexus.dto.request.SprintCreateRequest;
import com.neuroforge.nexus.dto.response.SprintResponse;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.Sprint;
import com.neuroforge.nexus.entity.SprintStatus;
import com.neuroforge.nexus.exception.BadRequestException;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.mapper.SprintMapper;
import com.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.nexus.repository.SprintRepository;
import com.neuroforge.nexus.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SprintServiceImpl implements SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final SprintMapper sprintMapper;

    @Override
    @Transactional
    public SprintResponse createSprint(SprintCreateRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("Sprint end date cannot be before the start date");
        }

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + request.projectId()));

        Sprint sprint = Sprint.builder()
                .name(request.name())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .project(project)
                .build();

        return sprintMapper.toResponse(sprintRepository.save(sprint));
    }

    @Override
    public List<SprintResponse> getSprintsForProject(String projectId) {
        return sprintRepository.findByProjectIdOrderByStartDateAsc(projectId).stream()
                .map(sprintMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public SprintResponse updateStatus(String sprintId, SprintStatus status) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found: " + sprintId));
        sprint.setStatus(status);
        return sprintMapper.toResponse(sprintRepository.save(sprint));
    }

    @Override
    @Transactional
    public void deleteSprint(String sprintId) {
        if (!sprintRepository.existsById(sprintId)) {
            throw new ResourceNotFoundException("Sprint not found: " + sprintId);
        }
        sprintRepository.deleteById(sprintId);
    }
}
