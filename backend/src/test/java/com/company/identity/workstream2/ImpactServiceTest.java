package com.company.identity;

import com.company.identity.workstream1_okta_lifecycle.okta.OktaClient;
import com.company.identity.workstream2_identity_impact.graph.IdentityGraphService;
import com.company.identity.workstream2_identity_impact.impact.BlastRadiusService;
import com.company.identity.workstream2_identity_impact.impact.ImpactService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ImpactServiceTest {
    @Test
    void deactivateBlastRadiusContainsOnlyReachableGroupsAndApplications() {
        ImpactService service = serviceFor(
                List.of(Map.of("userId", "User A", "groups", List.of("G")), Map.of("userId", "User B", "groups", List.of("Other"))),
                List.of(Map.of("groupId", "G", "applications", List.of(Map.of("name", "App A", "criticality", "MEDIUM"))),
                        Map.of("groupId", "Other", "applications", List.of(Map.of("name", "Unrelated", "criticality", "HIGH")))));

        ImpactService.ImpactResult impact = service.calculateImpact("User A", "DEACTIVATE");

        assertEquals("User A", impact.getAffectedUser());
        assertEquals("DEACTIVATE", impact.getAction());
        assertEquals(java.util.Set.of("G"), impact.getAffectedGroups());
        assertEquals(java.util.Set.of("App A"), impact.getAffectedApplications());
        assertFalse(impact.getAffectedApplications().contains("Unrelated"));
        assertEquals("ACCESS_INTERRUPTION", impact.getAccessEffect());
    }

    @Test
    void highCriticalityImpactHasHigherScoreAndHighRiskLevel() {
        ImpactService normal = serviceFor(List.of(Map.of("userId", "User A", "groups", List.of("G"))),
                List.of(Map.of("groupId", "G", "applications", List.of(Map.of("name", "App", "criticality", "MEDIUM")))));
        ImpactService high = serviceFor(List.of(Map.of("userId", "User A", "groups", List.of("G"))),
                List.of(Map.of("groupId", "G", "applications", List.of(Map.of("name", "App", "criticality", "MEDIUM"), Map.of("name", "Critical", "criticality", "HIGH")))));

        ImpactService.ImpactResult normalImpact = normal.calculateImpact("User A", "DEACTIVATE");
        ImpactService.ImpactResult highImpact = high.calculateImpact("User A", "DEACTIVATE");

        assertTrue(highImpact.getRiskScore() > normalImpact.getRiskScore());
        assertEquals("HIGH", highImpact.getRiskLevel());
        assertEquals(java.util.Set.of("Critical"), highImpact.getCriticalApplications());
        assertEquals("REQUIRES_APPROVAL", highImpact.getApprovalRecommendation());
    }

    @Test
    void unsupportedActionFailsWithoutProducingImpactOrMutatingOkta() {
        OktaClient client = clientWith(List.of(Map.of("userId", "User A")), List.of());
        ImpactService service = new ImpactService(new BlastRadiusService(new IdentityGraphService(client)));

        assertThrows(IllegalArgumentException.class, () -> service.calculateImpact("User A", "INVALID_ACTION"));
        verifyNoInteractions(client);
    }

    private static ImpactService serviceFor(List<?> users, List<?> groups) {
        return new ImpactService(new BlastRadiusService(new IdentityGraphService(clientWith(users, groups))));
    }
    private static OktaClient clientWith(List<?> users, List<?> groups) {
        OktaClient client = mock(OktaClient.class);
        when(client.getUsers()).thenReturn(users);
        when(client.getGroups()).thenReturn(groups);
        return client;
    }
}
