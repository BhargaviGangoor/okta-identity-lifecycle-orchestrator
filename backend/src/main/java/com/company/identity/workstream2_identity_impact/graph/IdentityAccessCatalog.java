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
        this(objectMapper, resolveDataDirectory());
    }

    private static Path resolveDataDirectory() {
        Path direct = Path.of("data");
        if (Files.isDirectory(direct)) return direct;
        Path parent = Path.of("../data");
        if (Files.isDirectory(parent)) return parent;
        return direct;
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

    private static Map<String, Set<String>> loadUserApplications(ObjectMapper mapper, Path path) {
        return loadAssignments(mapper, path, "userId");
    }

    private static Map<String, Set<String>> loadGroupApplications(ObjectMapper mapper, Path path) {
        return loadAssignments(mapper, path, "groupId");
    }

    private static Map<String, Set<String>> loadAssignments(ObjectMapper mapper, Path path, String idField) {
        Map<String, Set<String>> assignments = new LinkedHashMap<>();
        try {
            JsonNode records = mapper.readTree(Files.readString(path));
            for (JsonNode record : records) {
                Set<String> applications = new LinkedHashSet<>();
                for (JsonNode application : record.path("applications")) applications.add(application.asText());
                assignments.put(record.path(idField).asText(), applications);
            }
            return assignments;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to load identity access data from " + path, exception);
        }
    }

    private static Map<String, String> loadCriticalities(ObjectMapper mapper, Path path) {
        Map<String, String> criticalities = new LinkedHashMap<>();
        try {
            JsonNode records = mapper.readTree(Files.readString(path));
            for (JsonNode record : records) criticalities.put(record.path("name").asText(), record.path("criticality").asText("MEDIUM"));
            return criticalities;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to load application criticality data from " + path, exception);
        }
    }

    private static Map<String, Set<String>> copySets(Map<String, ? extends Set<String>> source) {
        Map<String, Set<String>> copy = new LinkedHashMap<>();
        source.forEach((id, applications) -> copy.put(id, Collections.unmodifiableSet(new LinkedHashSet<>(applications))));
        return Collections.unmodifiableMap(copy);
    }
}
