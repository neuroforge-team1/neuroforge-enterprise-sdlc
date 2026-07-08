package com.neuroforge.nexus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Placeholder for the DEVOPS_ENGINEER role in Milestone 1. Real deployment
 * health / pipeline data arrives in Milestones 3-4 (CI/CD + Release
 * Monitoring); this stub exists so RBAC for the role can be built and tested
 * now rather than bolted on later.
 */
@RestController
@RequestMapping("/api/devops")
public class DevOpsController {

    @GetMapping("/health")
    @PreAuthorize("hasAnyRole('DEVOPS_ENGINEER','ADMIN')")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "not yet implemented",
                "note", "Deployment tracking arrives in Milestone 3/4"
        ));
    }
}
