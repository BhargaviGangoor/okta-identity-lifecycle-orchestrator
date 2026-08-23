package com.company.identity.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "Okta Identity Lifecycle Orchestrator API",
                "status", "HEALTHY",
                "timestamp", Instant.now().toString(),
                "endpoints", List.of(
                        "/api/users",
                        "/api/groups",
                        "/api/graph",
                        "/api/audit",
                        "/api/drift/scan",
                        "/api/whatif/evaluate",
                        "/api/joiner/simulate",
                        "/api/mover/simulate",
                        "/api/leaver/simulate"
                )
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        ));
    }
}
