package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.common.dto.JoinerRequest;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.lifecycle.JoinerService;
import com.company.identity.workstream4_dashboard_integration.audit.AuditService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class JoinerController {

    private final JoinerService joinerService;
    private final AuditService auditService;

    public JoinerController(JoinerService joinerService, AuditService auditService) {
        this.joinerService = joinerService;
        this.auditService = auditService;
    }

    @PostMapping("/lifecycle/joiner")
    public User action(@RequestBody JoinerRequest request) throws Exception {
        User user = joinerService.joiner(request);
        auditService.log(
            "admin@northwind.io",
            "JOINER_PROVISIONED",
            user.name + " (" + (user.email != null ? user.email : request.email) + ")",
            "SUCCESS",
            "LOW",
            "Provisioned into department " + request.department + " as " + request.role
        );
        return user;
    }
}
