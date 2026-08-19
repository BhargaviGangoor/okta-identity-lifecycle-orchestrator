package com.company.identity.workstream3_simulation_security.execution;

public interface LifecycleActionExecutor {

    void execute(String userId, String action) throws Exception;
}