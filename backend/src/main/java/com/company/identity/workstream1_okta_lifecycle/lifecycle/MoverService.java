package com.company.identity.workstream1_okta_lifecycle.lifecycle;

import com.company.identity.common.dto.MoverRequest;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import com.company.identity.workstream1_okta_lifecycle.policy.PolicyService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MoverService {

    private final OktaUserClient oktaUserClient;
    private final OktaGroupClient oktaGroupClient;
    private final PolicyService policyService;

    public MoverService(
            OktaUserClient oktaUserClient,
            OktaGroupClient oktaGroupClient,
            PolicyService policyService) {

        this.oktaUserClient = oktaUserClient;
        this.oktaGroupClient = oktaGroupClient;
        this.policyService = policyService;
    }

    public User mover(String userId, MoverRequest moverRequest) throws Exception {

        validateUserId(userId);
        validateMoverRequest(moverRequest);

        // Get the current user
        User currentUser =
                oktaUserClient.getUser(userId);

        // Update the user's department and role
        currentUser.department = moverRequest.department;
        currentUser.role = moverRequest.role;

        User updatedUser =
                oktaUserClient.updateUser(userId, currentUser);

        // Handle group membership changes
        updateGroupMembership(
                userId,
                moverRequest.department,
                moverRequest.role
        );

        return updatedUser;
    }

    private void updateGroupMembership(
            String userId,
            String newDepartment,
            String newRole) throws Exception {

        // Get user's current groups
        List<com.company.identity.common.model.Group> currentGroups =
                oktaGroupClient.getUserGroups(userId);

        // Calculate required groups for new department/role
        Object newGroupsObject =
                policyService.calculateRequiredGroups(
                        newDepartment,
                        newRole
                );

        // Remove user from current groups that are no longer needed
        if (currentGroups != null && !currentGroups.isEmpty()) {

            for (com.company.identity.common.model.Group group : currentGroups) {

                boolean shouldKeep = false;

                if (newGroupsObject instanceof String[]) {

                    String[] newGroups = (String[]) newGroupsObject;

                    for (String newGroupId : newGroups) {
                        if (group.groupId.equals(newGroupId)) {
                            shouldKeep = true;
                            break;
                        }
                    }
                }

                if (!shouldKeep) {
                    try {
                        oktaGroupClient.removeUserFromGroup(
                                userId,
                                group.groupId
                        );
                    } catch (Exception e) {
                        throw new RuntimeException(
                                "Failed to remove user from group: " + group.groupId,
                                e
                        );
                    }
                }
            }
        }

        // Add user to new required groups
        if (newGroupsObject instanceof String[]) {

            String[] newGroups = (String[]) newGroupsObject;

            for (String newGroupId : newGroups) {

                boolean alreadyMember = false;

                if (currentGroups != null) {
                    for (com.company.identity.common.model.Group group : currentGroups) {
                        if (group.groupId.equals(newGroupId)) {
                            alreadyMember = true;
                            break;
                        }
                    }
                }

                if (!alreadyMember) {
                    try {
                        oktaGroupClient.addUserToGroup(
                                userId,
                                newGroupId
                        );
                    } catch (Exception e) {
                        throw new RuntimeException(
                                "Failed to add user to group: " + newGroupId,
                                e
                        );
                    }
                }
            }
        }
    }

    private void validateUserId(String userId) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "userId cannot be null or empty"
            );
        }
    }

    private void validateMoverRequest(MoverRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "MoverRequest cannot be null"
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
