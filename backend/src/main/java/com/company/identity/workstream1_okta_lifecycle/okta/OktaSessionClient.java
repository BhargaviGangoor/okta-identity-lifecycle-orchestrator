package com.company.identity.workstream1_okta_lifecycle.okta;

import org.springframework.stereotype.Component;

@Component
public class OktaSessionClient {

    private final OktaClient oktaClient;

    public OktaSessionClient(OktaClient oktaClient) {
        this.oktaClient = oktaClient;
    }

    public void revokeSessions(String userId) throws Exception {

        validateUserId(userId);

        oktaClient.delete(
                "/api/v1/users/" + userId + "/sessions?oauthTokens=true"
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
