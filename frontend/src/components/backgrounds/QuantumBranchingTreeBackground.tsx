import { useEffect, useRef } from "react";

interface BranchNode {
  x: number;
  y: number;
  parentIdx: number | null;
  depth: number;
  color: string;
  result: "safe" | "impact" | "evaluating";
  pulseAlpha: number;
}

interface PulseSignal {
  fromNode: number;
  toNode: number;
  t: number;
  speed: number;
  color: string;
}

export function QuantumBranchingTreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initTree();
    };
    window.addEventListener("resize", handleResize);

    let nodes: BranchNode[] = [];
    let pulses: PulseSignal[] = [];

    const initTree = () => {
      nodes = [];
      pulses = [];

      // Root node at top-left/center
      const rootX = width * 0.2;
      const rootY = height * 0.5;
      nodes.push({
        x: rootX,
        y: rootY,
        parentIdx: null,
        depth: 0,
        color: "#D4E84A",
        result: "safe",
        pulseAlpha: 1.0,
      });

      // Generate 4 layers of branching
      let currentLayer = [0];
      const maxLayers = 4;

      for (let layer = 1; layer <= maxLayers; layer++) {
        const nextLayer: number[] = [];
        const layerX = rootX + (layer / maxLayers) * (width * 0.65);

        for (const parentId of currentLayer) {
          const p = nodes[parentId]!;
          const branchCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 branches
          const spreadY = (height * 0.7) / (currentLayer.length * branchCount);

          for (let b = 0; b < branchCount; b++) {
            const ny = p.y + (b - (branchCount - 1) / 2) * spreadY * 1.1 + (Math.random() - 0.5) * 40;
            const isLeaf = layer === maxLayers;
            const res = isLeaf ? (Math.random() > 0.6 ? "impact" : "safe") : "evaluating";
            const col = res === "impact" ? "#E8703A" : res === "safe" ? "#D4E84A" : "#22D3EE";

            const idx = nodes.length;
            nodes.push({
              x: layerX + (Math.random() - 0.5) * 30,
              y: Math.max(60, Math.min(height - 60, ny)),
              parentIdx: parentId,
              depth: layer,
              color: col,
              result: res,
              pulseAlpha: 0.2,
            });
            nextLayer.push(idx);
          }
        }
        currentLayer = nextLayer;
      }
    };

    initTree();

    const spawnPulse = () => {
      // Find a random branch with parent
      const eligible = nodes.filter((n) => n.parentIdx !== null);
      if (eligible.length === 0) return;
      const target = eligible[Math.floor(Math.random() * eligible.length)]!;
      const targetIdx = nodes.indexOf(target);

      pulses.push({
        fromNode: target.parentIdx!,
        toNode: targetIdx,
        t: 0,
        speed: Math.random() * 0.02 + 0.015,
        color: target.color,
      });
    };

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      // 1. Soft cyber aurora background
      const aGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.6);
      aGrad.addColorStop(0, "rgba(34, 211, 238, 0.04)");
      aGrad.addColorStop(0.5, "rgba(212, 232, 74, 0.02)");
      aGrad.addColorStop(1, "transparent");
      ctx.fillStyle = aGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Branch Pathways
      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i]!;
        const p = nodes[n.parentIdx!]!;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        // Smooth bezier elbow
        const midX = (p.x + n.x) / 2;
        ctx.bezierCurveTo(midX, p.y, midX, n.y, n.x, n.y);
        ctx.strokeStyle = n.color === "#E8703A"
          ? "rgba(232, 112, 58, 0.12)"
          : n.color === "#22D3EE"
          ? "rgba(34, 211, 238, 0.10)"
          : "rgba(212, 232, 74, 0.10)";
        ctx.lineWidth = Math.max(1, 3.5 - n.depth * 0.6);
        ctx.stroke();
      }

      // 3. Update & Draw Pulses
      if (Math.random() < 0.15 && pulses.length < 25) {
        spawnPulse();
      }

      pulses = pulses.filter((p) => p.t <= 1);
      for (const pl of pulses) {
        pl.t += pl.speed;
        const from = nodes[pl.fromNode]!;
        const to = nodes[pl.toNode]!;

        const t = pl.t;
        const midX = (from.x + to.x) / 2;
        // Bezier interpolation
        const cx = (1 - t) ** 3 * from.x + 3 * (1 - t) ** 2 * t * midX + 3 * (1 - t) * t ** 2 * midX + t ** 3 * to.x;
        const cy = (1 - t) ** 3 * from.y + 3 * (1 - t) ** 2 * t * from.y + 3 * (1 - t) * t ** 2 * to.y + t ** 3 * to.y;

        // Pulse glow
        const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
        pg.addColorStop(0, pl.color);
        pg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        // Trigger arrival flash
        if (pl.t >= 0.95) {
          to.pulseAlpha = 1.0;
        }
      }

      // 4. Draw Nodes
      for (const n of nodes) {
        if (n.pulseAlpha > 0.2) n.pulseAlpha *= 0.96;

        const isLeaf = n.result !== "evaluating";
        const r = isLeaf ? 5.5 : 3.5;

        // Halo
        const nh = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16);
        nh.addColorStop(0, n.color === "#E8703A" ? `rgba(232, 112, 58, ${n.pulseAlpha * 0.6})` : `rgba(212, 232, 74, ${n.pulseAlpha * 0.6})`);
        nh.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = nh;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Leaf result tag
        if (isLeaf) {
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = n.color === "#E8703A" ? "rgba(232, 112, 58, 0.7)" : "rgba(212, 232, 74, 0.7)";
          ctx.fillText(n.result === "impact" ? "RISK:FLAG" : "PATH:SAFE", n.x + 10, n.y + 3);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
