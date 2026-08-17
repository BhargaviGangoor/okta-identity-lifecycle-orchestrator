package com.company.identity.common.dto;

import com.company.identity.common.model.Action;
import java.util.List;

/**
 * Frozen WS2 → WS3 contract (Workstream 2 output / Workstream 3 input).
 *
 * Field names are FROZEN — do not rename, do not add fields, do not remove fields.
 *
 * riskLevel is a String passthrough ("LOW" | "MEDIUM" | "HIGH").
 * There is NO numeric riskScore anywhere in this object.
 *
 * accessEffect is typed Object because the contract says "string or small object".
 */
public class ImpactOutput {

    /** Okta user ID of the subject. */
    public String userId;

    /** The proposed lifecycle action. */
    public Action action;

    /** Groups that would be affected by the action. */
    public List<String> affectedGroups;

    /** Applications that would lose/gain access. */
    public List<String> affectedApplications;

    /**
     * Categorical risk level — exactly one of: LOW, MEDIUM, HIGH.
     * This is a passthrough from WS2; WS3 does NOT recalculate it.
     */
    public String riskLevel;

    /** Human-readable reasons for the assessed risk level. Passthrough from WS2. */
    public List<String> reasons;

    /**
     * Description of access changes that would occur.
     * May be a plain String or a small JSON object — WS3 passes it through unchanged.
     */
    public Object accessEffect;

    // --- constructors ---

    public ImpactOutput() {}

    public ImpactOutput(String userId,
                        Action action,
                        List<String> affectedGroups,
                        List<String> affectedApplications,
                        String riskLevel,
                        List<String> reasons,
                        Object accessEffect) {
        this.userId = userId;
        this.action = action;
        this.affectedGroups = affectedGroups;
        this.affectedApplications = affectedApplications;
        this.riskLevel = riskLevel;
        this.reasons = reasons;
        this.accessEffect = accessEffect;
    }
}
