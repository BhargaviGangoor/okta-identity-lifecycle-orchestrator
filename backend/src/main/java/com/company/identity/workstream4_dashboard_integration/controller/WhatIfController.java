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
@RequestMapping("")
public class WhatIfController {

    private final WhatIfService whatIfService;
    private final com.company.identity.workstream3_simulation_security.approval.ApprovalService approvalService;

    public WhatIfController(
            WhatIfService whatIfService,
            com.company.identity.workstream3_simulation_security.approval.ApprovalService approvalService) {
        this.whatIfService = whatIfService;
        this.approvalService = approvalService;
    }

    /**
     * Simulate the effect of a proposed lifecycle action without executing it.
     *
     * @param request  Validated body — userId (non-blank) + action (ACTIVATE | SUSPEND | UNSUSPEND | DEACTIVATE)
     * @return         200 with WhatIfResult, or 400 if validation fails
     */
    @PostMapping({"/what-if", "/whatif"})
    public ResponseEntity<WhatIfResult> simulate(@Valid @RequestBody WhatIfRequest request) {
        ImpactOutput impact = ImpactOutputFixtures.defaultFor(request.userId, request.action);

        WhatIfResult result = whatIfService.simulate(request, impact);
        String simId = "sim_" + Math.abs((request.userId + "_" + request.action.name()).hashCode());
        result.simulationId = simId;
        approvalService.registerSimulation(simId);

        return ResponseEntity.ok(result);
    }
}