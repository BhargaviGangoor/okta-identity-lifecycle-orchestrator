package com.company.identity.workstream1;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.company.identity.common.dto.JoinerRequest;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.lifecycle.JoinerService;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import com.company.identity.workstream1_okta_lifecycle.policy.PolicyService;

class JoinerServiceTest {

    private OktaUserClient oktaUserClient;
    private OktaGroupClient oktaGroupClient;
    private PolicyService policyService;
    private JoinerService joinerService;

    @BeforeEach
    void setUp() {
        // Create manual mocks without needing @ExtendWith(MockitoExtension.class)
        oktaUserClient = mock(OktaUserClient.class);
        oktaGroupClient = mock(OktaGroupClient.class);
        policyService = mock(PolicyService.class);
        
        joinerService = new JoinerService(
                oktaUserClient,
                oktaGroupClient,
                policyService
        );
    }

    @Test
    void testJoinerSuccessfullyCreatesUserAndActivates() throws Exception {
        // Arrange
        JoinerRequest request = new JoinerRequest();
        request.employeeId = "EMP001";
        request.firstName = "John";
        request.lastName = "Doe";
        request.email = "john.doe@example.com";
        request.department = "Engineering";
        request.role = "Developer";

        User createdUser = new User();
        createdUser.userId = "user123";
        createdUser.employeeId = "EMP001";
        createdUser.name = "John Doe";
        createdUser.email = "john.doe@example.com";
        createdUser.status = "ACTIVE";
        createdUser.department = "Engineering";
        createdUser.role = "Developer";

        when(oktaUserClient.createUser(any(User.class))).thenReturn(createdUser);
        when(policyService.calculateRequiredGroups("Engineering", "Developer"))
                .thenReturn(new String[]{"group1", "group2"});

        // Act
        User result = joinerService.joiner(request);

        // Assert
        assertNotNull(result);
        assertEquals("user123", result.userId);
        assertEquals("EMP001", result.employeeId);
        verify(oktaUserClient, times(1)).createUser(any(User.class));
        verify(oktaUserClient, times(1)).activateUser("user123");
        verify(oktaGroupClient, times(2)).addUserToGroup(anyString(), anyString());
    }

    @Test
    void testJoinerValidatesNullRequest() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            joinerService.joiner(null);
        }, "Should throw IllegalArgumentException for null request");
    }

    @Test
    void testJoinerValidatesRequiredFields() {
        JoinerRequest request = new JoinerRequest();
        request.employeeId = "EMP001";
        // Missing other required fields

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            joinerService.joiner(request);
        }, "Should throw IllegalArgumentException when required fields are missing");
    }

    @Test
    void testJoinerValidatesBlankEmployeeId() {
        JoinerRequest request = new JoinerRequest();
        request.employeeId = "";
        request.firstName = "John";
        request.lastName = "Doe";
        request.email = "john@example.com";
        request.department = "Eng";
        request.role = "Dev";

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            joinerService.joiner(request);
        }, "Should throw IllegalArgumentException for blank employeeId");
    }

    @Test
    void testJoinerHandlesNullGroupPolicy() throws Exception {
        // Arrange
        JoinerRequest request = new JoinerRequest();
        request.employeeId = "EMP002";
        request.firstName = "Jane";
        request.lastName = "Smith";
        request.email = "jane.smith@example.com";
        request.department = "Sales";
        request.role = "Manager";

        User createdUser = new User();
        createdUser.userId = "user456";

        when(oktaUserClient.createUser(any(User.class))).thenReturn(createdUser);
        when(policyService.calculateRequiredGroups("Sales", "Manager"))
                .thenReturn(null);

        // Act
        User result = joinerService.joiner(request);

        // Assert
        assertNotNull(result);
        verify(oktaGroupClient, never()).addUserToGroup(anyString(), anyString());
    }
}
