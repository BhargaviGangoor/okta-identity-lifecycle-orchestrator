package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class DriftController {
    @GetMapping("/drift")
    public String action() {
        return "TODO";
    }
}
