package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class WhatIfController {
    @PostMapping("/what-if")
    public String action(String action()) {
        return "TODO";
    }
}
