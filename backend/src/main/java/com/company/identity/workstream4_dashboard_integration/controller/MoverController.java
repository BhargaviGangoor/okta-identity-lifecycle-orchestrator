package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class MoverController {

    @PutMapping("/lifecycle/mover/{id}")
    public String moveUser(@PathVariable String id) {
        return "Mover endpoint working for user: " + id;
    }
}