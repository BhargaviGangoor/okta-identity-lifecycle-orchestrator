package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.workstream4_dashboard_integration.reconciliation.ReconciliationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("")
public class DriftController {

    private final ReconciliationService reconciliationService;

    public DriftController(ReconciliationService reconciliationService) {
        this.reconciliationService = reconciliationService;
    }

    @GetMapping("/drift")
    public List<Map<String, Object>> action() {
        Object res = reconciliationService.reconcile();
        if (res instanceof List) {
            return (List<Map<String, Object>>) res;
        }
        return List.of();
    }

    @PostMapping("/drift/{id}/remediate")
    public Map<String, Object> remediate(@PathVariable String id) {
        reconciliationService.remediate(id);
        return Map.of("driftId", id, "status", "REMEDIATED", "timestamp", Instant.now().toString());
    }
}
