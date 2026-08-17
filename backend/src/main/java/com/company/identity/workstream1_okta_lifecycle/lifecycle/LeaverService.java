package com.company.identity.workstream1_okta_lifecycle.lifecycle;

import com.company.identity.common.dto.LeaverRequest;
import com.company.identity.common.model.Group;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaSessionClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaverService {

    private final OktaUserClient oktaUserClient;
    private final OktaSessionClient oktaSessionClient;
    private final OktaGroupClient oktaGroupClient;

    public LeaverService(
            OktaUserClient oktaUserClient,
            OktaSessionClient oktaSessionClient,
            OktaGroupClient oktaGroupClient) {

        this.oktaUserClient = oktaUserClient;
        this.oktaSessionClient = oktaSessionClient;
        this.oktaGroupClient = oktaGroupClient;
    }

    public void leaver(String userId, LeaverRequest leaverRequest) throws Exception {

        validateUserId(userId);

        // Deactivate the Okta user
        oktaUserClient.deactivateUser(userId);

        // Revoke the user's active Okta sessions
        oktaSessionClient.revokeSessions(userId);

        // Remove group memberships if required by policy
        removeGroupMemberships(userId);
    }

    private void removeGroupMemberships(String userId) throws Exception {

        try {
            List<Group> userGroups =
                    oktaGroupClient.getUserGroups(userId);

            if (userGroups != null && !userGroups.isEmpty()) {

                for (Group group : userGroups) {
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

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to remove group memberships for user: " + userId,
                    e
            );
        }
    }

    private void validateUserId(String userId) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "userId cannot be null or empty"
            );
        }
    }
}
