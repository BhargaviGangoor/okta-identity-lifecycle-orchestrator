import { useEffect, useRef } from "react";

export type BgMode =
  | "standard"   // home — random drift
  | "converge"   // joiner — nodes pull toward center
  | "dissolve"   // leaver — nodes slowly expand outward
  | "orbital"    // mover — nodes orbit two poles
  | "stream"     // users — nodes drift downward in loose columns
  | "glitch"     // drift — nodes occasionally snap/glitch
  | "rain"       // audit — nodes fall straight down fast
  | "aurora"     // whatif — nodes barely move, aurora shimmer
  | "starfield"; // graph — nodes drift with parallax depth

interface Props {
  accentColor?: string;
  mode?: BgMode;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulsePhase: number;
  depth: number; // 0..1 for parallax/depth
}

interface Packet {
  srcIdx: number;
  dstIdx: number;
  t: number;       // 0..1
  speed: number;
  alpha: number;
}

const CONNECT_DIST = 160;
const BASE_COLOR_HEX = "#08090C";

// Parse "#RRGGBB" → [r, g, b]
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function UnifiedPageBackground({
  accentColor = "#D4E84A",
  mode = "standard",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;
    let frame = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];

    const [ar, ag, ab] = hexToRgb(accentColor);
    const accentRgb = `${ar},${ag},${ab}`;

    // ── mouse interaction ──────────────────────────────────
    let mouse = { x: -9999, y: -9999 };
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };
    window.addEventListener("resize", handleResize);

    // ── node count by mode ─────────────────────────────────
    const nodeCount = () => {
      const area = width * height;
      const base = Math.min(Math.max(Math.floor(area / 9000), 55), 130);
      if (mode === "rain" || mode === "stream") return base * 1.4 | 0;
      if (mode === "starfield") return base * 1.6 | 0;
      return base;
    };

    const initNodes = () => {
      const n = nodeCount();
      nodes = [];
      packets = [];
      for (let i = 0; i < n; i++) {
        const depth = Math.random();
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: depth * 2 + 0.8,
          alpha: depth * 0.5 + 0.15,
          pulsePhase: Math.random() * Math.PI * 2,
          depth,
        });
      }
    };

    initNodes();

    // ── spawn data packets along edges ─────────────────────
    const spawnPackets = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i]!.x - nodes[j]!.x;
          const dy = nodes[i]!.y - nodes[j]!.y;
          if (dx * dx + dy * dy < CONNECT_DIST * CONNECT_DIST) {
            if (Math.random() < 0.0008 && packets.length < 60) {
              packets.push({
                srcIdx: i,
                dstIdx: j,
                t: 0,
                speed: Math.random() * 0.012 + 0.006,
                alpha: Math.random() * 0.7 + 0.3,
              });
            }
          }
        }
      }
    };

    // ── per-mode velocity update ───────────────────────────
    const updateNode = (n: Node) => {
      const cx = width / 2, cy = height / 2;

      switch (mode) {
        case "converge": {
          // pull gently toward center
          const dx = cx - n.x, dy = cy - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          n.vx += (dx / dist) * 0.008;
          n.vy += (dy / dist) * 0.008;
          // respawn when too close
          if (dist < 30) {
            n.x = Math.random() * width;
            n.y = Math.random() * height;
            n.vx = (Math.random() - 0.5) * 0.5;
            n.vy = (Math.random() - 0.5) * 0.5;
          }
          break;
        }
        case "dissolve": {
          // push gently outward from center
          const dx = n.x - cx, dy = n.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          n.vx += (dx / dist) * 0.006;
          n.vy += (dy / dist) * 0.006;
          // respawn near center when they leave
          if (n.x < -40 || n.x > width + 40 || n.y < -40 || n.y > height + 40) {
            n.x = cx + (Math.random() - 0.5) * 60;
            n.y = cy + (Math.random() - 0.5) * 60;
            n.vx = (Math.random() - 0.5) * 0.3;
            n.vy = (Math.random() - 0.5) * 0.3;
          }
          break;
        }
        case "orbital": {
          // orbit around two focal points
          const pole = n.depth > 0.5
            ? { x: width * 0.33, y: cy }
            : { x: width * 0.67, y: cy };
          const dx = pole.x - n.x, dy = pole.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetR = 80 + n.depth * 160;
          const pull = (dist - targetR) * 0.002;
          n.vx += (dx / dist) * pull - (dy / dist) * 0.004;
          n.vy += (dy / dist) * pull + (dx / dist) * 0.004;
          break;
        }
        case "stream": {
          // drift downward at depth-scaled speed
          n.vy += n.depth * 0.015;
          if (n.y > height + 20) { n.y = -20; n.x = Math.random() * width; }
          break;
        }
        case "glitch": {
          // random snap
          if (Math.random() < 0.0015) {
            n.x += (Math.random() - 0.5) * 60;
            n.y += (Math.random() - 0.5) * 30;
          }
          break;
        }
        case "rain": {
          // fast straight fall
          n.vy += 0.05;
          n.vx *= 0.98;
          if (n.y > height + 20) { n.y = -10; n.x = Math.random() * width; n.vy = 0; }
          break;
        }
        case "aurora":
          // almost still, gentle drift
          n.vx *= 0.995;
          n.vy *= 0.995;
          break;
        case "starfield": {
          // slow leftward parallax
          n.vx = -0.15 * n.depth;
          n.vy = 0;
          if (n.x < -10) { n.x = width + 10; n.y = Math.random() * height; }
          break;
        }
        default:
          break;
      }

      // mouse repulsion
      const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 120) {
        const force = (120 - mdist) / 120 * 0.8;
        n.vx += (mdx / mdist) * force;
        n.vy += (mdy / mdist) * force;
      }

      // dampen & integrate
      n.vx *= 0.97;
      n.vy *= 0.97;
      n.x += n.vx;
      n.y += n.vy;

      // wrap (except modes that handle their own wrapping)
      if (!["dissolve", "rain", "stream", "starfield"].includes(mode)) {
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }
    };

    // ── draw ──────────────────────────────────────────────
    const draw = () => {
      frame++;

      ctx.fillStyle = BASE_COLOR_HEX;
      ctx.fillRect(0, 0, width, height);

      // Subtle grid underlay
      ctx.strokeStyle = `rgba(${accentRgb},0.025)`;
      ctx.lineWidth = 1;
      const g = 52;
      for (let x = 0; x < width; x += g) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += g) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Aurora shimmer overlay (all modes get a touch of it)
      const auroraAmt = mode === "aurora" ? 0.07 : 0.025;
      const auroraX = width / 2 + Math.sin(frame * 0.005) * width * 0.2;
      const auroraY = height / 2 + Math.cos(frame * 0.007) * height * 0.15;
      const aGrad = ctx.createRadialGradient(auroraX, auroraY, 0, auroraX, auroraY, width * 0.55);
      aGrad.addColorStop(0, `rgba(${accentRgb},${auroraAmt})`);
      aGrad.addColorStop(0.5, `rgba(${accentRgb},${auroraAmt * 0.3})`);
      aGrad.addColorStop(1, "transparent");
      ctx.fillStyle = aGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw nodes
      for (const n of nodes) {
        n.pulsePhase += 0.018;
        updateNode(n);

        const pulse = 0.7 + Math.sin(n.pulsePhase) * 0.3;
        const a = n.alpha * pulse;

        // Glow halo
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 6);
        halo.addColorStop(0, `rgba(${accentRgb},${a * 0.4})`);
        halo.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 6, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb},${a})`;
        ctx.fill();
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const ni = nodes[i]!, nj = nodes[j]!;
          const dx = ni.x - nj.x, dy = ni.y - nj.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONNECT_DIST * CONNECT_DIST) {
            const lineAlpha = (1 - Math.sqrt(d2) / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(ni.x, ni.y);
            ctx.lineTo(nj.x, nj.y);
            ctx.strokeStyle = `rgba(${accentRgb},${lineAlpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Spawn and draw packets
      spawnPackets();
      packets = packets.filter((p) => p.t <= 1);
      for (const p of packets) {
        const src = nodes[p.srcIdx], dst = nodes[p.dstIdx];
        if (!src || !dst) continue;
        p.t += p.speed;
        const px = src.x + (dst.x - src.x) * p.t;
        const py = src.y + (dst.y - src.y) * p.t;
        const ta = p.alpha * (1 - p.t);

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${ta * 0.9})`;
        ctx.fill();

        // packet glow
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 6);
        pg.addColorStop(0, `rgba(${accentRgb},${ta * 0.6})`);
        pg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [accentColor, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
