package com.company.identity.workstream1_okta_lifecycle.okta;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OktaClient {

    private final HttpClient httpClient;
    private final String oktaDomain;
    private final String apiToken;

    public OktaClient(
            @Value("${okta.domain:${OKTA_DOMAIN:}}") String oktaDomain,
            @Value("${okta.api-token:${OKTA_API_TOKEN:}}") String apiToken
    ) {

        this.httpClient = HttpClient.newHttpClient();
        this.oktaDomain = firstNonBlank(oktaDomain, System.getenv("OKTA_DOMAIN"), System.getProperty("OKTA_DOMAIN"));
        this.apiToken = firstNonBlank(apiToken, System.getenv("OKTA_API_TOKEN"), System.getProperty("OKTA_API_TOKEN"));

        if (this.oktaDomain == null) {
            throw new IllegalStateException(
                    "OKTA_DOMAIN is missing. Set it in the repo-root .env file."
            );
        }

        if (this.apiToken == null) {
            throw new IllegalStateException(
                    "OKTA_API_TOKEN is missing. Set it in the repo-root .env file."
            );
        }
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    public String get(String endpoint) throws Exception {

        HttpRequest request = buildRequest(endpoint)
                .GET()
                .build();

        return send(request);
    }

    public String post(String endpoint) throws Exception {

        HttpRequest request = buildRequest(endpoint)
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        return send(request);
    }

    public String post(String endpoint, String body) throws Exception {

        HttpRequest request = buildRequest(endpoint)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return send(request);
    }

    public String put(String endpoint, String body) throws Exception {

        HttpRequest request = buildRequest(endpoint)
                .PUT(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return send(request);
    }

    public String delete(String endpoint) throws Exception {

        HttpRequest request = buildRequest(endpoint)
                .DELETE()
                .build();

        return send(request);
    }

    private HttpRequest.Builder buildRequest(String endpoint) {

        return HttpRequest.newBuilder()
                .uri(URI.create(oktaDomain + endpoint))
                .header("Authorization", "SSWS " + apiToken)
                .header("Accept", "application/json")
                .header("Content-Type", "application/json");
    }

    private String send(HttpRequest request) throws Exception {

        HttpResponse<String> response =
                httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

        int statusCode = response.statusCode();

        if (statusCode < 200 || statusCode >= 300) {

            throw new RuntimeException(
                    "Okta API request failed. HTTP "
                            + statusCode
                            + ": "
                            + response.body()
            );
        }

        return response.body();
    }
}
