package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ExecutionController {
    @PostMapping("/execution/{simulationId}")
    public String execute(@PathVariable String simulationId) {
        return "TODO";
    }
}
