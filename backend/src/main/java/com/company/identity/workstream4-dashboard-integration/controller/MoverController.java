package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class MoverController {
    @PutMapping("/lifecycle/mover/{id}")
    public String action(String action(@PathVariable String id)) {
        return "TODO";
    }
}
