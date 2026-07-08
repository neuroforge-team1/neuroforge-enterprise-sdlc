package com.neuroforge.nexus.service.impl;

import com.neuroforge.nexus.dto.response.UserResponse;
import com.neuroforge.nexus.entity.User;
import com.neuroforge.nexus.mapper.UserMapper;
import com.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.nexus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse syncAndGetCurrentUser(Jwt jwt) {
        String keycloakId = jwt.getSubject();

        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> userRepository.save(User.builder()
                        .id(keycloakId)
                        .keycloakId(keycloakId)
                        .fullName(jwt.getClaimAsString("name") != null
                                ? jwt.getClaimAsString("name")
                                : jwt.getClaimAsString("preferred_username"))
                        .email(jwt.getClaimAsString("email"))
                        .build()));

        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }
}
