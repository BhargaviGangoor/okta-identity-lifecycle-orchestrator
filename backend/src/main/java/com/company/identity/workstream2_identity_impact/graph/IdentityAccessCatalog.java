package com.company.identity.workstream2_identity_impact.graph;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/** Read-only application assignment and criticality data used by the identity graph. */
@Component
public class IdentityAccessCatalog {
    private final Map<String, Set<String>> userApplications;
    private final Map<String, Set<String>> groupApplications;
    private final Map<String, String> applicationCriticalities;

    @org.springframework.beans.factory.annotation.Autowired
    public IdentityAccessCatalog(ObjectMapper objectMapper) {
        this(loadUserApplications(objectMapper),
                loadGroupApplications(objectMapper),
                loadCriticalities(objectMapper));
    }

    IdentityAccessCatalog(ObjectMapper objectMapper, Path dataDirectory) {
        this(loadUserApplications(objectMapper, dataDirectory.resolve("sample-users.json")),
                loadGroupApplications(objectMapper, dataDirectory.resolve("sample-groups.json")),
                loadCriticalities(objectMapper, dataDirectory.resolve("sample-applications.json")));
    }

    public IdentityAccessCatalog(Map<String, ? extends Set<String>> userApplications,
                                 Map<String, ? extends Set<String>> groupApplications,
                                 Map<String, String> applicationCriticalities) {
        this.userApplications = copySets(userApplications);
        this.groupApplications = copySets(groupApplications);
        this.applicationCriticalities = Collections.unmodifiableMap(new LinkedHashMap<>(applicationCriticalities));
    }

    public Set<String> getUserApplications(String userId) { return userApplications.getOrDefault(userId, Set.of()); }
    public Set<String> getGroupApplications(String groupId) { return groupApplications.getOrDefault(groupId, Set.of()); }
    public String getApplicationCriticality(String application) { return applicationCriticalities.getOrDefault(application, "MEDIUM"); }

    private static Map<String, Set<String>> loadUserApplications(ObjectMapper mapper) {
        return loadAssignmentsFromAnySource(mapper, "sample-users.json", "userId");
    }

    private static Map<String, Set<String>> loadGroupApplications(ObjectMapper mapper) {
        return loadAssignmentsFromAnySource(mapper, "sample-groups.json", "groupId");
    }

    private static Map<String, String> loadCriticalities(ObjectMapper mapper) {
        return loadCriticalitiesFromAnySource(mapper, "sample-applications.json");
    }

    private static Map<String, Set<String>> loadUserApplications(ObjectMapper mapper, Path path) {
        return loadAssignments(mapper, path, "userId");
    }

    private static Map<String, Set<String>> loadGroupApplications(ObjectMapper mapper, Path path) {
        return loadAssignments(mapper, path, "groupId");
    }

    private static Map<String, Set<String>> loadAssignmentsFromAnySource(ObjectMapper mapper, String filename, String idField) {
        // 1. Try filesystem path (data/ or ../data/)
        Path direct = Path.of("data", filename);
        if (Files.isRegularFile(direct)) return loadAssignments(mapper, direct, idField);
        Path parent = Path.of("../data", filename);
        if (Files.isRegularFile(parent)) return loadAssignments(mapper, parent, idField);

        // 2. Try classpath resource (/data/filename or data/filename)
        try (java.io.InputStream is = IdentityAccessCatalog.class.getResourceAsStream("/data/" + filename)) {
            if (is != null) {
                JsonNode records = mapper.readTree(is);
                return parseAssignmentsJson(records, idField);
            }
        } catch (Exception ignored) {
        }

        // 3. Fallback to empty map
        return Collections.emptyMap();
    }

    private static Map<String, String> loadCriticalitiesFromAnySource(ObjectMapper mapper, String filename) {
        // 1. Try filesystem
        Path direct = Path.of("data", filename);
        if (Files.isRegularFile(direct)) return loadCriticalities(mapper, direct);
        Path parent = Path.of("../data", filename);
        if (Files.isRegularFile(parent)) return loadCriticalities(mapper, parent);

        // 2. Try classpath
        try (java.io.InputStream is = IdentityAccessCatalog.class.getResourceAsStream("/data/" + filename)) {
            if (is != null) {
                JsonNode records = mapper.readTree(is);
                return parseCriticalitiesJson(records);
            }
        } catch (Exception ignored) {
        }

        return Collections.emptyMap();
    }

    private static Map<String, Set<String>> parseAssignmentsJson(JsonNode records, String idField) {
        Map<String, Set<String>> assignments = new LinkedHashMap<>();
        if (records != null && records.isArray()) {
            for (JsonNode record : records) {
                Set<String> applications = new LinkedHashSet<>();
                for (JsonNode application : record.path("applications")) applications.add(application.asText());
                assignments.put(record.path(idField).asText(), applications);
            }
        }
        return assignments;
    }

    private static Map<String, String> parseCriticalitiesJson(JsonNode records) {
        Map<String, String> criticalities = new LinkedHashMap<>();
        if (records != null && records.isArray()) {
            for (JsonNode record : records) {
                criticalities.put(record.path("name").asText(), record.path("criticality").asText("MEDIUM"));
            }
        }
        return criticalities;
    }

    private static Map<String, Set<String>> loadAssignments(ObjectMapper mapper, Path path, String idField) {
        try {
            JsonNode records = mapper.readTree(Files.readString(path));
            return parseAssignmentsJson(records, idField);
        } catch (IOException exception) {
            return Collections.emptyMap();
        }
    }

    private static Map<String, String> loadCriticalities(ObjectMapper mapper, Path path) {
        try {
            JsonNode records = mapper.readTree(Files.readString(path));
            return parseCriticalitiesJson(records);
        } catch (IOException exception) {
            return Collections.emptyMap();
        }
    }

    private static Map<String, Set<String>> copySets(Map<String, ? extends Set<String>> source) {
        Map<String, Set<String>> copy = new LinkedHashMap<>();
        source.forEach((id, applications) -> copy.put(id, Collections.unmodifiableSet(new LinkedHashSet<>(applications))));
        return Collections.unmodifiableMap(copy);
    }
}
