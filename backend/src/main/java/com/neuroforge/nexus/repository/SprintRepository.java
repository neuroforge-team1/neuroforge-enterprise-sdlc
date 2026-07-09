package com.neuroforge.nexus.repository;

import com.neuroforge.nexus.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, String> {
    List<Sprint> findByProjectIdOrderByStartDateAsc(String projectId);
}
