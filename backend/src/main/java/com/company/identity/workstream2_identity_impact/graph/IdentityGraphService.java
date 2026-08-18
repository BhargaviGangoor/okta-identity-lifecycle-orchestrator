package com.company.identity.workstream2_identity_impact.graph;

import com.company.identity.common.model.Group;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;

/** Creates a fresh, immutable graph from Workstream 1 read clients and access fixtures. */
@Service
public class IdentityGraphService {
    private final OktaUserClient userClient;
    private final OktaGroupClient groupClient;
    private final IdentityAccessCatalog accessCatalog;

    public IdentityGraphService(OktaUserClient userClient, OktaGroupClient groupClient, IdentityAccessCatalog accessCatalog) {
        this.userClient = Objects.requireNonNull(userClient, "userClient is required");
        this.groupClient = Objects.requireNonNull(groupClient, "groupClient is required");
        this.accessCatalog = Objects.requireNonNull(accessCatalog, "accessCatalog is required");
    }

    public IdentityGraph buildIdentityGraph() {
        try {
            Map<String, Set<String>> memberships = new LinkedHashMap<>();
            for (User user : sortedUsers(userClient.getUsers())) {
                memberships.put(user.userId, immutableSorted(groupIds(groupClient.getUserGroups(user.userId))));
            }

            Map<String, Set<String>> groupApplications = new LinkedHashMap<>();
            for (Group group : sortedGroups(groupClient.getGroups())) {
                groupApplications.put(group.groupId, immutableSorted(accessCatalog.getGroupApplications(group.groupId)));
            }
            return new IdentityGraph(memberships, groupApplications, accessCatalog);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to read identity data", exception);
        }
    }

    public UserAccess getUserAccess(String userId) {
        IdentityGraph graph = buildIdentityGraph();
        requireUser(graph, userId);
        return new UserAccess(userId, graph.getUserGroups(userId), graph.getUserApplications(userId));
    }

    public Set<String> getUserGroups(String userId) { IdentityGraph graph = buildIdentityGraph(); requireUser(graph, userId); return graph.getUserGroups(userId); }
    public Set<String> getGroupApplications(String groupId) { IdentityGraph graph = buildIdentityGraph(); if (!graph.getGroups().contains(groupId)) throw new NoSuchElementException("Group not found: " + groupId); return graph.getGroupApplications(groupId); }
    public Set<String> getUserApplications(String userId) { IdentityGraph graph = buildIdentityGraph(); requireUser(graph, userId); return graph.getUserApplications(userId); }
    public String getApplicationCriticality(String application) { return buildIdentityGraph().getApplicationCriticality(application); }

    private static void requireUser(IdentityGraph graph, String userId) { if (!graph.getUsers().contains(userId)) throw new NoSuchElementException("User not found: " + userId); }
    private static Set<String> groupIds(Collection<Group> groups) { Set<String> ids = new LinkedHashSet<>(); if (groups != null) for (Group group : groups) if (group != null && group.groupId != null) ids.add(group.groupId); return ids; }
    private static List<User> sortedUsers(List<User> users) { List<User> result = new ArrayList<>(users == null ? List.of() : users); result.sort(Comparator.comparing(user -> user.userId)); return result; }
    private static List<Group> sortedGroups(List<Group> groups) { List<Group> result = new ArrayList<>(groups == null ? List.of() : groups); result.sort(Comparator.comparing(group -> group.groupId)); return result; }
    private static Set<String> immutableSorted(Collection<String> values) { List<String> sorted = new ArrayList<>(values); Collections.sort(sorted); return Collections.unmodifiableSet(new LinkedHashSet<>(sorted)); }

    public static final class IdentityGraph {
        private final Map<String, Set<String>> memberships;
        private final Map<String, Set<String>> groupApplications;
        private final IdentityAccessCatalog accessCatalog;

        private IdentityGraph(Map<String, Set<String>> memberships, Map<String, Set<String>> groupApplications, IdentityAccessCatalog accessCatalog) {
            this.memberships = Collections.unmodifiableMap(new LinkedHashMap<>(memberships));
            this.groupApplications = Collections.unmodifiableMap(new LinkedHashMap<>(groupApplications));
            this.accessCatalog = accessCatalog;
        }

        public Set<String> getUsers() { return memberships.keySet(); }
        public Set<String> getGroups() { return groupApplications.keySet(); }
        public Set<String> getApplications() { Set<String> applications = new LinkedHashSet<>(); groupApplications.values().forEach(applications::addAll); memberships.keySet().forEach(userId -> applications.addAll(accessCatalog.getUserApplications(userId))); return immutableSorted(applications); }
        public Set<String> getUserGroups(String userId) { return memberships.getOrDefault(userId, Set.of()); }
        public Set<String> getGroupApplications(String groupId) { return groupApplications.getOrDefault(groupId, Set.of()); }
        public Set<String> getUserApplications(String userId) { Set<String> applications = new LinkedHashSet<>(accessCatalog.getUserApplications(userId)); for (String groupId : getUserGroups(userId)) applications.addAll(getGroupApplications(groupId)); return immutableSorted(applications); }
        public String getApplicationCriticality(String application) { return accessCatalog.getApplicationCriticality(application); }
    }

    public record UserAccess(String userId, Set<String> groups, Set<String> applications) { }
}
