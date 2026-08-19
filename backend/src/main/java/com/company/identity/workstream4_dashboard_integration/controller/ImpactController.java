package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class ImpactController {
    @GetMapping("/impact/{id}")
    public String action(@PathVariable String id) {
        return "TODO";
    }
}
