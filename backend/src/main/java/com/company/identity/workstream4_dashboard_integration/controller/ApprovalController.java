package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.workstream3_simulation_security.approval.ApprovalResult;
import com.company.identity.workstream3_simulation_security.approval.ApprovalService;
import com.company.identity.workstream4_dashboard_integration.audit.AuditService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final AuditService auditService;

    public ApprovalController(ApprovalService approvalService, AuditService auditService) {
        this.approvalService = approvalService;
        this.auditService = auditService;
    }

    @PostMapping("/approval/{simulationId}/approve")
    public ApprovalResult approve(@PathVariable String simulationId) {
        ApprovalResult res = approvalService.approve(simulationId);
        auditService.log(
            "security.reviewer@northwind.io",
            "SIMULATION_APPROVED",
            "Simulation ID: " + simulationId,
            "SUCCESS",
            "MEDIUM",
            "Approved lifecycle mutation proposal for execution"
        );
        return res;
    }

    @PostMapping("/approval/{simulationId}/reject")
    public ApprovalResult reject(@PathVariable String simulationId) {
        ApprovalResult res = approvalService.reject(simulationId);
        auditService.log(
            "security.reviewer@northwind.io",
            "SIMULATION_REJECTED",
            "Simulation ID: " + simulationId,
            "BLOCKED",
            "HIGH",
            "Rejected mutation due to policy / risk constraint"
        );
        return res;
    }
}
