package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ApprovalController {
    @PostMapping("/approval/{simulationId}/approve")
    public String action(String action(@PathVariable String simulationId)) {
        return "TODO";
    }
}
