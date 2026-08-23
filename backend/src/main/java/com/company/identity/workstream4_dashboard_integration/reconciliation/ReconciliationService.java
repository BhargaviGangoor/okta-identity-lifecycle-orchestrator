package com.company.identity.workstream4_dashboard_integration.reconciliation;

import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ReconciliationService {

    private final OktaUserClient oktaUserClient;
    private final Map<String, Map<String, Object>> driftStore = new ConcurrentHashMap<>();

    public ReconciliationService(OktaUserClient oktaUserClient) {
        this.oktaUserClient = oktaUserClient;
        initializeBaselineDrift();
    }

    private void initializeBaselineDrift() {
        driftStore.put("drf_101", Map.of(
            "id", "drf_101",
            "user", "Rithika Shetty",
            "userEmail", "rithika@gmail.com",
            "entitlement", "okta-admin-superusers",
            "oktaState", "ASSIGNED directly in Okta Console",
            "policyState", "NOT_PERMITTED by Baseline RBAC",
            "detectedAt", Instant.now().minusSeconds(3600).toString(),
            "risk", "CRITICAL",
            "riskScore", 92,
            "status", "OPEN"
        ));
        driftStore.put("drf_102", Map.of(
            "id", "drf_102",
            "user", "Priya Krishna",
            "userEmail", "priya.krishna.test@example.com",
            "entitlement", "salesforce-system-admin",
            "oktaState", "UNASSIGNED in HR feed, active in Okta",
            "policyState", "REVOKE_REQUIRED (Role change)",
            "detectedAt", Instant.now().minusSeconds(7200).toString(),
            "risk", "HIGH",
            "riskScore", 78,
            "status", "OPEN"
        ));
    }

    public List<Map<String, Object>> reconcile() {
        return new ArrayList<>(driftStore.values());
    }

    public Map<String, Object> remediate(String driftId) {
        Map<String, Object> item = driftStore.get(driftId);
        if (item != null) {
            Map<String, Object> updated = new java.util.HashMap<>(item);
            updated.put("status", "REMEDIATED");
            driftStore.put(driftId, updated);
            return updated;
        }
        return Map.of("id", driftId, "status", "REMEDIATED");
    }
}
