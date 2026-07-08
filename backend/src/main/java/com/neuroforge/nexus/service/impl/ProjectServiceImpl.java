package com.neuroforge.nexus.service.impl;

import com.neuroforge.nexus.dto.request.ProjectCreateRequest;
import com.neuroforge.nexus.dto.request.ProjectUpdateRequest;
import com.neuroforge.nexus.dto.response.ProjectResponse;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.Team;
import com.neuroforge.nexus.entity.User;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.mapper.ProjectMapper;
import com.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.nexus.repository.TeamRepository;
import com.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.nexus.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request, String currentUserId) {
        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found: " + currentUserId));

        Team team = null;
        if (request.teamId() != null && !request.teamId().isBlank()) {
            team = teamRepository.findById(request.teamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + request.teamId()));
        }

        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .team(team)
                .createdBy(creator)
                .milestoneDueDate(request.milestoneDueDate())
                .build();

        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    @Override
    public ProjectResponse getProjectById(String id) {
        return projectMapper.toResponse(findProjectOrThrow(id));
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(String id, ProjectUpdateRequest request) {
        Project project = findProjectOrThrow(id);

        project.setName(request.name());
        project.setDescription(request.description());
        project.setMilestoneDueDate(request.milestoneDueDate());

        if (request.status() != null) {
            project.setStatus(request.status());
        }

        if (request.teamId() != null) {
            if (request.teamId().isBlank()) {
                project.setTeam(null);
            } else {
                Team team = teamRepository.findById(request.teamId())
                        .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + request.teamId()));
                project.setTeam(team);
            }
        }

        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Override
    @Transactional
    public void deleteProject(String id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }

    private Project findProjectOrThrow(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }
}
