package com.company.identity.workstream3_simulation_security.execution;

import com.company.identity.workstream1_okta_lifecycle.okta.OktaSessionClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import org.springframework.stereotype.Component;

@Component
public class LifecycleActionExecutorImpl implements LifecycleActionExecutor {

    private final OktaUserClient oktaUserClient;
    private final OktaSessionClient oktaSessionClient;

    public LifecycleActionExecutorImpl(OktaUserClient oktaUserClient, OktaSessionClient oktaSessionClient) {
        this.oktaUserClient = oktaUserClient;
        this.oktaSessionClient = oktaSessionClient;
    }

    @Override
    public void execute(String userId, String action) throws Exception {
        if (action == null) return;
        switch (action.trim().toUpperCase()) {
            case "ACTIVATE", "UNSUSPEND" -> oktaUserClient.activateUser(userId);
            case "SUSPEND" -> oktaUserClient.suspendUser(userId);
            case "DEACTIVATE" -> {
                try {
                    oktaSessionClient.revokeSessions(userId);
                } catch (Exception ignored) {
                }
                oktaUserClient.deactivateUser(userId);
            }
        }
    }
}
