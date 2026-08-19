package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class DriftController {
    @GetMapping("/drift")
    public String action() {
        return "TODO";
    }

    @PostMapping("/drift/{id}/remediate")
    public String remediate(@PathVariable String id) {
        return "TODO";
    }
}
