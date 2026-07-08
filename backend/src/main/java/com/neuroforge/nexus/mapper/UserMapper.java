package com.neuroforge.nexus.mapper;

import com.neuroforge.nexus.dto.response.UserResponse;
import com.neuroforge.nexus.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
