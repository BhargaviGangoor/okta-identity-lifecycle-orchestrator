import { useEffect, useRef } from "react";

interface Vertex3D {
  x: number;
  y: number;
  z: number;
}

interface IngestShard {
  x: number;
  y: number;
  z: number;
  targetIdx: number;
  t: number;
  speed: number;
  color: string;
}

export function WireframeConstructorBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Golden ratio for icosahedron
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVertices: Vertex3D[] = [
      { x: -1, y: phi, z: 0 }, { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 }, { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi }, { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi }, { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 }, { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 }, { x: -phi, y: 0, z: 1 },
    ];

    // Edges connecting vertices if distance matches icosahedron edge
    const edges: [number, number][] = [];
    const edgeDistSq = 4; // roughly 2^2
    for (let i = 0; i < baseVertices.length; i++) {
      for (let j = i + 1; j < baseVertices.length; j++) {
        const dx = baseVertices[i]!.x - baseVertices[j]!.x;
        const dy = baseVertices[i]!.y - baseVertices[j]!.y;
        const dz = baseVertices[i]!.z - baseVertices[j]!.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (Math.abs(distSq - edgeDistSq) < 0.2) {
          edges.push([i, j]);
        }
      }
    }

    // Ingesting shards
    let shards: IngestShard[] = [];
    const spawnShard = () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.min(width, height) * (0.6 + Math.random() * 0.4);
      shards.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: (Math.random() - 0.5) * 400,
        targetIdx: Math.floor(Math.random() * baseVertices.length),
        t: 0,
        speed: Math.random() * 0.015 + 0.008,
        color: Math.random() > 0.35 ? "#D4E84A" : "#22D3EE",
      });
    };

    for (let i = 0; i < 18; i++) spawnShard();

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      rotX += 0.004;
      rotY += 0.006;
      rotZ += 0.002;

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.16;

      // 3D rotation math
      const projVertices = baseVertices.map((v) => {
        // Rotate Y
        let x1 = v.x * Math.cos(rotY) + v.z * Math.sin(rotY);
        let y1 = v.y;
        let z1 = -v.x * Math.sin(rotY) + v.z * Math.cos(rotY);

        // Rotate X
        let x2 = x1;
        let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

        // Rotate Z
        let x3 = x2 * Math.cos(rotZ) - y2 * Math.sin(rotZ);
        let y3 = x2 * Math.sin(rotZ) + y2 * Math.cos(rotZ);
        let z3 = z2;

        const fov = 4;
        const depth = fov / (fov + z3);
        return {
          sx: cx + x3 * scale * depth,
          sy: cy + y3 * scale * depth,
          depth,
          rawX: x3 * scale,
          rawY: y3 * scale,
          rawZ: z3 * scale,
        };
      });

      // 1. Draw central energy core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.4);
      coreGrad.addColorStop(0, "rgba(212, 232, 74, 0.09)");
      coreGrad.addColorStop(0.5, "rgba(34, 211, 238, 0.04)");
      coreGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // 2. Draw wireframe edges
      for (const [i, j] of edges) {
        const v1 = projVertices[i]!;
        const v2 = projVertices[j]!;
        const avgDepth = (v1.depth + v2.depth) / 2;
        const edgeAlpha = Math.max(0.08, Math.min(0.45, (avgDepth - 0.6) * 0.7));

        ctx.beginPath();
        ctx.moveTo(v1.sx, v1.sy);
        ctx.lineTo(v2.sx, v2.sy);
        ctx.strokeStyle = `rgba(212, 232, 74, ${edgeAlpha})`;
        ctx.lineWidth = avgDepth * 1.4;
        ctx.stroke();
      }

      // 3. Draw vertices
      projVertices.forEach((v, idx) => {
        const alpha = Math.max(0.2, Math.min(0.9, (v.depth - 0.5) * 1.2));
        ctx.beginPath();
        ctx.arc(v.sx, v.sy, 3.5 * v.depth, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? `rgba(212, 232, 74, ${alpha})` : `rgba(34, 211, 238, ${alpha})`;
        ctx.fill();

        // Vertex glow
        const vg = ctx.createRadialGradient(v.sx, v.sy, 0, v.sx, v.sy, 12 * v.depth);
        vg.addColorStop(0, `rgba(212, 232, 74, ${alpha * 0.4})`);
        vg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(v.sx, v.sy, 12 * v.depth, 0, Math.PI * 2);
        ctx.fillStyle = vg;
        ctx.fill();
      });

      // 4. Update & draw ingesting shards
      if (shards.length < 24 && Math.random() < 0.08) {
        spawnShard();
      }

      shards = shards.filter((s) => s.t < 1);
      for (const s of shards) {
        s.t += s.speed;
        const target = projVertices[s.targetIdx]!;
        const startX = cx + s.x;
        const startY = cy + s.y;

        const curX = startX + (target.sx - startX) * s.t;
        const curY = startY + (target.sy - startY) * s.t;

        const shardAlpha = (1 - s.t) * 0.6 + 0.2;

        // Assembly guide laser
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(target.sx, target.sy);
        ctx.strokeStyle = s.color === "#22D3EE"
          ? `rgba(34, 211, 238, ${(1 - s.t) * 0.12})`
          : `rgba(212, 232, 74, ${(1 - s.t) * 0.12})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Shard particle
        ctx.beginPath();
        ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = s.color === "#22D3EE"
          ? `rgba(34, 211, 238, ${shardAlpha})`
          : `rgba(212, 232, 74, ${shardAlpha})`;
        ctx.fill();
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
