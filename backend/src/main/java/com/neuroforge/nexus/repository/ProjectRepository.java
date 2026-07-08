package com.neuroforge.nexus.repository;

import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, String> {
    List<Project> findByStatus(ProjectStatus status);
    long countByStatus(ProjectStatus status);
}
