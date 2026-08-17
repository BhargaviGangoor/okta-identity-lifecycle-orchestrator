package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ImpactController {
    @GetMapping("/impact/{id}")
    public String getImpact(@PathVariable String id) {
        return "TODO";
    }
}
