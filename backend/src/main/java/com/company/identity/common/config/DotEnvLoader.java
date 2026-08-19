package com.company.identity.common.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads KEY=VALUE pairs from the repo-root {@code .env} file.
 * Looks in the process working directory and its parent so it works
 * whether the app is started from the repo root or from {@code backend/}.
 */
public final class DotEnvLoader {

    private DotEnvLoader() {
    }

    public static Map<String, String> load() {
        Path envFile = findEnvFile();
        if (envFile == null) {
            return Map.of();
        }
        return parse(envFile);
    }

    public static Path findEnvFile() {
        Path cwd = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        List<Path> candidates = List.of(
                cwd.resolve(".env"),
                cwd.resolve("../.env").normalize(),
                cwd.resolve("backend/.env")
        );
        for (Path candidate : candidates) {
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    static Map<String, String> parse(Path envFile) {
        Map<String, String> values = new LinkedHashMap<>();
        try {
            for (String rawLine : Files.readAllLines(envFile)) {
                String line = rawLine.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eq = line.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = line.substring(0, eq).trim();
                String value = stripQuotes(line.substring(eq + 1).trim());
                if (!key.isEmpty()) {
                    values.put(key, value);
                }
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read .env from " + envFile, ex);
        }
        return values;
    }

    private static String stripQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}
