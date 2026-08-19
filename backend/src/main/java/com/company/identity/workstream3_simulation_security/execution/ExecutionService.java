package com.company.identity.workstream3_simulation_security.execution;

import com.company.identity.workstream3_simulation_security.approval.ApprovalService;
import org.springframework.stereotype.Service;

@Service
public class ExecutionService {

    private static final String ACTIVATE = "ACTIVATE";
    private static final String SUSPEND = "SUSPEND";
    private static final String UNSUSPEND = "UNSUSPEND";
    private static final String DEACTIVATE = "DEACTIVATE";

    private final ApprovalService approvalService;
    private final LifecycleActionExecutor lifecycleActionExecutor;

    public ExecutionService(
            ApprovalService approvalService,
            LifecycleActionExecutor lifecycleActionExecutor) {

        if (approvalService == null) {
            throw new IllegalArgumentException(
                    "ApprovalService cannot be null"
            );
        }

        if (lifecycleActionExecutor == null) {
            throw new IllegalArgumentException(
                    "LifecycleActionExecutor cannot be null"
            );
        }

        this.approvalService = approvalService;
        this.lifecycleActionExecutor = lifecycleActionExecutor;
    }

    public ExecutionResult executeApprovedAction(
            String simulationId,
            String userId,
            String action) throws Exception {

        validateInput(simulationId, userId, action);

        if (!approvalService.isApproved(simulationId)) {
            return createResult(
                    simulationId,
                    "BLOCKED",
                    action,
                    userId,
                    "Execution blocked: simulation has not been approved"
            );
        }

        lifecycleActionExecutor.execute(userId, action);

        return createResult(
                simulationId,
                "EXECUTED",
                action,
                userId,
                "Approved action executed successfully"
        );
    }

    private void validateInput(
            String simulationId,
            String userId,
            String action) {

        if (simulationId == null || simulationId.isBlank()) {
            throw new IllegalArgumentException(
                    "Simulation ID is required"
            );
        }

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException(
                    "Action is required"
            );

        }

        String normalizedAction = action.trim().toUpperCase();

        if (!ACTIVATE.equals(normalizedAction)
                && !SUSPEND.equals(normalizedAction)
                && !UNSUSPEND.equals(normalizedAction)
                && !DEACTIVATE.equals(normalizedAction)) {

            throw new IllegalArgumentException(
                    "Action must be ACTIVATE, SUSPEND, UNSUSPEND, or DEACTIVATE"
            );
        }
    }

    private ExecutionResult createResult(
            String simulationId,
            String status,
            String action,
            String userId,
            String message) {

        ExecutionResult result = new ExecutionResult();

        result.simulationId = simulationId;
        result.status = status;
        result.action = action;
        result.userId = userId;
        result.message = message;

        return result;
    }
}