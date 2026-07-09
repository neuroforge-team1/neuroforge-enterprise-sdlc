package com.neuroforge.nexus.service.impl;

import com.neuroforge.nexus.dto.response.UserResponse;
import com.neuroforge.nexus.entity.User;
import com.neuroforge.nexus.mapper.UserMapper;
import com.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.nexus.service.KeycloakAdminService;
import com.neuroforge.nexus.service.KeycloakUserDto;
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
    private final KeycloakAdminService keycloakAdminService;

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

    @Override
    @Transactional
    public UserSyncResult syncAllFromKeycloak() {
        List<KeycloakUserDto> keycloakUsers = keycloakAdminService.fetchAllUsers();

        int created = 0;
        int updated = 0;

        for (KeycloakUserDto kcUser : keycloakUsers) {
            if (kcUser.email() == null || kcUser.email().isBlank()) {
                // Skip service accounts / users with no email — nothing to
                // join them against in the app's local tables.
                continue;
            }

            var existing = userRepository.findByKeycloakId(kcUser.id());
            if (existing.isPresent()) {
                User user = existing.get();
                user.setFullName(kcUser.displayName());
                user.setEmail(kcUser.email());
                userRepository.save(user);
                updated++;
            } else {
                userRepository.save(User.builder()
                        .id(kcUser.id())
                        .keycloakId(kcUser.id())
                        .fullName(kcUser.displayName())
                        .email(kcUser.email())
                        .build());
                created++;
            }
        }

        return new UserSyncResult(created, updated, keycloakUsers.size());
    }
}
