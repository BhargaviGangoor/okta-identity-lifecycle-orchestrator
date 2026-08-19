package com.company.identity.workstream1;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

import com.company.identity.workstream1_okta_lifecycle.okta.OktaClient;

class OktaClientTest {

    @Test
    void testOktaClientInitializationWithValidEnvVars() {
        String domain = firstNonBlank(
                System.getenv("OKTA_DOMAIN"),
                System.getProperty("OKTA_DOMAIN"),
                "https://example.okta.com"
        );
        String token = firstNonBlank(
                System.getenv("OKTA_API_TOKEN"),
                System.getProperty("OKTA_API_TOKEN"),
                "test-token"
        );

        assertDoesNotThrow(() -> {
            OktaClient client = new OktaClient(domain, token);
            assertNotNull(client);
        });
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
