import { useState, useMemo, useRef, useEffect } from "react";
import {
  Users,
  Layers,
  AppWindow,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Flame,
  Key,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Activity,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { GraphData, GraphNode, GraphEdge, GraphNodeType } from "../services/types";
import { Link } from "@tanstack/react-router";

interface IdentityGraphCanvasProps {
  data: GraphData;
  loading?: boolean;
  selectedUserId?: string;
  onSelectUser?: (userId: string) => void;
}

export function IdentityGraphCanvas({
  data,
  loading = false,
  selectedUserId: externalSelectedUserId,
  onSelectUser,
}: IdentityGraphCanvasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | GraphNodeType>("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const departments = ["ALL", "Engineering", "Sales", "Finance", "IT", "People Ops", "Legal"];

  // Filter nodes based on user search and department selection
  const { filteredNodes, filteredEdges, userNodes, groupNodes, appNodes } = useMemo(() => {
    let nodes = data.nodes;

    if (selectedType !== "ALL") {
      nodes = nodes.filter((n) => n.type === selectedType);
    }

    if (selectedDept !== "ALL") {
      nodes = nodes.filter(
        (n) => n.type !== "USER" || (n.department && n.department.toLowerCase() === selectedDept.toLowerCase())
      );
    }

    if (highlightCriticalOnly) {
      nodes = nodes.filter(
        (n) => n.type !== "APPLICATION" || n.criticality === "HIGH"
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.id.toLowerCase().includes(q) ||
          (n.role && n.role.toLowerCase().includes(q)) ||
          (n.department && n.department.toLowerCase().includes(q))
      );
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = data.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    const userList = nodes.filter((n) => n.type === "USER");
    const groupList = nodes.filter((n) => n.type === "GROUP");
    const appList = nodes.filter((n) => n.type === "APPLICATION");

    return {
      filteredNodes: nodes,
      filteredEdges: edges,
      userNodes: userList,
      groupNodes: groupList,
      appNodes: appList,
    };
  }, [data, selectedType, selectedDept, highlightCriticalOnly, searchTerm]);

  // Sync external selection
  useEffect(() => {
    if (externalSelectedUserId) {
      const found = data.nodes.find((n) => n.id === externalSelectedUserId);
      if (found) setSelectedNode(found);
    }
  }, [externalSelectedUserId, data.nodes]);

  // Compute 3-column layered coordinates
  const colWidth = 380;
  const startX = 40;
  const startY = 80;
  const rowHeight = 76;
  const nodeCardWidth = 240;

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; column: number }> = {};

    userNodes.forEach((u, i) => {
      positions[u.id] = { x: startX, y: startY + i * rowHeight, column: 0 };
    });

    groupNodes.forEach((g, i) => {
      positions[g.id] = { x: startX + colWidth, y: startY + i * rowHeight, column: 1 };
    });

    appNodes.forEach((a, i) => {
      positions[a.id] = { x: startX + colWidth * 2, y: startY + i * rowHeight, column: 2 };
    });

    return positions;
  }, [userNodes, groupNodes, appNodes]);

  // Determine Blast Radius highlights for the focused node
  const activeFocusNode = hoveredNode || selectedNode;
  const blastRadiusIds = useMemo(() => {
    if (!activeFocusNode) return new Set<string>();

    const activeSet = new Set<string>();
    activeSet.add(activeFocusNode.id);

    if (activeFocusNode.type === "USER") {
      // Downstream: User -> Groups -> Apps
      data.edges
        .filter((e) => e.source === activeFocusNode.id)
        .forEach((e) => {
          activeSet.add(e.target);
          data.edges
            .filter((subE) => subE.source === e.target)
            .forEach((subE) => activeSet.add(subE.target));
        });
    } else if (activeFocusNode.type === "GROUP") {
      // Upstream users and downstream apps
      data.edges
        .filter((e) => e.target === activeFocusNode.id)
        .forEach((e) => activeSet.add(e.source));
      data.edges
        .filter((e) => e.source === activeFocusNode.id)
        .forEach((e) => activeSet.add(e.target));
    } else if (activeFocusNode.type === "APPLICATION") {
      // Upstream: Groups / Users granting this app
      data.edges
        .filter((e) => e.target === activeFocusNode.id)
        .forEach((e) => {
          activeSet.add(e.source);
          data.edges
            .filter((subE) => subE.target === e.source)
            .forEach((subE) => activeSet.add(subE.source));
        });
    }

    return activeSet;
  }, [activeFocusNode, data.edges]);

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof SVGElement && e.target.tagName === "svg") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const maxRows = Math.max(userNodes.length, groupNodes.length, appNodes.length, 6);
  const canvasWidth = 1000;
  const canvasHeight = Math.max(650, maxRows * 76 + 100);

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#141414] p-4 rounded-[20px] border border-white/10 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-[12px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Identities</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{data.metrics.totalUsers}</div>
          </div>
        </div>

        <div className="bg-[#141414] p-4 rounded-[20px] border border-white/10 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-[12px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Okta Groups</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{data.metrics.totalGroups}</div>
          </div>
        </div>

        <div className="bg-[#141414] p-4 rounded-[20px] border border-white/10 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-[12px] bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
            <AppWindow className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Applications</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{data.metrics.totalApplications}</div>
          </div>
        </div>

        <div className="bg-[#141414] p-4 rounded-[20px] border border-white/10 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-[12px] bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Critical Apps</div>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">{data.metrics.highCriticalityApps}</div>
          </div>
        </div>

        <div className="bg-[#141414] p-4 rounded-[20px] border border-white/10 flex items-center gap-3 shadow-md col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-[12px] bg-[#D4E84A]/10 text-[#D4E84A] border border-[#D4E84A]/20 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Graph Edges</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{data.metrics.totalEdges}</div>
          </div>
        </div>
      </div>

      {/* Canvas Controls Toolbar */}
      <div className="bg-[#1b1b1b] p-3 sm:p-4 rounded-[24px] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-[#8A8A82] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search identity, group, app..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] text-white pl-10 pr-4 py-2 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] placeholder-[#8A8A82]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {/* Node Type Pills */}
          <div className="flex items-center bg-[#141414] p-1 rounded-full border border-white/10">
            {(["ALL", "USER", "GROUP", "APPLICATION"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase transition-colors ${
                  selectedType === t
                    ? "bg-[#D4E84A] text-[#141414] font-bold"
                    : "text-[#8A8A82] hover:text-white"
                }`}
              >
                {t === "APPLICATION" ? "APPS" : t}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#141414] text-white px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 focus:outline-none focus:border-[#D4E84A]"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === "ALL" ? "All Departments" : d}
              </option>
            ))}
          </select>

          {/* Critical Toggle */}
          <button
            onClick={() => setHighlightCriticalOnly(!highlightCriticalOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 border transition-colors ${
              highlightCriticalOnly
                ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                : "bg-[#141414] border-white/10 text-[#8A8A82] hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>High Criticality</span>
          </button>
        </div>

        {/* Zoom & Canvas Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="w-8 h-8 rounded-full bg-[#141414] hover:bg-neutral-800 border border-white/10 flex items-center justify-center text-[#8A8A82] hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="w-8 h-8 rounded-full bg-[#141414] hover:bg-neutral-800 border border-white/10 flex items-center justify-center text-[#8A8A82] hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 rounded-full bg-[#141414] hover:bg-neutral-800 border border-white/10 flex items-center justify-center text-[#8A8A82] hover:text-white"
            title="Reset Canvas View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Graph Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative bg-[#0E0E10] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl min-h-[620px] cursor-grab active:cursor-grabbing"
      >
        {/* Tier Column Headers Overlay */}
        <div className="absolute top-4 left-6 right-6 z-10 grid grid-cols-3 pointer-events-none text-center">
          <div className="bg-[#141414]/80 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 mx-auto max-w-[200px] w-full">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
              01 · Authoritative Identities ({userNodes.length})
            </span>
          </div>
          <div className="bg-[#141414]/80 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 mx-auto max-w-[200px] w-full">
            <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
              02 · Okta Groups ({groupNodes.length})
            </span>
          </div>
          <div className="bg-[#141414]/80 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 mx-auto max-w-[200px] w-full">
            <span className="text-[10px] font-mono uppercase font-bold text-purple-400 tracking-wider">
              03 · Target SSO Apps ({appNodes.length})
            </span>
          </div>
        </div>

        {/* SVG Graph Viewport */}
        <svg
          width="100%"
          height={canvasHeight}
          className="w-full h-full block"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
        >
          <defs>
            {/* Edge Gradients */}
            <linearGradient id="edge-user-group" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="edge-group-app" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="edge-active-blast" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4E84A" stopOpacity="1" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
            </linearGradient>

            {/* Glowing drop shadow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Edges (Curved Bezier Paths) */}
          <g className="edges">
            {filteredEdges.map((edge) => {
              const srcPos = nodePositions[edge.source];
              const tgtPos = nodePositions[edge.target];
              if (!srcPos || !tgtPos) return null;

              const isEdgeHighlighted =
                blastRadiusIds.has(edge.source) && blastRadiusIds.has(edge.target);

              // Source box right edge to Target box left edge
              const x1 = srcPos.x + 240;
              const y1 = srcPos.y + 24;
              const x2 = tgtPos.x;
              const y2 = tgtPos.y + 24;
              const dx = (x2 - x1) / 2;

              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  key={edge.id}
                  d={pathD}
                  fill="none"
                  stroke={
                    isEdgeHighlighted
                      ? "url(#edge-active-blast)"
                      : activeFocusNode
                      ? "rgba(255, 255, 255, 0.05)"
                      : edge.relationship === "MEMBER_OF"
                      ? "url(#edge-user-group)"
                      : "url(#edge-group-app)"
                  }
                  strokeWidth={isEdgeHighlighted ? 2.8 : 1.2}
                  strokeDasharray={edge.relationship === "DIRECT_ACCESS" ? "4 4" : "none"}
                  filter={isEdgeHighlighted ? "url(#glow)" : undefined}
                  className="transition-all duration-300"
                />
              );
            })}
          </g>

          {/* Render Nodes */}
          <g className="nodes">
            {filteredNodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const inBlastRadius = blastRadiusIds.has(node.id);
              const isDimmed = activeFocusNode && !inBlastRadius;

              // Node Box Dimensions
              const width = 240;
              const height = 48;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => {
                    setSelectedNode(node);
                    if (node.type === "USER" && onSelectUser) {
                      onSelectUser(node.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer group transition-transform duration-150"
                  style={{
                    opacity: isDimmed ? 0.2 : 1,
                    transition: "opacity 0.2s ease, transform 0.15s ease",
                  }}
                >
                  {/* Outer glow on select/blast */}
                  {(isSelected || (inBlastRadius && activeFocusNode?.id !== node.id)) && (
                    <rect
                      x={-3}
                      y={-3}
                      width={width + 6}
                      height={height + 6}
                      rx={16}
                      fill="none"
                      stroke={isSelected ? "#D4E84A" : "#F59E0B"}
                      strokeWidth={1.5}
                      strokeDasharray={isSelected ? "none" : "3 3"}
                    />
                  )}

                  {/* Card Background */}
                  <rect
                    width={width}
                    height={height}
                    rx={14}
                    fill={isSelected ? "#1F1F23" : "#141416"}
                    stroke={
                      isSelected
                        ? "#D4E84A"
                        : isHovered
                        ? "rgba(255,255,255,0.4)"
                        : node.type === "APPLICATION" && node.criticality === "HIGH"
                        ? "rgba(245, 158, 11, 0.4)"
                        : "rgba(255,255,255,0.12)"
                    }
                    strokeWidth={1}
                    className="transition-colors duration-150"
                  />

                  {/* Type Icon Indicator */}
                  <g transform="translate(10, 10)">
                    <rect
                      width={28}
                      height={28}
                      rx={8}
                      fill={
                        node.type === "USER"
                          ? "rgba(16, 185, 129, 0.15)"
                          : node.type === "GROUP"
                          ? "rgba(6, 182, 212, 0.15)"
                          : node.criticality === "HIGH"
                          ? "rgba(245, 158, 11, 0.2)"
                          : "rgba(168, 85, 247, 0.15)"
                      }
                    />
                    <circle
                      cx={14}
                      cy={14}
                      r={4}
                      fill={
                        node.type === "USER"
                          ? "#10B981"
                          : node.type === "GROUP"
                          ? "#06B6D4"
                          : node.criticality === "HIGH"
                          ? "#F59E0B"
                          : "#A855F7"
                      }
                    />
                  </g>

                  {/* Node Label & Subtitle */}
                  <text
                    x={46}
                    y={20}
                    fill="#FFFFFF"
                    fontSize={11}
                    fontWeight="bold"
                    fontFamily="inherit"
                    className="select-none"
                  >
                    {node.label.length > 20 ? node.label.slice(0, 19) + "…" : node.label}
                  </text>
                  <text
                    x={46}
                    y={34}
                    fill="#8A8A82"
                    fontSize={9}
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {node.type === "USER"
                      ? `${node.department} · ${node.role || "User"}`.slice(0, 24)
                      : node.type === "GROUP"
                      ? "Okta Group"
                      : `Criticality: ${node.criticality || "MEDIUM"}`}
                  </text>

                  {/* Risk Score Pill if user or critical app */}
                  {node.type === "USER" && (
                    <g transform={`translate(${width - 32}, 16)`}>
                      <circle
                        cx={8}
                        cy={8}
                        r={8}
                        fill={node.riskScore && node.riskScore > 50 ? "#E8703A" : "rgba(255,255,255,0.08)"}
                      />
                      <text
                        x={8}
                        y={11}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={8}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.riskScore}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Empty Canvas Notice */}
        {filteredNodes.length === 0 && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <Filter className="w-8 h-8 text-[#8A8A82] mb-2" />
            <h3 className="text-white font-bold text-sm">No Graph Nodes Match Filter</h3>
            <p className="text-xs text-[#8A8A82] mt-1 max-w-sm">
              Try adjusting your department, search query, or criticality filters.
            </p>
            <button
              onClick={resetView}
              className="mt-3 px-4 py-1.5 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white text-xs font-mono border border-white/10"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Selected Node Deep-Dive Inspector Panel */}
      {selectedNode && (
        <div className="bg-[#141414] rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-2 duration-150 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-xs ${
                  selectedNode.type === "USER"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : selectedNode.type === "GROUP"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}
              >
                {selectedNode.type === "USER" ? (
                  <Users className="w-5 h-5" />
                ) : selectedNode.type === "GROUP" ? (
                  <Layers className="w-5 h-5" />
                ) : (
                  <AppWindow className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-[#D4E84A] border border-white/10">
                    {selectedNode.type} NODE
                  </span>
                  <span className="text-xs font-mono text-[#8A8A82]">{selectedNode.id}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white mt-0.5">{selectedNode.label}</h3>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="w-7 h-7 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 flex items-center justify-center text-[#8A8A82] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Node Metadata & Blast Radius Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#8A8A82]">Organizational Unit</span>
              <p className="text-sm font-bold text-white">{selectedNode.department || "Enterprise"}</p>
              <p className="text-xs text-[#8A8A82]">{selectedNode.role || "Asset"}</p>
            </div>

            <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#8A8A82]">Risk & Security Tier</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    selectedNode.riskScore && selectedNode.riskScore > 50 ? "text-[#E8703A]" : "text-[#D4E84A]"
                  }`}
                >
                  Score: {selectedNode.riskScore || 20}/100
                </span>
                {selectedNode.criticality && selectedNode.criticality !== "NONE" && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
                    {selectedNode.criticality} CRITICAL
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8A82]">Status: {selectedNode.status || "ACTIVE"}</p>
            </div>

            <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#8A8A82]">Active Blast Radius</span>
              <p className="text-sm font-semibold text-white">{blastRadiusIds.size - 1} Connected Entities</p>
              <p className="text-xs text-[#8A8A82]">Direct & transitive entitlements in scope</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs font-mono text-[#8A8A82]">
              Tip: Hovering or selecting any node isolates its complete blast radius path.
            </div>

            <div className="flex items-center gap-2">
              {selectedNode.type === "USER" && (
                <Link
                  to="/whatif"
                  className="px-4 py-2 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SIMULATE WHAT-IF</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
