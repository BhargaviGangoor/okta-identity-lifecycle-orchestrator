import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  charge: number;
  pulsePhase: number;
}

interface LightningBolt {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  segments: { x: number; y: number }[];
  alpha: number;
  color: string;
  width: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export function ElectricLightningBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    let mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    const handleClick = (e: MouseEvent) => {
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 350,
        alpha: 1.0,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);
    window.addEventListener("click", handleClick);

    const COLORS = ["#D4E84A", "#22D3EE", "#38BDF8", "#E8703A"];
    let nodes: Node[] = [];
    let bolts: LightningBolt[] = [];
    let shockwaves: Shockwave[] = [];

    const initNodes = () => {
      nodes = [];
      const count = Math.min(Math.floor((width * height) / 12000), 75);

      for (let i = 0; i < count; i++) {
        const col = COLORS[Math.floor(Math.random() * COLORS.length)]!;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.9,
          vy: (Math.random() - 0.5) * 0.9,
          radius: Math.random() * 2.5 + 2.0,
          color: col,
          charge: Math.random(),
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    initNodes();

    // Generate jagged electric lightning path
    const createLightningSegments = (x1: number, y1: number, x2: number, y2: number, roughness = 18) => {
      const segs: { x: number; y: number }[] = [{ x: x1, y: y1 }];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(4, Math.floor(dist / 22));

      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const nx = -dy / dist;
        const ny = dx / dist;
        const offset = (Math.random() - 0.5) * roughness * Math.sin(t * Math.PI);
        segs.push({
          x: x1 + dx * t + nx * offset,
          y: y1 + dy * t + ny * offset,
        });
      }
      segs.push({ x: x2, y: y2 });
      return segs;
    };

    const draw = () => {
      // Dark persistence
      ctx.fillStyle = "rgba(8, 9, 12, 0.35)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";

      // 1. Update & Draw Shockwaves
      for (const sw of shockwaves) {
        sw.radius += 8;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 232, 74, ${sw.alpha * 0.6})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Push nodes near shockwave
        for (const n of nodes) {
          const dx = n.x - sw.x;
          const dy = n.y - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - sw.radius) < 40) {
            n.vx += (dx / dist) * 2.5;
            n.vy += (dy / dist) * 2.5;
            n.charge = 1.0;
          }
        }
      }
      shockwaves = shockwaves.filter((sw) => sw.alpha > 0.01);

      // 2. Update Nodes & Spawn Lightning
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!;
        n.charge = Math.min(1.0, n.charge + 0.008);
        n.pulsePhase += 0.03;

        // Repel from mouse or gravitate
        if (mouse.active) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 180) {
            n.vx += (mdx / mdist) * 0.3;
            n.vy += (mdy / mdist) * 0.3;

            // Chance to arc lightning to mouse
            if (n.charge > 0.6 && Math.random() < 0.08 && bolts.length < 20) {
              bolts.push({
                fromX: n.x,
                fromY: n.y,
                toX: mouse.x,
                toY: mouse.y,
                segments: createLightningSegments(n.x, n.y, mouse.x, mouse.y, 35),
                alpha: 1.0,
                color: "#22D3EE",
                width: 2.2,
              });
              n.charge = 0;
            }
          }
        }

        // Friction & integration
        n.vx *= 0.96;
        n.vy *= 0.96;
        n.x += n.vx;
        n.y += n.vy;

        // Screen bounce
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Check proximity with other nodes to spark lightning
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j]!;
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            // Faint plasma bridge
            const bridgeAlpha = (1 - dist / 150) * 0.18;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(212, 232, 74, ${bridgeAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Fire crackling lightning arc when fully charged
            if (n.charge > 0.85 && n2.charge > 0.85 && Math.random() < 0.04 && bolts.length < 18) {
              bolts.push({
                fromX: n.x,
                fromY: n.y,
                toX: n2.x,
                toY: n2.y,
                segments: createLightningSegments(n.x, n.y, n2.x, n2.y, 22),
                alpha: 1.0,
                color: Math.random() > 0.4 ? "#D4E84A" : "#22D3EE",
                width: 1.8,
              });
              n.charge = 0.1;
              n2.charge = 0.1;
            }
          }
        }

        // Draw node with pulsating glow halo
        const pulse = 0.7 + Math.sin(n.pulsePhase) * 0.3;
        const glowR = n.radius * 6 * pulse;
        const nGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        nGrad.addColorStop(0, n.color + "90");
        nGrad.addColorStop(0.5, n.color + "25");
        nGrad.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = nGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      }

      // 3. Draw Lightning Bolts
      for (const b of bolts) {
        b.alpha *= 0.88; // fast discharge fade

        // Outer glow bolt
        ctx.beginPath();
        b.segments.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = b.color === "#22D3EE"
          ? `rgba(34, 211, 238, ${b.alpha * 0.7})`
          : `rgba(212, 232, 74, ${b.alpha * 0.7})`;
        ctx.lineWidth = b.width * 3;
        ctx.stroke();

        // Inner white-hot lightning core
        ctx.beginPath();
        b.segments.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.95})`;
        ctx.lineWidth = b.width;
        ctx.stroke();
      }
      bolts = bolts.filter((b) => b.alpha > 0.02);

      ctx.globalCompositeOperation = "source-over";
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
