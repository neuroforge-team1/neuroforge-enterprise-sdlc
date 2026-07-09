package com.neuroforge.nexus.mapper;

import com.neuroforge.nexus.dto.response.SprintResponse;
import com.neuroforge.nexus.entity.Sprint;
import org.springframework.stereotype.Component;

@Component
public class SprintMapper {

    public SprintResponse toResponse(Sprint sprint) {
        if (sprint == null) return null;
        return new SprintResponse(
                sprint.getId(),
                sprint.getName(),
                sprint.getStartDate(),
                sprint.getEndDate(),
                sprint.getStatus(),
                sprint.getProject().getId(),
                sprint.getProject().getName(),
                sprint.getCreatedAt()
        );
    }
}
