package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.request.SprintCreateRequest;
import com.neuroforge.nexus.dto.response.SprintResponse;
import com.neuroforge.nexus.entity.SprintStatus;

import java.util.List;

public interface SprintService {
    SprintResponse createSprint(SprintCreateRequest request);
    List<SprintResponse> getSprintsForProject(String projectId);
    SprintResponse updateStatus(String sprintId, SprintStatus status);
    void deleteSprint(String sprintId);
}
