package com.company.identity.workstream1;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.company.identity.common.dto.MoverRequest;
import com.company.identity.common.model.Group;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.lifecycle.MoverService;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import com.company.identity.workstream1_okta_lifecycle.policy.PolicyService;

class MoverServiceTest {

    private OktaUserClient oktaUserClient;
    private OktaGroupClient oktaGroupClient;
    private PolicyService policyService;
    private MoverService moverService;

    @BeforeEach
    void setUp() {
        // Create manual mocks without needing @ExtendWith(MockitoExtension.class)
        oktaUserClient = mock(OktaUserClient.class);
        oktaGroupClient = mock(OktaGroupClient.class);
        policyService = mock(PolicyService.class);
        
        moverService = new MoverService(
                oktaUserClient,
                oktaGroupClient,
                policyService
        );
    }

    @Test
    void testMoverSuccessfullyUpdatesUserAndGroupMembership() throws Exception {
        // Arrange
        String userId = "user123";
        MoverRequest request = new MoverRequest();
        request.department = "Sales";
        request.role = "Manager";

        User currentUser = new User();
        currentUser.userId = userId;
        currentUser.department = "Engineering";
        currentUser.role = "Developer";

        User updatedUser = new User();
        updatedUser.userId = userId;
        updatedUser.department = "Sales";
        updatedUser.role = "Manager";

        Group group1 = new Group();
        group1.groupId = "group-eng";
        group1.name = "Engineering Group";

        List<Group> currentGroups = Arrays.asList(group1);

        when(oktaUserClient.getUser(userId)).thenReturn(currentUser);
        when(oktaUserClient.updateUser(userId, currentUser)).thenReturn(updatedUser);
        when(oktaGroupClient.getUserGroups(userId)).thenReturn(currentGroups);
        when(policyService.calculateRequiredGroups("Sales", "Manager"))
                .thenReturn(new String[]{"group-sales"});

        // Act
        User result = moverService.mover(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals("Sales", result.department);
        verify(oktaUserClient, times(1)).getUser(userId);
        verify(oktaUserClient, times(1)).updateUser(userId, currentUser);
        verify(oktaGroupClient, times(1)).removeUserFromGroup(userId, "group-eng");
        verify(oktaGroupClient, times(1)).addUserToGroup(userId, "group-sales");
    }

    @Test
    void testMoverValidatesNullUserId() {
        MoverRequest request = new MoverRequest();
        request.department = "Sales";
        request.role = "Manager";

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            moverService.mover(null, request);
        }, "Should throw IllegalArgumentException for null userId");
    }

    @Test
    void testMoverValidatesBlankUserId() {
        MoverRequest request = new MoverRequest();
        request.department = "Sales";
        request.role = "Manager";

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            moverService.mover("", request);
        }, "Should throw IllegalArgumentException for blank userId");
    }

    @Test
    void testMoverValidatesNullRequest() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            moverService.mover("user123", null);
        }, "Should throw IllegalArgumentException for null request");
    }

    @Test
    void testMoverValidatesRequiredDepartment() {
        MoverRequest request = new MoverRequest();
        request.department = "";
        request.role = "Manager";

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            moverService.mover("user123", request);
        }, "Should throw IllegalArgumentException for blank department");
    }

    @Test
    void testMoverValidatesRequiredRole() {
        MoverRequest request = new MoverRequest();
        request.department = "Sales";
        request.role = "";

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            moverService.mover("user123", request);
        }, "Should throw IllegalArgumentException for blank role");
    }

    @Test
    void testMoverHandlesNoGroupChanges() throws Exception {
        // Arrange
        String userId = "user456";
        MoverRequest request = new MoverRequest();
        request.department = "Engineering";
        request.role = "Developer";

        User currentUser = new User();
        currentUser.userId = userId;
        currentUser.department = "Engineering";
        currentUser.role = "Developer";

        User updatedUser = new User();
        updatedUser.userId = userId;
        updatedUser.department = "Engineering";
        updatedUser.role = "Developer";

        when(oktaUserClient.getUser(userId)).thenReturn(currentUser);
        when(oktaUserClient.updateUser(userId, currentUser)).thenReturn(updatedUser);
        when(oktaGroupClient.getUserGroups(userId)).thenReturn(Arrays.asList());
        when(policyService.calculateRequiredGroups("Engineering", "Developer"))
                .thenReturn(new String[]{"group-eng"});

        // Act
        User result = moverService.mover(userId, request);

        // Assert
        assertNotNull(result);
        verify(oktaGroupClient, times(1)).addUserToGroup(userId, "group-eng");
        verify(oktaGroupClient, never()).removeUserFromGroup(anyString(), anyString());
    }
}
