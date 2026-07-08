package com.neuroforge.nexus.service.impl;

import com.neuroforge.nexus.dto.request.AddTeamMemberRequest;
import com.neuroforge.nexus.dto.request.TeamCreateRequest;
import com.neuroforge.nexus.dto.response.TeamResponse;
import com.neuroforge.nexus.entity.Team;
import com.neuroforge.nexus.entity.User;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.mapper.TeamMapper;
import com.neuroforge.nexus.repository.TeamRepository;
import com.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.nexus.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMapper teamMapper;

    @Override
    @Transactional
    public TeamResponse createTeam(TeamCreateRequest request) {
        Team team = Team.builder().name(request.name()).build();
        return teamMapper.toResponse(teamRepository.save(team));
    }

    @Override
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(teamMapper::toResponse)
                .toList();
    }

    @Override
    public TeamResponse getTeamById(String id) {
        return teamMapper.toResponse(findTeamOrThrow(id));
    }

    @Override
    @Transactional
    public TeamResponse addMember(String teamId, AddTeamMemberRequest request) {
        Team team = findTeamOrThrow(teamId);
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()));
        team.getMembers().add(user);
        return teamMapper.toResponse(teamRepository.save(team));
    }

    @Override
    @Transactional
    public void removeMember(String teamId, String userId) {
        Team team = findTeamOrThrow(teamId);
        team.getMembers().removeIf(u -> u.getId().equals(userId));
        teamRepository.save(team);
    }

    private Team findTeamOrThrow(String id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + id));
    }
}
