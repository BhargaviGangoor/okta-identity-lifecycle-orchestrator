package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class LeaverController {

    @PostMapping("/lifecycle/leaver/{id}")
    public String deactivateUser(@PathVariable String id) {
        return "Leaver endpoint working for user: " + id;
    }
}