package com.company.identity.workstream2_identity_impact.impact;
import com.company.identity.workstream2_identity_impact.graph.IdentityGraphService;
import java.util.*;
public class BlastRadiusService {
    private final IdentityGraphService graphService;
    public BlastRadiusService(IdentityGraphService graphService) { this.graphService = graphService; }
    public BlastRadius calculateBlastRadius(String userId, String action) {
        requireDeactivate(action); IdentityGraphService.IdentityGraph graph = graphService.buildIdentityGraph();
        if (!graph.getUsers().contains(userId)) throw new NoSuchElementException("User not found: " + userId);
        Set<String> groups = graph.getUserGroups(userId), applications = graph.getUserApplications(userId); Map<String, String> criticalities = new LinkedHashMap<>(); applications.forEach(app -> criticalities.put(app, graph.getApplicationCriticality(app)));
        return new BlastRadius(userId, "DEACTIVATE", groups, applications, criticalities);
    }
    public int calculateRiskScore(Object impact) { if (!(impact instanceof BlastRadius radius)) throw new IllegalArgumentException("Impact must be a BlastRadius"); return radius.getAffectedApplications().size() * 10 + radius.getCriticalApplications().size() * 50; }
    static void requireDeactivate(String action) { if (!"DEACTIVATE".equals(action == null ? null : action.toUpperCase(Locale.ROOT))) throw new IllegalArgumentException("Unsupported lifecycle action: " + action); }
    public static final class BlastRadius {
        private final String affectedUser, action; private final Set<String> affectedGroups, affectedApplications; private final Map<String, String> applicationCriticalities;
        private BlastRadius(String affectedUser, String action, Set<String> groups, Set<String> apps, Map<String, String> criticalities) { this.affectedUser = affectedUser; this.action = action; this.affectedGroups = Collections.unmodifiableSet(new LinkedHashSet<>(groups)); this.affectedApplications = Collections.unmodifiableSet(new LinkedHashSet<>(apps)); this.applicationCriticalities = Collections.unmodifiableMap(new LinkedHashMap<>(criticalities)); }
        public String getAffectedUser() { return affectedUser; } public String getAction() { return action; } public Set<String> getAffectedGroups() { return affectedGroups; } public Set<String> getAffectedApplications() { return affectedApplications; } public Map<String, String> getApplicationCriticalities() { return applicationCriticalities; }
        public Set<String> getCriticalApplications() { Set<String> result = new LinkedHashSet<>(); applicationCriticalities.forEach((app, criticality) -> { if ("HIGH".equalsIgnoreCase(criticality)) result.add(app); }); return Collections.unmodifiableSet(result); }
        public int getBlastRadiusCount() { return 1 + affectedGroups.size() + affectedApplications.size(); }
    }
}
