import { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Zap, Radio, Lock, AppWindow, Layers, Key } from "lucide-react";
import type { Impact, RiskLevel } from "../services/types";
import { cyberSound } from "../utils/cyberSound";

interface BlastRadiusRadarProps {
  subjectName?: string;
  impact: Impact;
  risk?: RiskLevel;
  riskScore?: number;
  delta?: {
    granted?: string[];
    revoked?: string[];
  };
}

export function BlastRadiusRadar({
  subjectName = "Target Identity",
  impact,
  risk = "MEDIUM",
  riskScore = 45,
  delta,
}: BlastRadiusRadarProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Dynamic theme colors
  const riskColor =
    risk === "CRITICAL"
      ? "#EF4444"
      : risk === "HIGH"
      ? "#E8703A"
      : risk === "MEDIUM"
      ? "#F59E0B"
      : "#D4E84A";

  const grantedGroups = delta?.granted || ["Developers", "GitHub-Access", "AWS-Dev"];
  const revokedGroups = delta?.revoked || ["Finance-Ledger-Approver", "AWS-Prod-Admin"];
  const totalEntitlements = grantedGroups.length + revokedGroups.length;

  // Generate orbital nodes around center
  const orbitalNodes = [
    ...grantedGroups.map((g, i) => ({
      id: `grant-${i}`,
      label: g,
      type: "group-grant" as const,
      color: "#D4E84A",
      angle: (i / Math.max(totalEntitlements, 1)) * Math.PI * 2,
      distance: 95 + (i % 2) * 20,
    })),
    ...revokedGroups.map((r, i) => ({
      id: `rev-${i}`,
      label: r,
      type: "group-revoke" as const,
      color: "#E8703A",
      angle: ((i + grantedGroups.length) / Math.max(totalEntitlements, 1)) * Math.PI * 2,
      distance: 125 - (i % 2) * 15,
    })),
  ];

  return (
    <div className="bg-[#121316] rounded-[28px] p-5 sm:p-6 border border-white/10 space-y-4 shadow-2xl relative overflow-hidden card-interactive hover-glow-cyan group">
      {/* Header telemetry info */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-[10px] flex items-center justify-center font-bold text-xs shadow-md"
            style={{ backgroundColor: `${riskColor}20`, color: riskColor }}
          >
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Blast Radius Radar
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8E8E86]">
                LIVE GRAPHICS
              </span>
            </h3>
            <span className="text-[10px] font-mono text-[#8E8E86]">Radial downstream exposure analyzer</span>
          </div>
        </div>

        {/* Dynamic risk score pill */}
        <div
          className="px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
          style={{
            backgroundColor: `${riskColor}15`,
            color: riskColor,
            border: `1px solid ${riskColor}40`,
          }}
        >
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: riskColor }}></span>
          <span>{riskScore}% RISK SCORE</span>
        </div>
      </div>

      {/* Graphical Radar Canvas */}
      <div className="relative w-full h-72 sm:h-80 flex items-center justify-center bg-[#090A0D] bg-dark-grid rounded-[22px] border border-white/10 overflow-hidden shadow-inner">
        {/* Radar Concentric Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full border border-white/10"></div>
          <div className="w-48 h-48 rounded-full border border-white/10"></div>
          <div className="w-72 h-72 rounded-full border border-dashed border-white/15"></div>
          <div className="w-96 h-96 rounded-full border border-white/5"></div>
          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-white/5"></div>
          <div className="absolute h-full w-[1px] bg-white/5"></div>
        </div>

        {/* Rotating Radar Scanline Beam */}
        <div
          className="absolute w-full h-full pointer-events-none origin-center"
          style={{
            animation: "radarSweep 6s linear infinite",
          }}
        >
          <div
            className="w-1/2 h-1/2 absolute right-0 top-0 origin-bottom-left"
            style={{
              background: `conic-gradient(from 0deg at 0% 100%, ${riskColor}30 0deg, transparent 45deg)`,
            }}
          ></div>
        </div>

        {/* Center Target Node */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-mono font-bold text-xs shadow-2xl relative transition-transform group-hover:scale-110"
            style={{
              backgroundColor: "#16171B",
              border: `2px solid ${riskColor}`,
              boxShadow: `0 0 24px ${riskColor}60`,
            }}
          >
            <ShieldAlert className="w-6 h-6" style={{ color: riskColor }} />
            <span
              className="absolute -inset-2 rounded-full animate-ping pointer-events-none opacity-30"
              style={{ border: `1.5px solid ${riskColor}` }}
            ></span>
          </div>
          <div className="mt-1.5 px-2.5 py-0.5 rounded-md bg-black/80 border border-white/15 text-[10px] font-mono font-bold text-white shadow-md">
            {subjectName}
          </div>
        </div>

        {/* Orbital Entitlement Nodes & Beams */}
        {orbitalNodes.map((node) => {
          const cx = Math.cos(node.angle) * node.distance;
          const cy = Math.sin(node.angle) * node.distance;
          const isHovered = hoveredNode === node.id;

          return (
            <div
              key={node.id}
              style={{
                transform: `translate(${cx}px, ${cy}px)`,
              }}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                cyberSound.playHover();
              }}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute z-30 cursor-pointer flex flex-col items-center justify-center transition-all duration-200"
            >
              {/* Node Orb */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 ${
                  isHovered ? "scale-125" : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: "#0E0E11",
                  border: `1.5px solid ${node.color}`,
                  boxShadow: `0 0 14px ${node.color}50`,
                }}
              >
                {node.type === "group-grant" ? (
                  <Zap className="w-3.5 h-3.5" style={{ color: node.color }} />
                ) : (
                  <Key className="w-3.5 h-3.5" style={{ color: node.color }} />
                )}
              </div>

              {/* Hover Tooltip Pill */}
              <div
                className={`absolute -top-7 whitespace-nowrap px-2 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all shadow-lg pointer-events-none ${
                  isHovered
                    ? "opacity-100 scale-100 -translate-y-1 bg-black/90 text-white border border-white/20"
                    : "opacity-0 scale-90"
                }`}
              >
                {node.type === "group-grant" ? "+ " : "- "}
                {node.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5 pt-1 relative z-10 text-xs font-mono">
        <div className="bg-[#18191E] p-3 rounded-[16px] border border-white/10 text-center card-interactive hover-glow-lime">
          <span className="text-[10px] text-[#8E8E86] uppercase block">Groups Delta</span>
          <span className="text-lg font-semibold text-white mt-0.5 block">{impact.groups}</span>
        </div>
        <div className="bg-[#18191E] p-3 rounded-[16px] border border-white/10 text-center card-interactive hover-glow-cyan">
          <span className="text-[10px] text-[#8E8E86] uppercase block">Downstream Apps</span>
          <span className="text-lg font-semibold text-cyan-300 mt-0.5 block">{impact.apps}</span>
        </div>
        <div className="bg-[#18191E] p-3 rounded-[16px] border border-white/10 text-center card-interactive hover-glow-orange">
          <span className="text-[10px] text-[#8E8E86] uppercase block">Privileged Roles</span>
          <span
            className={`text-lg font-semibold mt-0.5 block ${
              impact.privileged > 0 ? "text-[#E8703A]" : "text-[#D4E84A]"
            }`}
          >
            {impact.privileged}
          </span>
        </div>
      </div>
    </div>
  );
}
