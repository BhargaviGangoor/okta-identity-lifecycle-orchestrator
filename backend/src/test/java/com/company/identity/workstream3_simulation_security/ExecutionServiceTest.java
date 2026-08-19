package com.company.identity.workstream3_simulation_security;

import com.company.identity.workstream3_simulation_security.approval.ApprovalService;
import com.company.identity.workstream3_simulation_security.execution.ExecutionResult;
import com.company.identity.workstream3_simulation_security.execution.ExecutionService;
import com.company.identity.workstream3_simulation_security.execution.LifecycleActionExecutor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ExecutionServiceTest {

    private ApprovalService approvalService;
    private LifecycleActionExecutor lifecycleExecutor;
    private ExecutionService executionService;

    @BeforeEach
    void setUp() {
        approvalService = new ApprovalService();
        lifecycleExecutor = mock(LifecycleActionExecutor.class);

        executionService =
                new ExecutionService(
                        approvalService,
                        lifecycleExecutor
                );
    }

    @Test
    void pendingSimulationMustBeBlocked() throws Exception {

        ExecutionResult result =
                executionService.executeApprovedAction(
                        "SIM-001",
                        "00u123",
                        "DEACTIVATE"
                );

        assertEquals("BLOCKED", result.status);

        verifyNoInteractions(lifecycleExecutor);
    }

    @Test
    void rejectedSimulationMustBeBlocked() throws Exception {

        approvalService.reject("SIM-002");

        ExecutionResult result =
                executionService.executeApprovedAction(
                        "SIM-002",
                        "00u123",
                        "DEACTIVATE"
                );

        assertEquals("BLOCKED", result.status);

        verifyNoInteractions(lifecycleExecutor);
    }

    @Test
    void approvedSimulationMustExecute() throws Exception {

        approvalService.registerSimulation("SIM-003");
        approvalService.approve("SIM-003");

        ExecutionResult result =
                executionService.executeApprovedAction(
                        "SIM-003",
                        "00u123",
                        "DEACTIVATE"
                );

        assertEquals("EXECUTED", result.status);

        verify(lifecycleExecutor)
                .execute("00u123", "DEACTIVATE");
    }

    @Test
    void invalidActionMustBeRejected() {

        assertThrows(
                IllegalArgumentException.class,
                () -> executionService.executeApprovedAction(
                        "SIM-004",
                        "00u123",
                        "INVALID_ACTION"
                )
        );

        verifyNoInteractions(lifecycleExecutor);
    }
}