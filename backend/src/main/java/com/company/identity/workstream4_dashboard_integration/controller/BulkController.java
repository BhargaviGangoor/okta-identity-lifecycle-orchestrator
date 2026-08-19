package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class BulkController {
    @PostMapping("/bulk")
    public String action() {
        return "TODO";
    }
}
