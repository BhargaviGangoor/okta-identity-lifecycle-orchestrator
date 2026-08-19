package com.company.identity.workstream2;

import com.company.identity.common.model.Group;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import com.company.identity.workstream2_identity_impact.graph.IdentityAccessCatalog;
import com.company.identity.workstream2_identity_impact.graph.IdentityGraphService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IdentityGraphServiceTest {
    @Test
    void buildsUserGroupApplicationGraphAndIncludesGroupInheritedAccess() throws Exception {
        IdentityGraphService service = serviceFor(List.of(user("User A")), Map.of("User A", List.of(group("G"))),
                Map.of("G", java.util.Set.of("App A")), Map.of(), Map.of("App A", "MEDIUM"));

        IdentityGraphService.IdentityGraph graph = service.buildIdentityGraph();

        assertEquals(java.util.Set.of("User A"), graph.getUsers());
        assertEquals(java.util.Set.of("G"), graph.getGroups());
        assertEquals(java.util.Set.of("App A"), graph.getApplications());
        assertEquals(java.util.Set.of("G"), service.getUserGroups("User A"));
        assertEquals(java.util.Set.of("App A"), service.getGroupApplications("G"));
        assertEquals(java.util.Set.of("App A"), service.getUserApplications("User A"));
    }

    @Test
    void missingUserFailsClearlyWithoutMutation() throws Exception {
        OktaUserClient userClient = mock(OktaUserClient.class);
        OktaGroupClient groupClient = mock(OktaGroupClient.class);
        when(userClient.getUsers()).thenReturn(List.of(user("User A")));
        when(groupClient.getUserGroups("User A")).thenReturn(List.of());
        when(groupClient.getGroups()).thenReturn(List.of());
        IdentityGraphService service = new IdentityGraphService(userClient, groupClient, new IdentityAccessCatalog(Map.of(), Map.of(), Map.of()));

        assertThrows(java.util.NoSuchElementException.class, () -> service.getUserApplications("missing"));
        verify(userClient, never()).createUser(any());
        verify(userClient, never()).updateUser(anyString(), any());
        verify(userClient, never()).activateUser(anyString());
        verify(userClient, never()).deactivateUser(anyString());
        verify(groupClient, never()).addUserToGroup(anyString(), anyString());
        verify(groupClient, never()).removeUserFromGroup(anyString(), anyString());
    }

    @Test
    void combinesAndDeduplicatesDirectAndInheritedApplications() throws Exception {
        IdentityGraphService service = serviceFor(List.of(user("User A")), Map.of("User A", List.of(group("G"))),
                Map.of("G", java.util.Set.of("App Group", "Shared")), Map.of("User A", java.util.Set.of("App Direct", "Shared")),
                Map.of("App Group", "MEDIUM", "App Direct", "MEDIUM", "Shared", "HIGH"));

        assertEquals(java.util.Set.of("App Direct", "App Group", "Shared"), service.getUserApplications("User A"));
    }

    static IdentityGraphService serviceFor(List<User> users, Map<String, List<Group>> memberships,
                                           Map<String, java.util.Set<String>> grants, Map<String, java.util.Set<String>> direct,
                                           Map<String, String> criticalities) throws Exception {
        OktaUserClient userClient = mock(OktaUserClient.class);
        OktaGroupClient groupClient = mock(OktaGroupClient.class);
        when(userClient.getUsers()).thenReturn(users);
        when(groupClient.getGroups()).thenReturn(grants.keySet().stream().map(IdentityGraphServiceTest::group).toList());
        for (User user : users) when(groupClient.getUserGroups(user.userId)).thenReturn(memberships.getOrDefault(user.userId, List.of()));
        return new IdentityGraphService(userClient, groupClient, new IdentityAccessCatalog(direct, grants, criticalities));
    }

    static User user(String id) { User user = new User(); user.userId = id; return user; }
    static Group group(String id) { Group group = new Group(); group.groupId = id; return group; }
}
