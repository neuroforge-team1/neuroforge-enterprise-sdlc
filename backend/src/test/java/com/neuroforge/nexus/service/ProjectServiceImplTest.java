package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.request.ProjectCreateRequest;
import com.neuroforge.nexus.dto.response.ProjectResponse;
import com.neuroforge.nexus.entity.User;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.mapper.ProjectMapper;
import com.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.nexus.repository.TeamRepository;
import com.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.nexus.service.impl.ProjectServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository;

    private final ProjectMapper projectMapper = Mappers.getMapper(ProjectMapper.class);

    @InjectMocks
    private ProjectServiceImpl projectService;

    @Test
    void createProject_throwsWhenCreatorNotFound() {
        when(userRepository.findById("missing-user")).thenReturn(Optional.empty());

        ProjectCreateRequest request = new ProjectCreateRequest("Payments Revamp", "desc", null, null);

        assertThatThrownBy(() -> projectService.createProject(request, "missing-user"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing-user");
    }

    @Test
    void createProject_savesProjectForKnownCreator() {
        User creator = User.builder().id("user-1").keycloakId("user-1").fullName("Preethi").email("preethi@nexus.dev").build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(creator));
        when(projectRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectCreateRequest request = new ProjectCreateRequest("Payments Revamp", "desc", null, null);

        var result = projectService.createProject(request, "user-1");

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Payments Revamp");
        assertThat(result.createdBy().id()).isEqualTo("user-1");
    }
}
