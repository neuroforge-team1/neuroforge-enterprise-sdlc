package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.request.AddTeamMemberRequest;
import com.neuroforge.nexus.dto.request.TeamCreateRequest;
import com.neuroforge.nexus.dto.response.TeamResponse;

import java.util.List;

public interface TeamService {
    TeamResponse createTeam(TeamCreateRequest request);
    List<TeamResponse> getAllTeams();
    TeamResponse getTeamById(String id);
    TeamResponse addMember(String teamId, AddTeamMemberRequest request);
    void removeMember(String teamId, String userId);
}
