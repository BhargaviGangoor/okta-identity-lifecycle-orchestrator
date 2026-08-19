package com.company.identity.workstream4_dashboard_integration.audit;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class AuditService {

    private final List<Map<String, Object>> auditLog = new CopyOnWriteArrayList<>();

    public AuditService() {
        // Initial system baseline audit logs
        log(
            "Okta Orchestrator System",
            "SYSTEM_INIT",
            "Tenant Synchronizer",
            "SUCCESS",
            "LOW",
            "Authoritative Okta directory synchronizer initialized"
        );
        log(
            "admin@northwind.io",
            "POLICY_SYNC",
            "Role Policy Baseline",
            "SUCCESS",
            "LOW",
            "Loaded birthright RBAC matrices for Engineering, Finance, Sales"
        );
    }

    public void log(String actor, String action, String target, String result, String risk, String detail) {
        String id = "aud_" + (auditLog.size() + 1001);
        auditLog.add(0, Map.of(
            "id", id,
            "at", Instant.now().toString(),
            "actor", actor,
            "action", action,
            "target", target,
            "result", result,
            "risk", risk,
            "detail", detail
        ));
    }

    public List<Map<String, Object>> getAuditEvents() {
        return new ArrayList<>(auditLog);
    }
}
