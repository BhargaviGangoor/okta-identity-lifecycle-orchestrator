package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.common.dto.LeaverRequest;
import com.company.identity.workstream1_okta_lifecycle.lifecycle.LeaverService;
import com.company.identity.workstream4_dashboard_integration.audit.AuditService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("")
public class LeaverController {

    private final LeaverService leaverService;
    private final AuditService auditService;

    public LeaverController(LeaverService leaverService, AuditService auditService) {
        this.leaverService = leaverService;
        this.auditService = auditService;
    }

    @PostMapping("/lifecycle/leaver/{id}")
    public Map<String, Object> deactivateUser(@PathVariable String id, @RequestBody(required = false) LeaverRequest request) throws Exception {
        leaverService.leaver(id, request != null ? request : new LeaverRequest());
        auditService.log(
            "admin@northwind.io",
            "LEAVER_DEPROVISIONED",
            "Identity ID: " + id,
            "SUCCESS",
            "HIGH",
            "Deactivated identity in Okta and revoked all federated sessions"
        );
        return Map.of("success", true, "userId", id, "status", "DEACTIVATED");
    }
}