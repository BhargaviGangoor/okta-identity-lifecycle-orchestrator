package com.company.identity.workstream3_simulation_security.simulation;

import com.company.identity.common.dto.ImpactOutput;
import com.company.identity.common.dto.WhatIfRequest;
import com.company.identity.common.dto.WhatIfResult;
import com.company.identity.common.model.Action;
import org.springframework.stereotype.Service;

/**
 * What-If Simulation Service — Workstream 3, Member 5 ownership.
 *
 * CONTRACT CONSTRAINTS (enforced by design):
 *
 *   1. READ-ONLY: This service MUST NOT import or call anything from:
 *        - workstream1_okta_lifecycle (OktaClient, JoinerService, etc.)
 *        - workstream3_simulation_security.approval (ApprovalService)
 *        - workstream3_simulation_security.execution (ExecutionService)
 *        - workstream3_simulation_security.risk (RiskService)
 *      The simulation is a projection only — it never mutates Okta.
 *
 *   2. DETERMINISTIC: Same WhatIfRequest + same ImpactOutput → identical WhatIfResult.
 *      No randomness, no hidden mutable state.
 *
 *   3. PASSTHROUGH: riskLevel, reasons, and accessEffect are copied from ImpactOutput
 *      verbatim. This service does NOT recalculate or override them.
 *
 *   4. NO NUMERIC RISK SCORE: There is no riskScore field anywhere in this class.
 */
@Service
public class WhatIfService {

    /**
     * Runs a What-If simulation for the proposed action.
     *
     * @param request  Validated incoming request (userId + proposed Action).
     * @param impact   ImpactOutput from WS2 (or a mock fixture during development).
     * @return         WhatIfResult ready for WS4 (React dashboard) to render.
     */
    public WhatIfResult simulate(WhatIfRequest request, ImpactOutput impact) {
        String currentStatus  = deriveCurrentStatus(request.action);
        String expectedStatus = deriveExpectedStatus(request.action);

        return new WhatIfResult(
                request.userId,
                request.action,
                currentStatus,
                expectedStatus,
                impact.affectedGroups,        // passthrough
                impact.affectedApplications,  // passthrough
                impact.riskLevel,             // passthrough — NOT recalculated
                impact.reasons,               // passthrough — NOT recalculated
                impact.accessEffect           // passthrough — NOT recalculated
        );
    }

    // -------------------------------------------------------------------------
    // Private helpers — state inference (display-only, no Okta lookup)
    // -------------------------------------------------------------------------

    /**
     * Derives the most likely current status a user must be in for the given
     * action to be applicable. Display-only — no live Okta call is made.
     */
    private String deriveCurrentStatus(Action action) {
        return switch (action) {
            case ACTIVATE   -> "STAGED_OR_SUSPENDED";
            case SUSPEND    -> "ACTIVE";
            case UNSUSPEND  -> "SUSPENDED";
            case DEACTIVATE -> "ACTIVE";
        };
    }

    /**
     * Derives the user status that would result if the action were applied.
     * Display-only — no live Okta call is made.
     */
    private String deriveExpectedStatus(Action action) {
        return switch (action) {
            case ACTIVATE   -> "ACTIVE";
            case SUSPEND    -> "SUSPENDED";
            case UNSUSPEND  -> "ACTIVE";
            case DEACTIVATE -> "DEPROVISIONED";
        };
    }
}
