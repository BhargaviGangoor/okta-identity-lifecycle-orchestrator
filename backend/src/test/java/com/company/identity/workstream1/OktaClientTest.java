package com.company.identity.workstream1;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;

import com.company.identity.workstream1_okta_lifecycle.okta.OktaClient;

class OktaClientTest {

    @Test
    void testOktaClientInitializationWithValidEnvVars() {

        assertDoesNotThrow(() -> {

            OktaClient client = new OktaClient();

            assertNotNull(client);
        });
    }
}

/*
apple@Rithika's-MacBook okta-identity-lifecycle-orchestrator % echo "DOMAIN=https://trial-3149343.okta.com/oauth2/default"

echo "TOKEN_SET={00T4eai2kpDFf6Tap697:+YES}" 
DOMAIN=https://trial-3149343.okta.com/oauth2/default
TOKEN_SET={00T4eai2kpDFf6Tap697:+YES}
mvn test -Dtest=OktaClientTest,JoinerServiceTest,MoverServiceTest,LeaverServiceTest
*/