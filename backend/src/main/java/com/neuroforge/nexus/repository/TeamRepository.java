package com.neuroforge.nexus.repository;

import com.neuroforge.nexus.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, String> {
}
