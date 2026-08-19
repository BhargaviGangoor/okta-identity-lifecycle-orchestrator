package com.company.identity.common.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

/**
 * Injects repo-root {@code .env} values into Spring's Environment so
 * {@code application.yml} placeholders like {@code ${OKTA_DOMAIN}} resolve.
 * OS environment variables always win over {@code .env}.
 */
public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    static final String PROPERTY_SOURCE_NAME = "dotenv";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, String> loaded = DotEnvLoader.load();
        if (loaded.isEmpty()) {
            return;
        }

        Map<String, Object> properties = new HashMap<>();
        for (Map.Entry<String, String> entry : loaded.entrySet()) {
            String key = entry.getKey();
            if (hasExistingValue(key)) {
                continue;
            }
            properties.put(key, entry.getValue());
            if (System.getProperty(key) == null) {
                System.setProperty(key, entry.getValue());
            }
        }

        if (properties.isEmpty()) {
            return;
        }

        MapPropertySource propertySource = new MapPropertySource(PROPERTY_SOURCE_NAME, properties);
        MutablePropertySources sources = environment.getPropertySources();
        if (sources.contains("systemEnvironment")) {
            sources.addAfter("systemEnvironment", propertySource);
        } else {
            sources.addFirst(propertySource);
        }
    }

    private static boolean hasExistingValue(String key) {
        String fromOs = System.getenv(key);
        return fromOs != null && !fromOs.isBlank();
    }
}
