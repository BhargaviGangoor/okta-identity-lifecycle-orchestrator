package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class LeaverController {
    @PostMapping("/lifecycle/leaver/{id}")
    public String action(String action(@PathVariable String id)) {
        return "TODO";
    }
}
