package com.company.identity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.company.identity.common.config.DotEnvLoader;

@SpringBootApplication
public class IdentityOrchestratorApplication {
    public static void main(String[] args) {
        DotEnvLoader.load().forEach((key, value) -> {
            if (System.getenv(key) == null && System.getProperty(key) == null) {
                System.setProperty(key, value);
            }
        });
        SpringApplication.run(IdentityOrchestratorApplication.class, args);
    }
}
