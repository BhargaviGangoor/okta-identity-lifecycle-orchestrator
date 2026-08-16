package com.company.identity.workstream4_dashboard_integration.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class UserController {

    @GetMapping("/users")
    public String getUsers() {
        return "Users endpoint working";
    }
}