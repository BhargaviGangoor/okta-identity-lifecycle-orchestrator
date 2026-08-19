package com.company.identity.workstream3_simulation_security.simulation;

import com.company.identity.common.dto.ImpactOutput;
import com.company.identity.common.model.Action;

import java.util.List;
import java.util.Map;

/**
 * Static mock fixtures for ImpactOutput — used for standalone development and testing
 * until Workstream 2 provides a real ImpactService implementation.
 *
 * Covers all four actions × all three risk levels.
 * Field names match the frozen contract exactly.
 * There is NO riskScore field anywhere in these fixtures.
 */
public final class ImpactOutputFixtures {

    private ImpactOutputFixtures() {}

    // -------------------------------------------------------------------------
    // ACTIVATE fixtures
    // -------------------------------------------------------------------------

    public static ImpactOutput activateLow() {
        return new ImpactOutput(
                "user-activate-low",
                Action.ACTIVATE,
                List.of("Engineering"),
                List.of("GitHub", "Jira"),
                "LOW",
                List.of("User was in STAGED state pending activation",
                        "No sensitive application access requested"),
                "User gains read access to GitHub and Jira"
        );
    }

    public static ImpactOutput activateMedium() {
        return new ImpactOutput(
                "user-activate-med",
                Action.ACTIVATE,
                List.of("Engineering", "DevOps"),
                List.of("GitHub", "AWS", "Jira"),
                "MEDIUM",
                List.of("User activation grants access to cloud infrastructure tooling",
                        "AWS console access requires additional review"),
                Map.of(
                        "gains", List.of("GitHub:read", "Jira:read-write", "AWS:developer"),
                        "loses", List.of()
                )
        );
    }

    public static ImpactOutput activateHigh() {
        return new ImpactOutput(
                "user-activate-high",
                Action.ACTIVATE,
                List.of("Engineering", "DevOps", "Security"),
                List.of("GitHub", "AWS", "Jira", "PagerDuty", "VPN"),
                "HIGH",
                List.of("User activation grants privileged access to production systems",
                        "Security group membership grants VPN and PagerDuty on-call access"),
                Map.of(
                        "gains", List.of("GitHub:admin", "AWS:power-user", "VPN:full", "PagerDuty:on-call"),
                        "loses", List.of()
                )
        );
    }

    // -------------------------------------------------------------------------
    // SUSPEND fixtures
    // -------------------------------------------------------------------------

    public static ImpactOutput suspendLow() {
        return new ImpactOutput(
                "user-suspend-low",
                Action.SUSPEND,
                List.of("Marketing"),
                List.of("Confluence"),
                "LOW",
                List.of("User has minimal application access",
                        "Suspension affects only documentation read access"),
                "User loses read access to Confluence"
        );
    }

    public static ImpactOutput suspendMedium() {
        return new ImpactOutput(
                "user-suspend-med",
                Action.SUSPEND,
                List.of("Sales", "Marketing"),
                List.of("Salesforce", "Slack", "Confluence"),
                "MEDIUM",
                List.of("User has active Salesforce records assigned",
                        "Open opportunities may become unmanaged"),
                Map.of(
                        "gains", List.of(),
                        "loses", List.of("Salesforce:read-write", "Slack:active", "Confluence:read")
                )
        );
    }

    public static ImpactOutput suspendHigh() {
        return new ImpactOutput(
                "user-suspend-high",
                Action.SUSPEND,
                List.of("Engineering", "DevOps", "Security"),
                List.of("GitHub", "AWS", "PagerDuty", "VPN"),
                "HIGH",
                List.of("User owns production deployment pipelines in GitHub",
                        "AWS admin role suspension may break active infra processes",
                        "On-call rotation must be reassigned before suspension"),
                Map.of(
                        "gains", List.of(),
                        "loses", List.of("GitHub:admin", "AWS:admin", "PagerDuty:on-call", "VPN:full")
                )
        );
    }

    // -------------------------------------------------------------------------
    // UNSUSPEND fixture
    // -------------------------------------------------------------------------

    public static ImpactOutput unsuspendMedium() {
        return new ImpactOutput(
                "user-unsuspend-med",
                Action.UNSUSPEND,
                List.of("Engineering"),
                List.of("GitHub", "Jira", "Confluence"),
                "MEDIUM",
                List.of("User is being reinstated after a temporary suspension",
                        "Access restoration should be reviewed against current policy"),
                "User regains previous access to GitHub, Jira, and Confluence"
        );
    }

    // -------------------------------------------------------------------------
    // DEACTIVATE fixtures
    // -------------------------------------------------------------------------

    public static ImpactOutput deactivateMedium() {
        return new ImpactOutput(
                "user-deactivate-med",
                Action.DEACTIVATE,
                List.of("Engineering", "QA"),
                List.of("GitHub", "Jira", "TestRail"),
                "MEDIUM",
                List.of("Deactivation permanently removes access to all assigned applications",
                        "User-owned GitHub repositories must be transferred before deactivation"),
                Map.of(
                        "gains", List.of(),
                        "loses", List.of("GitHub:read-write", "Jira:read-write", "TestRail:editor")
                )
        );
    }

    public static ImpactOutput deactivateHigh() {
        return new ImpactOutput(
                "user-deactivate-high",
                Action.DEACTIVATE,
                List.of("Engineering", "DevOps", "Finance", "Security"),
                List.of("GitHub", "AWS", "Jira", "QuickBooks", "VPN", "PagerDuty"),
                "HIGH",
                List.of("User holds admin roles in 3+ critical systems",
                        "AWS IAM role ownership must be reassigned",
                        "Finance system access closure requires audit trail",
                        "Active sessions will be revoked immediately"),
                Map.of(
                        "gains", List.of(),
                        "loses", List.of("GitHub:admin", "AWS:admin", "QuickBooks:approver",
                                         "VPN:full", "PagerDuty:on-call")
                )
        );
    }

    // -------------------------------------------------------------------------
    // Convenience: get a representative fixture by action (used by controller mock)
    // -------------------------------------------------------------------------

    /**
     * Returns a medium-risk fixture for the given action.
     * Suitable for use as a default mock when the real ImpactService is not yet available.
     */
    public static ImpactOutput defaultFor(String userId, Action action) {
        ImpactOutput fixture = switch (action) {
            case ACTIVATE   -> activateMedium();
            case SUSPEND    -> suspendMedium();
            case UNSUSPEND  -> unsuspendMedium();
            case DEACTIVATE -> deactivateMedium();
        };
        // Stamp the real userId from the request so the result is traceable
        fixture.userId = userId;
        return fixture;
    }
}
