package com.company.identity.workstream1_okta_lifecycle.okta;

import com.company.identity.common.model.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class OktaUserClient {

    private final OktaClient oktaClient;
    private final ObjectMapper objectMapper;

    public OktaUserClient(
            OktaClient oktaClient,
            ObjectMapper objectMapper) {

        this.oktaClient = oktaClient;
        this.objectMapper = objectMapper;
    }

    public List<User> getUsers() throws Exception {

        String response =
                oktaClient.get("/api/v1/users");

        JsonNode usersNode =
                objectMapper.readTree(response);

        List<User> users = new ArrayList<>();

        for (JsonNode userNode : usersNode) {
            users.add(mapUser(userNode));
        }

        return users;
    }

    public User getUser(String userId) throws Exception {

        validateUserId(userId);

        String response =
                oktaClient.get(
                        "/api/v1/users/" + userId
                );

        return mapUser(
                objectMapper.readTree(response)
        );
    }

    public User createUser(User user) throws Exception {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null"
            );
        }

        String requestBody =
                buildUserRequest(user);

        String response =
                oktaClient.post(
                        "/api/v1/users?activate=false",
                        requestBody
                );

        return mapUser(
                objectMapper.readTree(response)
        );
    }

    public User updateUser(
            String userId,
            User user) throws Exception {

        validateUserId(userId);

        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null"
            );
        }

        String requestBody =
                buildUserRequest(user);

        String response =
                oktaClient.put(
                        "/api/v1/users/" + userId,
                        requestBody
                );

        return mapUser(
                objectMapper.readTree(response)
        );
    }

    public void activateUser(String userId) throws Exception {

        validateUserId(userId);

        oktaClient.post(
                "/api/v1/users/"
                        + userId
                        + "/lifecycle/activate?sendEmail=false"
        );
    }

    public void deactivateUser(String userId) throws Exception {

        validateUserId(userId);

        oktaClient.post(
                "/api/v1/users/"
                        + userId
                        + "/lifecycle/deactivate?sendEmail=false"
        );
    }

    public void suspendUser(String userId) throws Exception {
        validateUserId(userId);
        oktaClient.post(
                "/api/v1/users/"
                        + userId
                        + "/lifecycle/suspend"
        );
    }

    public void unsuspendUser(String userId) throws Exception {
        validateUserId(userId);
        oktaClient.post(
                "/api/v1/users/"
                        + userId
                        + "/lifecycle/unsuspend"
        );
    }

    private User mapUser(JsonNode userNode) {

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
                profile.hasNonNull("employeeNumber") ? profile.path("employeeNumber").asText("") : profile.path("employeeId").asText("");

        user.department =
                profile.path("department").asText("");

        user.role =
                profile.hasNonNull("title") ? profile.path("title").asText("") : profile.path("role").asText("");

        return user;
    }

    private String buildUserRequest(User user)
            throws Exception {

        var profile =
                objectMapper.createObjectNode();

        String firstName = "";
        String lastName = "";

        if (user.name != null && !user.name.isBlank()) {

            String[] nameParts =
                    user.name.trim().split("\\s+");

            firstName = nameParts[0];

            if (nameParts.length > 1) {
                lastName =
                        nameParts[nameParts.length - 1];
            }
        }

        profile.put("firstName", firstName);
        profile.put("lastName", lastName);
        profile.put("email", user.email);
        profile.put("login", user.email);

        if (user.employeeId != null && !user.employeeId.isBlank()) {
            profile.put("employeeNumber", user.employeeId);
        }

        if (user.department != null && !user.department.isBlank()) {
            profile.put("department", user.department);
        }

        if (user.role != null && !user.role.isBlank()) {
            profile.put("title", user.role);
        }

        var requestBody =
                objectMapper.createObjectNode();

        requestBody.set("profile", profile);

        return objectMapper.writeValueAsString(
                requestBody
        );
    }

    private void validateUserId(String userId) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "userId cannot be null or empty"
            );
        }
    }
}
