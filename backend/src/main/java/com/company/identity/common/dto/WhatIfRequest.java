package com.company.identity.common.dto;

import com.company.identity.common.model.Action;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Incoming request for a What-If simulation.
 *
 * Validation rules (enforced by Spring Validation — violations return HTTP 400):
 *   - userId must be present and non-blank.
 *   - action must be one of the four frozen enum values: ACTIVATE, SUSPEND, UNSUSPEND, DEACTIVATE.
 *     Supplying any other string (e.g. "enable", "ENABLE", "activate_user") causes Jackson
 *     to throw HttpMessageNotReadableException which GlobalExceptionHandler maps to 400.
 */
public class WhatIfRequest {

    @NotBlank(message = "userId must not be blank")
    public String userId;

    @NotNull(message = "action must not be null — valid values: ACTIVATE, SUSPEND, UNSUSPEND, DEACTIVATE")
    public Action action;
}