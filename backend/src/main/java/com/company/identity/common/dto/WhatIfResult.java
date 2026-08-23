package com.company.identity.common.dto;

import com.company.identity.common.model.Action;
import java.util.List;

/**
 * What-If simulation result — the shape WS4 (React dashboard) consumes directly.
 *
 * Passthrough fields (riskLevel, reasons, accessEffect) are copied verbatim from
 * ImpactOutput; WS3 does NOT recompute or reinterpret them.
 *
 * currentStatus / expectedStatus are derived from the proposed action only
 * (no Okta lookup — simulation is read-only).
 */
public class WhatIfResult {

    /** Unique identifier for this simulation instance. */
    public String simulationId;

    /** Okta user ID from the original request. */
    public String userId;

    /** The proposed lifecycle action that was simulated. */
    public Action proposedAction;

    /**
     * Inferred current user status before the action.
     * Derived from the proposed action (display-only, no live Okta call).
     * E.g. ACTIVATE → "STAGED_OR_SUSPENDED", SUSPEND → "ACTIVE".
     */
    public String currentStatus;

    /**
     * Expected user status after the action would be applied.
     * E.g. ACTIVATE → "ACTIVE", DEACTIVATE → "DEPROVISIONED".
     */
    public String expectedStatus;

    // --- passthrough fields from ImpactOutput (unchanged) ---

    /** Groups that would be affected. Passthrough from ImpactOutput. */
    public List<String> affectedGroups;

    /** Applications that would be affected. Passthrough from ImpactOutput. */
    public List<String> affectedApplications;

    /**
     * Categorical risk level: LOW | MEDIUM | HIGH.
     * Passthrough from ImpactOutput — WS3 never recalculates this.
     */
    public String riskLevel;

    /** Reasons for the risk level. Passthrough from ImpactOutput. */
    public List<String> reasons;

    /**
     * Description of access changes. Passthrough from ImpactOutput.
     * May be a String or a small object.
     */
    public Object accessEffect;

    // --- constructors ---

    public WhatIfResult() {}

    public WhatIfResult(String userId,
                        Action proposedAction,
                        String currentStatus,
                        String expectedStatus,
                        List<String> affectedGroups,
                        List<String> affectedApplications,
                        String riskLevel,
                        List<String> reasons,
                        Object accessEffect) {
        this.userId = userId;
        this.proposedAction = proposedAction;
        this.currentStatus = currentStatus;
        this.expectedStatus = expectedStatus;
        this.affectedGroups = affectedGroups;
        this.affectedApplications = affectedApplications;
        this.riskLevel = riskLevel;
        this.reasons = reasons;
        this.accessEffect = accessEffect;
    }
}
