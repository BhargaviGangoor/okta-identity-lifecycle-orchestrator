package com.company.identity;

import com.company.identity.workstream1_okta_lifecycle.okta.OktaClient;
import com.company.identity.workstream2_identity_impact.graph.IdentityGraphService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IdentityGraphServiceTest {
    @Test
    void buildsUserGroupApplicationGraphAndIncludesGroupInheritedAccess() {
        OktaClient client = clientWith(List.of(Map.of("userId", "User A", "groups", List.of("G"))),
                List.of(Map.of("groupId", "G", "applications", List.of(Map.of("name", "App A", "criticality", "MEDIUM")))));
        IdentityGraphService service = new IdentityGraphService(client);

        IdentityGraphService.IdentityGraph graph = service.buildIdentityGraph();

        assertEquals(java.util.Set.of("User A"), graph.getUsers());
        assertEquals(java.util.Set.of("G"), graph.getGroups());
        assertEquals(java.util.Set.of("App A"), graph.getApplications());
        assertEquals(java.util.Set.of("G"), service.getUserGroups("User A"));
        assertEquals(java.util.Set.of("App A"), service.getGroupApplications("G"));
        assertEquals(java.util.Set.of("App A"), service.getUserApplications("User A"));
    }

    @Test
    void missingUserFailsClearlyWithoutNullPointerExceptionOrMutation() {
        OktaClient client = clientWith(List.of(Map.of("userId", "User A")), List.of());
        IdentityGraphService service = new IdentityGraphService(client);

        assertThrows(java.util.NoSuchElementException.class, () -> service.getUserApplications("missing"));
        verify(client, never()).createUser(any());
        verify(client, never()).updateUser(anyString(), any());
        verify(client, never()).activateUser(anyString());
        verify(client, never()).deactivateUser(anyString());
        verify(client, never()).addUserToGroup(anyString(), anyString());
        verify(client, never()).removeUserFromGroup(anyString(), anyString());
        verify(client, never()).revokeSessions(anyString());
    }

    private static OktaClient clientWith(List<?> users, List<?> groups) {
        OktaClient client = mock(OktaClient.class);
        when(client.getUsers()).thenReturn(users);
        when(client.getGroups()).thenReturn(groups);
        return client;
    }
}
