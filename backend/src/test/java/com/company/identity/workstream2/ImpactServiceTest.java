package com.company.identity.workstream2;

import com.company.identity.common.model.Group;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import com.company.identity.workstream2_identity_impact.graph.IdentityAccessCatalog;
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
    void deactivateBlastRadiusContainsOnlyReachableGroupsAndApplications() throws Exception {
        ImpactService service = serviceFor(List.of(IdentityGraphServiceTest.user("User A"), IdentityGraphServiceTest.user("User B")),
                Map.of("User A", List.of(IdentityGraphServiceTest.group("G")), "User B", List.of(IdentityGraphServiceTest.group("Other"))),
                Map.of("G", java.util.Set.of("App A"), "Other", java.util.Set.of("Unrelated")), Map.of(), Map.of("App A", "MEDIUM", "Unrelated", "HIGH"));
        ImpactService.ImpactResult impact = service.calculateImpact("User A", "DEACTIVATE");
        assertEquals("User A", impact.getAffectedUser()); assertEquals("DEACTIVATE", impact.getAction()); assertEquals(java.util.Set.of("G"), impact.getAffectedGroups()); assertEquals(java.util.Set.of("App A"), impact.getAffectedApplications()); assertFalse(impact.getAffectedApplications().contains("Unrelated")); assertEquals("ACCESS_INTERRUPTION", impact.getAccessEffect());
    }

    @Test
    void highCriticalityImpactHasHigherScoreAndHighRiskLevel() throws Exception {
        ImpactService normal = serviceFor(List.of(IdentityGraphServiceTest.user("User A")), Map.of("User A", List.of(IdentityGraphServiceTest.group("G"))), Map.of("G", java.util.Set.of("App")), Map.of(), Map.of("App", "MEDIUM"));
        ImpactService high = serviceFor(List.of(IdentityGraphServiceTest.user("User A")), Map.of("User A", List.of(IdentityGraphServiceTest.group("G"))), Map.of("G", java.util.Set.of("App")), Map.of(), Map.of("App", "HIGH"));
        ImpactService.ImpactResult normalImpact = normal.calculateImpact("User A", "DEACTIVATE");
        ImpactService.ImpactResult highImpact = high.calculateImpact("User A", "DEACTIVATE");
        assertTrue(highImpact.getRiskScore() > normalImpact.getRiskScore()); assertEquals("HIGH", highImpact.getRiskLevel()); assertEquals(java.util.Set.of("App"), highImpact.getCriticalApplications()); assertEquals("REQUIRES_APPROVAL", highImpact.getApprovalRecommendation());
    }

    @Test
    void unsupportedActionFailsWithoutReadingOrMutatingOkta() {
        OktaUserClient userClient = mock(OktaUserClient.class); OktaGroupClient groupClient = mock(OktaGroupClient.class);
        ImpactService service = new ImpactService(new BlastRadiusService(new IdentityGraphService(userClient, groupClient, new IdentityAccessCatalog(Map.of(), Map.of(), Map.of()))));
        assertThrows(IllegalArgumentException.class, () -> service.calculateImpact("User A", "INVALID_ACTION"));
        verifyNoInteractions(userClient, groupClient);
    }

    @Test
    void noApplicationsProducesLowRisk() throws Exception {
        ImpactService service = serviceFor(List.of(IdentityGraphServiceTest.user("User A")), Map.of("User A", List.of()), Map.of(), Map.of(), Map.of());
        assertEquals("LOW", service.calculateImpact("User A", "deactivate").getRiskLevel());
    }

    private static ImpactService serviceFor(List<User> users, Map<String, List<Group>> memberships, Map<String, java.util.Set<String>> grants,
                                            Map<String, java.util.Set<String>> direct, Map<String, String> criticalities) throws Exception {
        return new ImpactService(new BlastRadiusService(IdentityGraphServiceTest.serviceFor(users, memberships, grants, direct, criticalities)));
    }
}
