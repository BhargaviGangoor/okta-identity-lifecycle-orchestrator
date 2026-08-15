package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class WhatIfController {

    @PostMapping("/what-if")
    public String simulateWhatIf() {
        return "What-if endpoint working";
    }
}