package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("")
public class ExportController {

    private final OktaUserClient oktaUserClient;

    public ExportController(OktaUserClient oktaUserClient) {
        this.oktaUserClient = oktaUserClient;
    }

    @GetMapping(value = "/users/export", produces = "text/csv")
    public ResponseEntity<String> action() throws Exception {
        List<User> users = oktaUserClient.getUsers();
        StringBuilder csv = new StringBuilder("ID,Name,Email,Department,Role,Status\n");
        for (User u : users) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    u.userId != null ? u.userId : "",
                    u.name != null ? u.name : "",
                    u.email != null ? u.email : "",
                    u.department != null ? u.department : "",
                    u.role != null ? u.role : "",
                    u.status != null ? u.status : ""));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"okta-identities.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }
}
