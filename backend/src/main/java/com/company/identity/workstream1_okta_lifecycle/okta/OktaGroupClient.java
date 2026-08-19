package com.company.identity.workstream1_okta_lifecycle.okta;

import com.company.identity.common.model.Group;
import com.company.identity.common.model.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class OktaGroupClient {

    private final OktaClient oktaClient;
    private final ObjectMapper objectMapper;

    public OktaGroupClient(
            OktaClient oktaClient,
            ObjectMapper objectMapper) {

        this.oktaClient = oktaClient;
        this.objectMapper = objectMapper;
    }

    public List<Group> getGroups() throws Exception {

        String response =
                oktaClient.get("/api/v1/groups");

        JsonNode groupsNode =
                objectMapper.readTree(response);

        List<Group> groups = new ArrayList<>();

        for (JsonNode groupNode : groupsNode) {
            groups.add(mapGroup(groupNode));
        }

        return groups;
    }

    public List<Group> getUserGroups(String userId) throws Exception {

        validateUserId(userId);

        String response =
                oktaClient.get(
                        "/api/v1/users/" + userId + "/groups"
                );

        JsonNode groupsNode =
                objectMapper.readTree(response);

        List<Group> groups = new ArrayList<>();

        for (JsonNode groupNode : groupsNode) {
            groups.add(mapGroup(groupNode));
        }

        return groups;
    }

    public List<User> getGroupMembers(String groupId) throws Exception {

        validateGroupId(groupId);

        String response =
                oktaClient.get(
                        "/api/v1/groups/" + groupId + "/users"
                );

        JsonNode usersNode =
                objectMapper.readTree(response);

        List<User> users = new ArrayList<>();

        for (JsonNode userNode : usersNode) {
            users.add(mapGroupMemberToUser(userNode));
        }

        return users;
    }

    public void addUserToGroup(
            String userId,
            String groupId) throws Exception {

        validateUserId(userId);
        validateGroupId(groupId);

        oktaClient.put(
                "/api/v1/groups/" + groupId + "/users/" + userId,
                ""
        );
    }

    public void removeUserFromGroup(
            String userId,
            String groupId) throws Exception {

        validateUserId(userId);
        validateGroupId(groupId);

        oktaClient.delete(
                "/api/v1/groups/" + groupId + "/users/" + userId
        );
    }

    private Group mapGroup(JsonNode groupNode) {

        Group group = new Group();

        group.groupId =
                groupNode.path("id").asText("");

        group.name =
                groupNode.path("profile")
                        .path("name")
                        .asText("");

        return group;
    }

    private User mapGroupMemberToUser(JsonNode userNode) {

        User user = new User();

        user.userId =
                userNode.path("id").asText("");

        user.status =
                userNode.path("status").asText("");

        JsonNode profile =
                userNode.path("profile");

        String firstName =
                profile.path("firstName").asText("");

        String lastName =
                profile.path("lastName").asText("");

        if (!firstName.isBlank() && !lastName.isBlank()) {
            user.name = firstName + " " + lastName;
        } else if (!firstName.isBlank()) {
            user.name = firstName;
        } else {
            user.name = lastName;
        }

        user.email =
                profile.path("email").asText("");

        user.employeeId =
                profile.path("employeeId").asText("");

        user.department =
                profile.path("department").asText("");

        user.role =
                profile.path("role").asText("");

        return user;
    }

    private void validateUserId(String userId) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "userId cannot be null or empty"
            );
        }
    }

    private void validateGroupId(String groupId) {

        if (groupId == null || groupId.isBlank()) {
            throw new IllegalArgumentException(
                    "groupId cannot be null or empty"
            );
        }
    }
}
