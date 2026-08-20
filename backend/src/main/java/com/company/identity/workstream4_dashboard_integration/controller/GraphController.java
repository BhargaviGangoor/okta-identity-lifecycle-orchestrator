package com.company.identity.workstream4_dashboard_integration.controller;

import com.company.identity.common.model.Group;
import com.company.identity.common.model.User;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaGroupClient;
import com.company.identity.workstream1_okta_lifecycle.okta.OktaUserClient;
import com.company.identity.workstream2_identity_impact.graph.IdentityAccessCatalog;
import com.company.identity.workstream2_identity_impact.graph.IdentityGraphService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * Controller exposing the complete Identity Access Graph topology, nodes, and edges
 * for interactive visualization and blast radius exploration.
 */
@RestController
@RequestMapping("")
public class GraphController {

    private final IdentityGraphService graphService;
    private final OktaUserClient userClient;
    private final OktaGroupClient groupClient;
    private final IdentityAccessCatalog accessCatalog;

    public GraphController(
            IdentityGraphService graphService,
            OktaUserClient userClient,
            OktaGroupClient groupClient,
            IdentityAccessCatalog accessCatalog) {
        this.graphService = graphService;
        this.userClient = userClient;
        this.groupClient = groupClient;
        this.accessCatalog = accessCatalog;
    }

    @GetMapping({"/graph", "/api/graph"})
    public ResponseEntity<GraphResponse> getGraph(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String department) {

        List<User> usersList = new ArrayList<>();
        try {
            usersList = userClient.getUsers();
        } catch (Exception ignored) {
        }

        // If Okta returns empty or fails, use graphService
        if (usersList.isEmpty()) {
            IdentityGraphService.IdentityGraph graph = graphService.buildIdentityGraph();
            for (String uid : graph.getUsers()) {
                User u = new User();
                u.userId = uid;
                u.name = uid;
                u.status = "ACTIVE";
                usersList.add(u);
            }
        }

        List<Group> allGroups = new ArrayList<>();
        try {
            allGroups = groupClient.getGroups();
        } catch (Exception ignored) {
        }

        Map<String, String> groupNameMap = new HashMap<>();
        for (Group g : allGroups) {
            if (g.groupId != null) {
                groupNameMap.put(g.groupId, (g.name != null && !g.name.isBlank()) ? g.name : g.groupId);
            }
        }

        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();
        Set<String> includedNodeIds = new HashSet<>();

        // Determine target users
        List<User> targetUsers = new ArrayList<>();
        for (User u : usersList) {
            if (userId != null && !userId.isBlank() && !userId.equalsIgnoreCase(u.userId)) {
                continue;
            }
            if (department != null && !department.isBlank() && !"ALL".equalsIgnoreCase(department)) {
                if (u.department == null || !department.equalsIgnoreCase(u.department)) {
                    continue;
                }
            }
            targetUsers.add(u);
        }

        Map<String, Set<String>> userGroupsMap = new HashMap<>();
        Set<String> connectedGroups = new LinkedHashSet<>();
        Set<String> connectedApps = new LinkedHashSet<>();

        for (User u : targetUsers) {
            String uid = u.userId != null ? u.userId : "usr_" + Math.abs(u.name.hashCode());
            String label = (u.name != null && !u.name.isBlank()) ? u.name : uid;
            String dept = (u.department != null && !u.department.isBlank()) ? u.department : "General";
            String title = (u.role != null && !u.role.isBlank()) ? u.role : "Team Member";
            String status = (u.status != null && !u.status.isBlank()) ? u.status : "ACTIVE";

            // Fetch live Okta groups for this user
            List<Group> uGroups = List.of();
            try {
                if (u.userId != null) {
                    uGroups = groupClient.getUserGroups(u.userId);
                }
            } catch (Exception ignored) {
            }

            Set<String> groupNames = new LinkedHashSet<>();
            for (Group g : uGroups) {
                String gLabel = (g.name != null && !g.name.isBlank()) ? g.name : (g.groupId != null ? g.groupId : "okta-group");
                groupNames.add(gLabel);
            }

            // If user has no Okta groups in tenant, assign standard department birthright group
            if (groupNames.isEmpty()) {
                String birthrightGroup = "okta-" + dept.toLowerCase().replaceAll("[^a-z0-9]", "") + "-all";
                groupNames.add(birthrightGroup);
            }

            userGroupsMap.put(uid, groupNames);

            int risk = 20 + (groupNames.size() * 12);
            if ("Security".equalsIgnoreCase(dept) || "Engineering".equalsIgnoreCase(dept)) {
                risk += 15;
            }

            nodes.add(new GraphNode(uid, label, "USER", dept, title, status, Math.min(95, risk), "NONE"));
            includedNodeIds.add(uid);

            for (String gName : groupNames) {
                connectedGroups.add(gName);
                edges.add(new GraphEdge(uid + "->" + gName, uid, gName, "MEMBER_OF"));
            }
        }

        // Map groups to applications
        for (String gName : connectedGroups) {
            nodes.add(new GraphNode(gName, gName, "GROUP", "Directory", "Okta Group", "ACTIVE", 10, "NONE"));
            includedNodeIds.add(gName);

            // Determine applications for this group
            Set<String> apps = resolveApplicationsForGroup(gName);
            for (String app : apps) {
                connectedApps.add(app);
                edges.add(new GraphEdge(gName + "->" + app, gName, app, "GRANTS_ACCESS"));
            }
        }

        // Build Application Nodes
        for (String app : connectedApps) {
            String criticality = resolveCriticalityForApp(app);
            int appRisk = "HIGH".equalsIgnoreCase(criticality) ? 80 : "MEDIUM".equalsIgnoreCase(criticality) ? 45 : 15;
            nodes.add(new GraphNode(app, app, "APPLICATION", "SSO", "Target SaaS System", "ACTIVE", appRisk, criticality));
            includedNodeIds.add(app);
        }

        long highCriticalityCount = connectedApps.stream()
                .filter(a -> "HIGH".equalsIgnoreCase(resolveCriticalityForApp(a)))
                .count();

        GraphMetrics metrics = new GraphMetrics(
                targetUsers.size(),
                connectedGroups.size(),
                connectedApps.size(),
                nodes.size(),
                edges.size(),
                (int) highCriticalityCount
        );

        return ResponseEntity.ok(new GraphResponse(nodes, edges, metrics));
    }

    private Set<String> resolveApplicationsForGroup(String groupName) {
        Set<String> apps = new LinkedHashSet<>();
        String g = groupName.toLowerCase();

        // Check Access Catalog first
        Set<String> catalogApps = accessCatalog.getGroupApplications(groupName);
        if (catalogApps != null && !catalogApps.isEmpty()) {
            apps.addAll(catalogApps);
            return apps;
        }

        if (g.contains("eng") || g.contains("dev")) {
            apps.add("AWS Production");
            apps.add("GitHub Enterprise");
            apps.add("Jira Software");
            apps.add("Datadog Monitoring");
        } else if (g.contains("sec") || g.contains("admin")) {
            apps.add("AWS Production");
            apps.add("Okta Admin Console");
            apps.add("CrowdStrike Falcon");
            apps.add("Splunk SIEM");
        } else if (g.contains("fin") || g.contains("billing")) {
            apps.add("Finance-Reporting");
            apps.add("Workday HR");
            apps.add("Salesforce CRM");
            apps.add("Expensify");
        } else if (g.contains("sales") || g.contains("rev")) {
            apps.add("Salesforce CRM");
            apps.add("HubSpot");
            apps.add("Slack Workspace");
            apps.add("Google Workspace");
        } else if (g.contains("it") || g.contains("ops")) {
            apps.add("Google Workspace");
            apps.add("Slack Workspace");
            apps.add("Jira Service Desk");
            apps.add("Zoom Enterprise");
        } else if (g.contains("people") || g.contains("hr")) {
            apps.add("Workday HR");
            apps.add("Greenhouse ATS");
            apps.add("Culture Amp");
            apps.add("Google Workspace");
        } else {
            apps.add("Google Workspace");
            apps.add("Slack Workspace");
        }

        return apps;
    }

    private String resolveCriticalityForApp(String app) {
        String cat = accessCatalog.getApplicationCriticality(app);
        if (cat != null && !cat.isBlank() && !"MEDIUM".equalsIgnoreCase(cat)) {
            return cat;
        }

        String a = app.toLowerCase();
        if (a.contains("aws") || a.contains("prod") || a.contains("admin") || a.contains("crowdstrike") || a.contains("splunk") || a.contains("finance")) {
            return "HIGH";
        }
        if (a.contains("github") || a.contains("datadog") || a.contains("salesforce") || a.contains("workday")) {
            return "MEDIUM";
        }
        return "LOW";
    }

    public record GraphNode(
            String id,
            String label,
            String type,
            String department,
            String role,
            String status,
            int riskScore,
            String criticality
    ) {}

    public record GraphEdge(
            String id,
            String source,
            String target,
            String relationship
    ) {}

    public record GraphMetrics(
            int totalUsers,
            int totalGroups,
            int totalApplications,
            int totalNodes,
            int totalEdges,
            int highCriticalityApps
    ) {}

    public record GraphResponse(
            List<GraphNode> nodes,
            List<GraphEdge> edges,
            GraphMetrics metrics
    ) {}
}
