package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.workstream3_simulation_security.execution.ExecutionResult;
import com.company.identity.workstream3_simulation_security.execution.ExecutionService;
import com.company.identity.workstream4_dashboard_integration.audit.AuditService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("")
public class ExecutionController {

    private final ExecutionService executionService;
    private final AuditService auditService;

    public ExecutionController(ExecutionService executionService, AuditService auditService) {
        this.executionService = executionService;
        this.auditService = auditService;
    }

    @PostMapping("/execution/{simulationId}")
    public ExecutionResult action(
            @PathVariable String simulationId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action,
            @RequestBody(required = false) Map<String, Object> body) throws Exception {
        String effectiveUser = userId != null ? userId : (body != null && body.containsKey("userId") ? String.valueOf(body.get("userId")) : "unknown-user");
        String effectiveAction = action != null ? action : (body != null && body.containsKey("action") ? String.valueOf(body.get("action")) : "ACTIVATE");
        ExecutionResult result = executionService.executeApprovedAction(simulationId, effectiveUser, effectiveAction);
        auditService.log(
            "admin@northwind.io",
            "MUTATION_EXECUTED",
            "Target: " + effectiveUser + " (" + effectiveAction + ")",
            "SUCCESS",
            "HIGH",
            "Executed approved lifecycle action in Okta"
        );
        return result;
    }
}
