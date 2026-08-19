package com.company.identity.workstream3_simulation_security.approval;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ApprovalService {

    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";

    private final Map<String, String> approvalStates =
            new ConcurrentHashMap<>();

    public void registerSimulation(String simulationId) {

        validateSimulationId(simulationId);

        approvalStates.putIfAbsent(
                simulationId,
                PENDING
        );
    }

    public ApprovalResult approve(String simulationId) {

        validateSimulationId(simulationId);

        String currentState =
                approvalStates.get(simulationId);

        if (currentState == null) {
            return createResult(
                    simulationId,
                    "NOT_FOUND",
                    "Simulation does not exist"
            );
        }

        if (REJECTED.equals(currentState)) {
            return createResult(
                    simulationId,
                    REJECTED,
                    "Rejected simulation cannot be approved"
            );
        }

        approvalStates.put(
                simulationId,
                APPROVED
        );

        return createResult(
                simulationId,
                APPROVED,
                "Simulation approved for execution"
        );
    }

    public ApprovalResult reject(String simulationId) {

        validateSimulationId(simulationId);

        String currentState =
                approvalStates.get(simulationId);

        if (currentState == null) {
            return createResult(
                    simulationId,
                    "NOT_FOUND",
                    "Simulation does not exist"
            );
        }

        if (APPROVED.equals(currentState)) {
            return createResult(
                    simulationId,
                    APPROVED,
                    "Already approved simulation cannot be rejected"
            );
        }

        approvalStates.put(
                simulationId,
                REJECTED
        );

        return createResult(
                simulationId,
                REJECTED,
                "Simulation rejected"
        );
    }

    public String getStatus(String simulationId) {

        validateSimulationId(simulationId);

        return approvalStates.getOrDefault(
                simulationId,
                PENDING
        );
    }

    public boolean isApproved(String simulationId) {
        return APPROVED.equals(
                getStatus(simulationId)
        );
    }

    private void validateSimulationId(String simulationId) {

        if (simulationId == null ||
                simulationId.isBlank()) {

            throw new IllegalArgumentException(
                    "Simulation ID is required"
            );
        }
    }

    private ApprovalResult createResult(
            String simulationId,
            String status,
            String message) {

        ApprovalResult result =
                new ApprovalResult();

        result.simulationId = simulationId;
        result.status = status;
        result.message = message;

        return result;
    }
}