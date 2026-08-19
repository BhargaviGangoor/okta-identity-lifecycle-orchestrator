package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.common.dto.JoinerRequest;
import com.company.identity.workstream1_okta_lifecycle.lifecycle.JoinerService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("")
public class BulkController {

    private final JoinerService joinerService;

    public BulkController(JoinerService joinerService) {
        this.joinerService = joinerService;
    }

    @PostMapping("/bulk")
    public Map<String, Object> action(@RequestBody(required = false) List<JoinerRequest> requests) {
        List<Object> results = new ArrayList<>();
        int successCount = 0;
        if (requests != null) {
            for (JoinerRequest req : requests) {
                try {
                    results.add(joinerService.joiner(req));
                    successCount++;
                } catch (Exception e) {
                    results.add(Map.of("error", e.getMessage()));
                }
            }
        }
        return Map.of(
            "total", requests != null ? requests.size() : 0,
            "processed", successCount,
            "results", results
        );
    }
}
