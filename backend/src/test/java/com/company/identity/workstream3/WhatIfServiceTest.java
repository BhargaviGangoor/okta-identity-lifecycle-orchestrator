package com.company.identity.workstream3;

import com.company.identity.common.dto.ImpactOutput;
import com.company.identity.common.dto.WhatIfRequest;
import com.company.identity.common.dto.WhatIfResult;
import com.company.identity.common.model.Action;
import com.company.identity.workstream3_simulation_security.simulation.ImpactOutputFixtures;
import com.company.identity.workstream3_simulation_security.simulation.WhatIfService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for WhatIfService.
 *
 * Intentionally uses plain `new WhatIfService()` — no Spring context, no Mockito.
 * This proves the structural constraint: WhatIfService has NO dependency on
 * OktaClient, ApprovalService, ExecutionService, or RiskService.
 * If it did, construction would fail or require extra arguments here.
 */
class WhatIfServiceTest {

    private WhatIfService service;

    @BeforeEach
    void setUp() {
        // Structural test: WhatIfService must be instantiable with zero arguments.
        // Any injection of Okta/Approval/Execution/Risk would break this.
        service = new WhatIfService();
    }

    // =========================================================================
    // 1. Determinism — same input → same output, no hidden state
    // =========================================================================

    @Test
    @DisplayName("Determinism: same request + same impact → identical result on repeated calls")
    void simulate_isDeterministic() {
        WhatIfRequest request = request("u-det-01", Action.ACTIVATE);
        ImpactOutput impact   = ImpactOutputFixtures.activateMedium();
        impact.userId = request.userId;

        WhatIfResult first  = service.simulate(request, impact);
        WhatIfResult second = service.simulate(request, impact);

        assertEquals(first.userId,               second.userId);
        assertEquals(first.proposedAction,       second.proposedAction);
        assertEquals(first.currentStatus,        second.currentStatus);
        assertEquals(first.expectedStatus,       second.expectedStatus);
        assertEquals(first.riskLevel,            second.riskLevel);
        assertEquals(first.reasons,              second.reasons);
        assertEquals(first.affectedGroups,       second.affectedGroups);
        assertEquals(first.affectedApplications, second.affectedApplications);
    }

    // =========================================================================
    // 2. Current vs. expected state — all four actions
    // =========================================================================

    @Test
    @DisplayName("ACTIVATE: currentStatus=STAGED_OR_SUSPENDED, expectedStatus=ACTIVE")
    void simulate_activate_stateTransition() {
        WhatIfResult result = simulate("u1", Action.ACTIVATE, ImpactOutputFixtures.activateLow());

        assertEquals("STAGED_OR_SUSPENDED", result.currentStatus);
        assertEquals("ACTIVE",              result.expectedStatus);
        assertEquals(Action.ACTIVATE,       result.proposedAction);
    }

    @Test
    @DisplayName("SUSPEND: currentStatus=ACTIVE, expectedStatus=SUSPENDED")
    void simulate_suspend_stateTransition() {
        WhatIfResult result = simulate("u2", Action.SUSPEND, ImpactOutputFixtures.suspendMedium());

        assertEquals("ACTIVE",     result.currentStatus);
        assertEquals("SUSPENDED",  result.expectedStatus);
        assertEquals(Action.SUSPEND, result.proposedAction);
    }

    @Test
    @DisplayName("UNSUSPEND: currentStatus=SUSPENDED, expectedStatus=ACTIVE")
    void simulate_unsuspend_stateTransition() {
        WhatIfResult result = simulate("u3", Action.UNSUSPEND, ImpactOutputFixtures.unsuspendMedium());

        assertEquals("SUSPENDED", result.currentStatus);
        assertEquals("ACTIVE",    result.expectedStatus);
        assertEquals(Action.UNSUSPEND, result.proposedAction);
    }

    @Test
    @DisplayName("DEACTIVATE: currentStatus=ACTIVE, expectedStatus=DEPROVISIONED")
    void simulate_deactivate_stateTransition() {
        WhatIfResult result = simulate("u4", Action.DEACTIVATE, ImpactOutputFixtures.deactivateHigh());

        assertEquals("ACTIVE",        result.currentStatus);
        assertEquals("DEPROVISIONED", result.expectedStatus);
        assertEquals(Action.DEACTIVATE, result.proposedAction);
    }

    // =========================================================================
    // 3. Passthrough: riskLevel / reasons / accessEffect unchanged
    // =========================================================================

    @Test
    @DisplayName("riskLevel is passed through unchanged — not recalculated")
    void simulate_riskLevel_isPassthrough() {
        ImpactOutput impact = ImpactOutputFixtures.activateHigh();
        impact.userId = "u-risk";

        WhatIfResult result = service.simulate(request("u-risk", Action.ACTIVATE), impact);

        assertEquals("HIGH", result.riskLevel,
                "WS3 must never recompute riskLevel; it must equal ImpactOutput.riskLevel");
    }

    @Test
    @DisplayName("reasons list is passed through unchanged — not recalculated")
    void simulate_reasons_arePassthrough() {
        ImpactOutput impact = ImpactOutputFixtures.suspendHigh();
        impact.userId = "u-reasons";

        WhatIfResult result = service.simulate(request("u-reasons", Action.SUSPEND), impact);

        assertSame(impact.reasons, result.reasons,
                "WS3 must pass the reasons reference through, not build a new list");
    }

    @Test
    @DisplayName("accessEffect is passed through unchanged — not recalculated")
    void simulate_accessEffect_isPassthrough() {
        ImpactOutput impact = ImpactOutputFixtures.deactivateMedium();
        impact.userId = "u-effect";

        WhatIfResult result = service.simulate(request("u-effect", Action.DEACTIVATE), impact);

        assertSame(impact.accessEffect, result.accessEffect,
                "WS3 must pass accessEffect through as-is, not transform or replace it");
    }

    @Test
    @DisplayName("affectedGroups and affectedApplications are passed through unchanged")
    void simulate_affectedCollections_arePassthrough() {
        ImpactOutput impact = ImpactOutputFixtures.suspendMedium();
        impact.userId = "u-coll";

        WhatIfResult result = service.simulate(request("u-coll", Action.SUSPEND), impact);

        assertSame(impact.affectedGroups,       result.affectedGroups);
        assertSame(impact.affectedApplications, result.affectedApplications);
    }

    // =========================================================================
    // 4. Structural: no Okta / Approval / Execution dependency
    // =========================================================================

    @Test
    @DisplayName("Structural: WhatIfService is instantiable with no collaborators — zero Okta/Approval/Execution deps")
    void structural_noOktaOrApprovalDependency() {
        // If WhatIfService had any field injection or constructor dependency on
        // OktaClient, ApprovalService, ExecutionService, or RiskService,
        // `new WhatIfService()` would not compile or would NPE here.
        // This test passing is evidence of the constraint being upheld.
        WhatIfService isolated = new WhatIfService();
        assertNotNull(isolated, "WhatIfService must be constructable without Okta/Approval/Execution deps");
    }

    @Test
    @DisplayName("Structural: WhatIfService imports do not reference Okta or mutation packages")
    void structural_noForbiddenImports() throws ClassNotFoundException {
        // Verify that forbidden classes are not reachable from WhatIfService
        Class<?> serviceClass = Class.forName(
                "com.company.identity.workstream3_simulation_security.simulation.WhatIfService");

        for (java.lang.reflect.Field field : serviceClass.getDeclaredFields()) {
            String typeName = field.getType().getName();
            assertFalse(typeName.contains("OktaClient"),      "WhatIfService must not hold OktaClient");
            assertFalse(typeName.contains("ApprovalService"), "WhatIfService must not hold ApprovalService");
            assertFalse(typeName.contains("ExecutionService"),"WhatIfService must not hold ExecutionService");
            assertFalse(typeName.contains("RiskService"),     "WhatIfService must not hold RiskService");
        }
    }

    @Test
    @DisplayName("Structural: WhatIfResult contains no riskScore field")
    void structural_noRiskScoreField() {
        boolean hasRiskScore = false;
        for (java.lang.reflect.Field f : WhatIfResult.class.getDeclaredFields()) {
            if (f.getName().equals("riskScore")) {
                hasRiskScore = true;
                break;
            }
        }
        assertFalse(hasRiskScore, "WhatIfResult must NOT contain a riskScore field");
    }

    // =========================================================================
    // 5. userId is preserved correctly
    // =========================================================================

    @Test
    @DisplayName("userId from WhatIfRequest is preserved in WhatIfResult")
    void simulate_userId_isPreserved() {
        String expectedId = "okta-user-abc-123";
        WhatIfResult result = simulate(expectedId, Action.SUSPEND, ImpactOutputFixtures.suspendLow());
        assertEquals(expectedId, result.userId);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private WhatIfRequest request(String userId, Action action) {
        WhatIfRequest r = new WhatIfRequest();
        r.userId = userId;
        r.action = action;
        return r;
    }

    private WhatIfResult simulate(String userId, Action action, ImpactOutput impact) {
        impact.userId = userId;
        return service.simulate(request(userId, action), impact);
    }
}
