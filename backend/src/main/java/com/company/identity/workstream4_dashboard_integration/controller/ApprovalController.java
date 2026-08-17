package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ApprovalController {
    @PostMapping("/approval/{simulationId}/approve")
    public String approve(@PathVariable String simulationId) {
        return "TODO";
    }

    @PostMapping("/approval/{simulationId}/reject")
    public String reject(@PathVariable String simulationId) {
        return "TODO";
    }
}
