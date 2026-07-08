package com.neuroforge.nexus.mapper;

import com.neuroforge.nexus.dto.response.ProjectResponse;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.Team;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface ProjectMapper {

    default ProjectResponse toResponse(Project project) {
        if (project == null) return null;
        Team team = project.getTeam();
        ProjectResponse.TeamSummary teamSummary = team == null ? null :
                new ProjectResponse.TeamSummary(team.getId(), team.getName(), team.getMembers().size());

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getMilestoneDueDate(),
                teamSummary,
                toUserResponse(project.getCreatedBy()),
                project.getCreatedAt()
        );
    }

    com.neuroforge.nexus.dto.response.UserResponse toUserResponse(com.neuroforge.nexus.entity.User user);
}
