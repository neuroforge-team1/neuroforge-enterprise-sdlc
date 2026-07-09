package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.request.ProjectCreateRequest;
import com.neuroforge.nexus.dto.request.ProjectUpdateRequest;
import com.neuroforge.nexus.dto.response.ProjectResponse;
import com.neuroforge.nexus.entity.ProjectStatus;

import java.util.List;

public interface ProjectService {
    ProjectResponse createProject(ProjectCreateRequest request, String currentUserId);
    List<ProjectResponse> getAllProjects();
    ProjectResponse getProjectById(String id);
    ProjectResponse updateProject(String id, ProjectUpdateRequest request);
    ProjectResponse updateStatus(String id, ProjectStatus status);
    void deleteProject(String id);
}
