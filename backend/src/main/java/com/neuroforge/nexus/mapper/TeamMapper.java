package com.neuroforge.nexus.mapper;

import com.neuroforge.nexus.dto.response.TeamResponse;
import com.neuroforge.nexus.entity.Team;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface TeamMapper {
    // MapStruct auto-maps Team.members (Set<User>) -> TeamResponse.members (List<UserResponse>)
    // using UserMapper#toResponse for each element.
    TeamResponse toResponse(Team team);
}
