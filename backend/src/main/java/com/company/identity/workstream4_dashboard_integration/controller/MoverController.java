package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.common.dto.MoverRequest;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.lifecycle.MoverService;
import com.company.identity.workstream4_dashboard_integration.audit.AuditService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class MoverController {

    private final MoverService moverService;
    private final AuditService auditService;

    public MoverController(MoverService moverService, AuditService auditService) {
        this.moverService = moverService;
        this.auditService = auditService;
    }

    @PutMapping("/lifecycle/mover/{id}")
    public User moveUser(@PathVariable String id, @RequestBody MoverRequest request) throws Exception {
        User updated = moverService.mover(id, request);
        auditService.log(
            "admin@northwind.io",
            "MOVER_TRANSFERRED",
            (updated.name != null ? updated.name : id),
            "SUCCESS",
            "MEDIUM",
            "Transferred to " + request.department + " (" + request.role + ")"
        );
        return updated;
    }
}