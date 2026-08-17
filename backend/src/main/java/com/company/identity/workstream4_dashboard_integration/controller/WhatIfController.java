package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.common.dto.ImpactOutput;
import com.company.identity.common.dto.WhatIfRequest;
import com.company.identity.common.dto.WhatIfResult;
import com.company.identity.workstream3_simulation_security.simulation.ImpactOutputFixtures;
import com.company.identity.workstream3_simulation_security.simulation.WhatIfService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * What-If Simulation Controller.
 *
 * Endpoint: POST /api/whatif
 *
 * Validation errors automatically return HTTP 400 via GlobalExceptionHandler:
 *   - userId blank or missing        → 400 (MethodArgumentNotValidException)
 *   - action not a valid enum value  → 400 (HttpMessageNotReadableException)
 *
 * This controller is SIMULATION-ONLY — it never calls ApprovalService,
 * ExecutionService, or any Okta mutation method.
 *
 * The ImpactOutput is mocked via ImpactOutputFixtures until Workstream 2
 * provides a real ImpactService; swap the mock line below when WS2 is ready.
 */
@RestController
@RequestMapping("/api")
public class WhatIfController {

    private final WhatIfService whatIfService;

    public WhatIfController(WhatIfService whatIfService) {
        this.whatIfService = whatIfService;
    }

    /**
     * Simulate the effect of a proposed lifecycle action without executing it.
     *
     * @param request  Validated body — userId (non-blank) + action (ACTIVATE | SUSPEND | UNSUSPEND | DEACTIVATE)
     * @return         200 with WhatIfResult, or 400 if validation fails
     */
    @PostMapping("/whatif")
    public ResponseEntity<WhatIfResult> simulate(@Valid @RequestBody WhatIfRequest request) {
        // --- Mock ImpactOutput until WS2 ImpactService is available ---
        // TODO: replace with real ImpactService call when WS2 is ready:
        //   ImpactOutput impact = impactService.calculateImpact(request.userId, request.action.name());
        ImpactOutput impact = ImpactOutputFixtures.defaultFor(request.userId, request.action);

        WhatIfResult result = whatIfService.simulate(request, impact);
        return ResponseEntity.ok(result);
    }
}