package com.company.identity.workstream2_identity_impact.graph;

import com.company.identity.workstream1_okta_lifecycle.okta.OktaClient;
import java.lang.reflect.Field;
import java.util.*;

/** Read-only projection of the identity data exposed by {@link OktaClient}. */
public class IdentityGraphService {
    private final OktaClient oktaClient;

    public IdentityGraphService(OktaClient oktaClient) { this.oktaClient = Objects.requireNonNull(oktaClient, "oktaClient is required"); }

    public IdentityGraph buildIdentityGraph() {
        Map<String, Set<String>> memberships = new LinkedHashMap<>(), directApplications = new LinkedHashMap<>(), groupApplications = new LinkedHashMap<>();
        Map<String, String> criticalities = new LinkedHashMap<>();
        for (Object user : sorted(asList(oktaClient.getUsers()), "userId")) {
            String userId = value(user, "userId");
            if (userId != null) {
                memberships.put(userId, names(valueObject(user, "groups", "groupIds")));
                directApplications.put(userId, applications(valueObject(user, "applications", "applicationNames"), criticalities));
            }
        }
        for (String userId : new ArrayList<>(memberships.keySet())) {
            Set<String> fromClient = names(oktaClient.getUserGroups(userId));
            if (!fromClient.isEmpty()) memberships.put(userId, fromClient);
        }
        for (Object group : sorted(asList(oktaClient.getGroups()), "groupId")) {
            String groupId = value(group, "groupId");
            if (groupId != null) groupApplications.put(groupId, applications(valueObject(group, "applications", "applicationNames"), criticalities));
        }
        return new IdentityGraph(memberships, directApplications, groupApplications, criticalities);
    }

    public UserAccess getUserAccess(String userId) { IdentityGraph graph = buildIdentityGraph(); requireUser(graph, userId); return new UserAccess(userId, graph.getUserGroups(userId), graph.getUserApplications(userId)); }
    public Set<String> getUserGroups(String userId) { IdentityGraph graph = buildIdentityGraph(); requireUser(graph, userId); return graph.getUserGroups(userId); }
    public Set<String> getGroupApplications(String groupId) { IdentityGraph graph = buildIdentityGraph(); if (!graph.groupApplications.containsKey(groupId)) throw new NoSuchElementException("Group not found: " + groupId); return graph.getGroupApplications(groupId); }
    public Set<String> getUserApplications(String userId) { IdentityGraph graph = buildIdentityGraph(); requireUser(graph, userId); return graph.getUserApplications(userId); }

    private static void requireUser(IdentityGraph graph, String userId) { if (!graph.memberships.containsKey(userId)) throw new NoSuchElementException("User not found: " + userId); }
    private static List<Object> asList(Object input) {
        if (input == null) return List.of(); if (input instanceof Collection<?> c) return new ArrayList<>(c);
        if (input.getClass().isArray()) { List<Object> result = new ArrayList<>(); for (int i = 0; i < java.lang.reflect.Array.getLength(input); i++) result.add(java.lang.reflect.Array.get(input, i)); return result; }
        return List.of(input);
    }
    private static List<Object> sorted(List<Object> values, String field) { values.sort(Comparator.comparing(item -> String.valueOf(value(item, field)), Comparator.nullsLast(String::compareTo))); return values; }
    private static Set<String> names(Object input) { Set<String> result = new LinkedHashSet<>(); for (Object item : asList(input)) { String name = item instanceof String ? (String) item : value(item, "groupId", "name", "applicationId"); if (name != null) result.add(name); } return ordered(result); }
    private static Set<String> applications(Object input, Map<String, String> criticalities) { Set<String> result = new LinkedHashSet<>(); for (Object item : asList(input)) { String name = item instanceof String ? (String) item : value(item, "name", "applicationId", "id"); if (name != null) { result.add(name); String criticality = value(item, "criticality"); if (criticality != null) criticalities.put(name, criticality.toUpperCase(Locale.ROOT)); } } return ordered(result); }
    private static Set<String> ordered(Set<String> values) { List<String> sorted = new ArrayList<>(values); Collections.sort(sorted); return Collections.unmodifiableSet(new LinkedHashSet<>(sorted)); }
    private static Object valueObject(Object target, String... names) { for (String name : names) { Object value = fieldValue(target, name); if (value != null) return value; } return null; }
    private static String value(Object target, String... names) { Object result = valueObject(target, names); return result == null ? null : String.valueOf(result); }
    @SuppressWarnings("unchecked") private static Object fieldValue(Object target, String name) { if (target == null) return null; if (target instanceof Map<?, ?> map) return ((Map<String, Object>) map).get(name); try { Field field = target.getClass().getField(name); return field.get(target); } catch (NoSuchFieldException | IllegalAccessException ignored) { return null; } }

    public static final class IdentityGraph {
        private final Map<String, Set<String>> memberships, directApplications, groupApplications;
        private final Map<String, String> criticalities;
        private IdentityGraph(Map<String, Set<String>> memberships, Map<String, Set<String>> directApplications, Map<String, Set<String>> groupApplications, Map<String, String> criticalities) { this.memberships = immutableMap(memberships); this.directApplications = immutableMap(directApplications); this.groupApplications = immutableMap(groupApplications); this.criticalities = Collections.unmodifiableMap(new LinkedHashMap<>(criticalities)); }
        public Set<String> getUsers() { return memberships.keySet(); }
        public Set<String> getGroups() { return groupApplications.keySet(); }
        public Set<String> getApplications() { return Collections.unmodifiableSet(new LinkedHashSet<>(criticalities.keySet())); }
        public Set<String> getUserGroups(String userId) { return memberships.getOrDefault(userId, Set.of()); }
        public Set<String> getGroupApplications(String groupId) { return groupApplications.getOrDefault(groupId, Set.of()); }
        public Set<String> getUserApplications(String userId) { Set<String> apps = new LinkedHashSet<>(directApplications.getOrDefault(userId, Set.of())); for (String groupId : getUserGroups(userId)) apps.addAll(getGroupApplications(groupId)); return ordered(apps); }
        public String getApplicationCriticality(String application) { return criticalities.getOrDefault(application, "MEDIUM"); }
        private static Map<String, Set<String>> immutableMap(Map<String, Set<String>> input) { Map<String, Set<String>> copy = new LinkedHashMap<>(); input.forEach(copy::put); return Collections.unmodifiableMap(copy); }
    }
    public record UserAccess(String userId, Set<String> groups, Set<String> applications) { }
}
