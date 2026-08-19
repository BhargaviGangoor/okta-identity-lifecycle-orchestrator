package com.company.identity.workstream3_simulation_security.risk;

import com.company.identity.common.dto.ImpactOutput;

import java.util.ArrayList;

public class RiskService {

    private static final String LOW = "LOW";
    private static final String MEDIUM = "MEDIUM";
    private static final String HIGH = "HIGH";

    /**
     * Evaluates the categorical risk received from Workstream 2.
     *
     * WS3 does not calculate a numeric risk score.
     * The risk level and reasons are passed through from WS2.
     */
    public RiskResult evaluateRisk(ImpactOutput impact) {

        if (impact == null) {
            throw new IllegalArgumentException(
                    "Impact output cannot be null"
            );
        }

        if (impact.riskLevel == null || impact.riskLevel.isBlank()) {
            throw new IllegalArgumentException(
                    "Risk level is required"
            );
        }

        String riskLevel = impact.riskLevel.trim().toUpperCase();

        if (!LOW.equals(riskLevel)
                && !MEDIUM.equals(riskLevel)
                && !HIGH.equals(riskLevel)) {

            throw new IllegalArgumentException(
                    "Risk level must be LOW, MEDIUM, or HIGH"
            );
        }

        RiskResult result = new RiskResult();

        result.riskLevel = riskLevel;

        result.reasons = impact.reasons == null
                ? new ArrayList<>()
                : new ArrayList<>(impact.reasons);

        result.approvalRequired = requiresApproval(riskLevel);

        return result;
    }

    /**
     * Determines whether administrator approval is required.
     *
     * HIGH-risk operations require approval.
     * LOW and MEDIUM operations do not require approval.
     */
    public boolean requiresApproval(RiskResult risk) {

        if (risk == null) {
            throw new IllegalArgumentException(
                    "Risk result cannot be null"
            );
        }

        return requiresApproval(risk.riskLevel);
    }

    private boolean requiresApproval(String riskLevel) {
        return HIGH.equals(riskLevel);
    }
}