package com.company.identity.workstream2_identity_impact.impact;
import org.springframework.stereotype.Service;
import java.util.Set;
@Service
public class ImpactService {
    private final BlastRadiusService blastRadiusService;
    public ImpactService(BlastRadiusService blastRadiusService) { this.blastRadiusService = blastRadiusService; }
    public ImpactResult calculateImpact(String userId, String action) {
        BlastRadiusService.BlastRadius radius = blastRadiusService.calculateBlastRadius(userId, action); int score = blastRadiusService.calculateRiskScore(radius);
        String level = radius.getCriticalApplications().isEmpty() ? (radius.getAffectedApplications().isEmpty() ? "LOW" : "MEDIUM") : "HIGH";
        return new ImpactResult(radius, score, level, "HIGH".equals(level) ? "REQUIRES_APPROVAL" : "AUTO_APPROVAL_ALLOWED", "ACCESS_INTERRUPTION");
    }
    public static final class ImpactResult {
        private final BlastRadiusService.BlastRadius blastRadius; private final int riskScore; private final String riskLevel, approvalRecommendation, accessEffect;
        private ImpactResult(BlastRadiusService.BlastRadius blastRadius, int riskScore, String riskLevel, String approvalRecommendation, String accessEffect) { this.blastRadius = blastRadius; this.riskScore = riskScore; this.riskLevel = riskLevel; this.approvalRecommendation = approvalRecommendation; this.accessEffect = accessEffect; }
        public String getAffectedUser() { return blastRadius.getAffectedUser(); } public String getAction() { return blastRadius.getAction(); } public Set<String> getAffectedGroups() { return blastRadius.getAffectedGroups(); } public Set<String> getAffectedApplications() { return blastRadius.getAffectedApplications(); } public Set<String> getCriticalApplications() { return blastRadius.getCriticalApplications(); } public int getBlastRadiusCount() { return blastRadius.getBlastRadiusCount(); } public int getRiskScore() { return riskScore; } public String getRiskLevel() { return riskLevel; } public String getApprovalRecommendation() { return approvalRecommendation; } public String getAccessEffect() { return accessEffect; }
    }
}
