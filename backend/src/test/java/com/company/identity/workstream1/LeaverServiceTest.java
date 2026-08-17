package com.company.identity.workstream1;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InOrder;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.company.identity.common.dto.LeaverRequest;
import com.company.identity.common.model.Group;
import com.company.identity.workstream1_okta_lifecycle.lifecycle.LeaverService;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaSessionClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;

class LeaverServiceTest {

    private OktaUserClient oktaUserClient;
    private OktaSessionClient oktaSessionClient;
    private OktaGroupClient oktaGroupClient;
    private LeaverService leaverService;

    @BeforeEach
    void setUp() {
        // Create manual mocks without needing @ExtendWith(MockitoExtension.class)
        oktaUserClient = mock(OktaUserClient.class);
        oktaSessionClient = mock(OktaSessionClient.class);
        oktaGroupClient = mock(OktaGroupClient.class);
        
        leaverService = new LeaverService(
                oktaUserClient,
                oktaSessionClient,
                oktaGroupClient
        );
    }

    @Test
    void testLeaverSuccessfullyDeactivatesUserAndRevokesSession() throws Exception {
        // Arrange
        String userId = "user123";
        LeaverRequest request = new LeaverRequest();
        request.reason = "Employee resignation";

        Group group1 = new Group();
        group1.groupId = "group1";
        group1.name = "Engineering";

        Group group2 = new Group();
        group2.groupId = "group2";
        group2.name = "Developers";

        List<Group> userGroups = Arrays.asList(group1, group2);

        when(oktaGroupClient.getUserGroups(userId)).thenReturn(userGroups);

        // Act
        leaverService.leaver(userId, request);

        // Assert
        verify(oktaUserClient, times(1)).deactivateUser(userId);
        verify(oktaSessionClient, times(1)).revokeSessions(userId);
        verify(oktaGroupClient, times(1)).getUserGroups(userId);
        verify(oktaGroupClient, times(2)).removeUserFromGroup(anyString(), anyString());
    }

    @Test
    void testLeaverValidatesNullUserId() {
        LeaverRequest request = new LeaverRequest();
        request.reason = "Termination";

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            leaverService.leaver(null, request);
        }, "Should throw IllegalArgumentException for null userId");
    }

    @Test
    void testLeaverValidatesBlankUserId() {
        LeaverRequest request = new LeaverRequest();
        request.reason = "Termination";

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            leaverService.leaver("", request);
        }, "Should throw IllegalArgumentException for blank userId");
    }

    @Test
    void testLeaverHandlesNoGroups() throws Exception {
        // Arrange
        String userId = "user456";
        LeaverRequest request = new LeaverRequest();
        request.reason = "Retirement";

        when(oktaGroupClient.getUserGroups(userId)).thenReturn(Arrays.asList());

        // Act
        leaverService.leaver(userId, request);

        // Assert
        verify(oktaUserClient, times(1)).deactivateUser(userId);
        verify(oktaSessionClient, times(1)).revokeSessions(userId);
        verify(oktaGroupClient, times(1)).getUserGroups(userId);
        verify(oktaGroupClient, never()).removeUserFromGroup(anyString(), anyString());
    }

    @Test
    void testLeaverHandlesNullGroupList() throws Exception {
        // Arrange
        String userId = "user789";
        LeaverRequest request = new LeaverRequest();
        request.reason = "Transfer";

        when(oktaGroupClient.getUserGroups(userId)).thenReturn(null);

        // Act
        leaverService.leaver(userId, request);

        // Assert
        verify(oktaUserClient, times(1)).deactivateUser(userId);
        verify(oktaSessionClient, times(1)).revokeSessions(userId);
        verify(oktaGroupClient, times(1)).getUserGroups(userId);
        verify(oktaGroupClient, never()).removeUserFromGroup(anyString(), anyString());
    }

    @Test
    void testLeaverDeactivateUserBeforeRevokingSession() throws Exception {
        // Arrange
        String userId = "user999";
        LeaverRequest request = new LeaverRequest();

        when(oktaGroupClient.getUserGroups(userId)).thenReturn(Arrays.asList());

        // Act
        leaverService.leaver(userId, request);

        // Assert
        // Verify order: deactivate first, then revoke sessions
        InOrder inOrder = inOrder(oktaUserClient, oktaSessionClient);
        inOrder.verify(oktaUserClient).deactivateUser(userId);
        inOrder.verify(oktaSessionClient).revokeSessions(userId);
    }
}
