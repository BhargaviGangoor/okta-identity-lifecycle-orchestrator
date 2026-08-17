package com.company.identity.common.model;

/**
 * Frozen contract — exactly four lifecycle action values.
 * Do NOT add synonyms (enable, disable, activate_user, etc.).
 * Shared across all workstreams.
 */
public enum Action {
    ACTIVATE,
    SUSPEND,
    UNSUSPEND,
    DEACTIVATE
}
