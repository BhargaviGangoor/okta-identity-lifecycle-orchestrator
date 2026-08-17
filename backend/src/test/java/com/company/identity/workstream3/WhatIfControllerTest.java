package com.company.identity.workstream3;

import com.company.identity.common.model.Action;
import com.company.identity.workstream3_simulation_security.simulation.WhatIfService;
import com.company.identity.workstream4_dashboard_integration.controller.WhatIfController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MockMvc controller tests for POST /api/whatif.
 *
 * Uses @WebMvcTest (slice) with Spring Security disabled via excludeAutoConfiguration
 * so no spring-security-test dependency is required.
 *
 * WhatIfService is loaded as a real bean (not mocked) — this also validates the
 * structural constraint that WhatIfService has zero dependency on Okta/Approval/Execution.
 */
@WebMvcTest(
        controllers = WhatIfController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class
)
@Import(WhatIfService.class)
class WhatIfControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // =========================================================================
    // Happy path — one test per valid action
    // =========================================================================

    @Test
    @DisplayName("POST /api/whatif ACTIVATE → 200 with correct state transition and passthrough fields")
    void whatif_activate_returns200() throws Exception {
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user-01", "ACTIVATE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-01"))
                .andExpect(jsonPath("$.proposedAction").value("ACTIVATE"))
                .andExpect(jsonPath("$.currentStatus").value("STAGED_OR_SUSPENDED"))
                .andExpect(jsonPath("$.expectedStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.riskLevel").isNotEmpty())
                .andExpect(jsonPath("$.affectedGroups").isArray())
                .andExpect(jsonPath("$.affectedApplications").isArray())
                .andExpect(jsonPath("$.reasons").isArray())
                // Confirm no riskScore field appears in the response
                .andExpect(jsonPath("$.riskScore").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/whatif SUSPEND → 200 with correct state transition")
    void whatif_suspend_returns200() throws Exception {
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user-02", "SUSPEND")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proposedAction").value("SUSPEND"))
                .andExpect(jsonPath("$.currentStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.expectedStatus").value("SUSPENDED"))
                .andExpect(jsonPath("$.riskScore").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/whatif UNSUSPEND → 200 with correct state transition")
    void whatif_unsuspend_returns200() throws Exception {
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user-03", "UNSUSPEND")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proposedAction").value("UNSUSPEND"))
                .andExpect(jsonPath("$.currentStatus").value("SUSPENDED"))
                .andExpect(jsonPath("$.expectedStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.riskScore").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/whatif DEACTIVATE → 200 with correct state transition")
    void whatif_deactivate_returns200() throws Exception {
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user-04", "DEACTIVATE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proposedAction").value("DEACTIVATE"))
                .andExpect(jsonPath("$.currentStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.expectedStatus").value("DEPROVISIONED"))
                .andExpect(jsonPath("$.riskScore").doesNotExist());
    }

    // =========================================================================
    // Validation failure — invalid action string → 400
    // =========================================================================

    @Test
    @DisplayName("POST /api/whatif with action=ENABLE → 400 (not a valid enum value)")
    void whatif_invalidAction_enable_returns400() throws Exception {
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user-05", "ENABLE")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/whatif with action=disable → 400 (synonym, not valid)")
    void whatif_invalidAction_disable_returns400() throws Exception {
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user-06", "disable")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/whatif with action=activate_user → 400 (old name, not valid)")
    void whatif_invalidAction_oldName_returns400() throws Exception {
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("user-07", "activate_user")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/whatif with numeric action → 400")
    void whatif_invalidAction_numeric_returns400() throws Exception {
        String json = "{\"userId\":\"user-08\",\"action\":42}";
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================================
    // Validation failure — missing / blank userId → 400
    // =========================================================================

    @Test
    @DisplayName("POST /api/whatif with missing userId → 400")
    void whatif_missingUserId_returns400() throws Exception {
        String json = "{\"action\":\"ACTIVATE\"}";
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.userId").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/whatif with blank userId → 400")
    void whatif_blankUserId_returns400() throws Exception {
        String json = "{\"userId\":\"   \",\"action\":\"ACTIVATE\"}";
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.userId").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/whatif with empty userId string → 400")
    void whatif_emptyUserId_returns400() throws Exception {
        String json = "{\"userId\":\"\",\"action\":\"ACTIVATE\"}";
        mockMvc.perform(post("/api/whatif")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.userId").isNotEmpty());
    }

    // =========================================================================
    // Structural: simulation endpoint must never return a riskScore
    // =========================================================================

    @Test
    @DisplayName("Structural: response never contains a riskScore field for any action")
    void whatif_noRiskScore_inAnyResponse() throws Exception {
        for (Action action : Action.values()) {
            mockMvc.perform(post("/api/whatif")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("structural-user", action.name())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.riskScore").doesNotExist());
        }
    }

    // =========================================================================
    // Helper
    // =========================================================================

    private String body(String userId, String action) throws Exception {
        return objectMapper.writeValueAsString(Map.of("userId", userId, "action", action));
    }
}
