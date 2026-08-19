package com.company.identity.workstream1_okta_lifecycle.lifecycle;

import com.company.identity.common.dto.JoinerRequest;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import com.company.identity.workstream1_okta_lifecycle.policy.PolicyService;
import org.springframework.stereotype.Service;

@Service
public class JoinerService {

    private final OktaUserClient oktaUserClient;
    private final OktaGroupClient oktaGroupClient;
    private final PolicyService policyService;

    public JoinerService(
            OktaUserClient oktaUserClient,
            OktaGroupClient oktaGroupClient,
            PolicyService policyService) {

        this.oktaUserClient = oktaUserClient;
        this.oktaGroupClient = oktaGroupClient;
        this.policyService = policyService;
    }

    public User joiner(JoinerRequest joinerRequest) throws Exception {

        validateJoinerRequest(joinerRequest);

        // Build User from JoinerRequest
        User user = buildUserFromRequest(joinerRequest);

        // Create user in Okta
        User createdUser =
                oktaUserClient.createUser(user);

        // Activate the created Okta user
        oktaUserClient.activateUser(createdUser.userId);

        // Assign required group membership based on policy
        assignGroupMembership(
                createdUser.userId,
                joinerRequest.department,
                joinerRequest.role
        );

        return createdUser;
    }

    private User buildUserFromRequest(JoinerRequest request) {

        User user = new User();

        user.employeeId = request.employeeId;
        user.name = request.firstName + " " + request.lastName;
        user.email = request.email;
        user.department = request.department;
        user.role = request.role;

        return user;
    }

    private void assignGroupMembership(
            String userId,
            String department,
            String role) throws Exception {

        Object groupsObject =
                policyService.calculateRequiredGroups(
                        department,
                        role
                );

        if (groupsObject == null) {
            return;
        }

        if (groupsObject instanceof String[]) {

            String[] groups = (String[]) groupsObject;

            for (String groupId : groups) {
                try {
                    oktaGroupClient.addUserToGroup(
                            userId,
                            groupId
                    );
                } catch (Exception e) {
                    throw new RuntimeException(
                            "Failed to add user to group: " + groupId,
                            e
                    );
                }
            }
        }
    }

    private void validateJoinerRequest(JoinerRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "JoinerRequest cannot be null"
            );
        }

        if (request.employeeId == null || request.employeeId.isBlank()) {
            throw new IllegalArgumentException(
                    "employeeId is required"
            );
        }

        if (request.firstName == null || request.firstName.isBlank()) {
            throw new IllegalArgumentException(
                    "firstName is required"
            );
        }

        if (request.lastName == null || request.lastName.isBlank()) {
            throw new IllegalArgumentException(
                    "lastName is required"
            );
        }

        if (request.email == null || request.email.isBlank()) {
            throw new IllegalArgumentException(
                    "email is required"
            );
        }

        if (request.department == null || request.department.isBlank()) {
            throw new IllegalArgumentException(
                    "department is required"
            );
        }

        if (request.role == null || request.role.isBlank()) {
            throw new IllegalArgumentException(
                    "role is required"
            );
        }
    }
}
