package com.company.identity.workstream1_okta_lifecycle.okta;

import com.company.identity.common.model.User;

public interface OktaClient {
    Object getUsers();
    User getUser(String userId);
    User createUser(User user);
    User updateUser(String userId, User user);
    void activateUser(String userId);
    void deactivateUser(String userId);
    Object getGroups();
    Object getUserGroups(String userId);
    Object getGroupMembers(String groupId);
    void addUserToGroup(String userId, String groupId);
    void removeUserFromGroup(String userId, String groupId);
    void revokeSessions(String userId);
}
