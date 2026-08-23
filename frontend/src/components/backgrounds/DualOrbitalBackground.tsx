import { useEffect, useRef } from "react";

interface OrbitalParticle {
  angle: number;
  speed: number;
  radius: number;
  size: number;
  alpha: number;
  ring: 0 | 1;
}

interface StreamParticle {
  t: number;  // 0..1 along the path
  speed: number;
  alpha: number;
  size: number;
}

export function DualOrbitalBackground() {
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

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const COLORS = ["#D4E84A", "#22D3EE"];

    // Two orbital rings, offset positions
    const centers = [
      { x: () => width * 0.3, y: () => height * 0.5 },
      { x: () => width * 0.7, y: () => height * 0.5 },
    ];
    const ringRadius = () => Math.min(width, height) * 0.18;

    // Orbital particles on each ring
    const orbitals: OrbitalParticle[] = [];
    for (let ring = 0; ring < 2; ring++) {
      for (let i = 0; i < 28; i++) {
        orbitals.push({
          angle: (i / 28) * Math.PI * 2,
          speed: (Math.random() * 0.003 + 0.002) * (ring === 0 ? 1 : -1),
          radius: ringRadius() + (Math.random() - 0.5) * 16,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.6 + 0.3,
          ring: ring as 0 | 1,
        });
      }
    }

    // Stream particles traveling from ring 0 center to ring 1 center
    const streams: StreamParticle[] = [];
    for (let i = 0; i < 20; i++) {
      streams.push({ t: Math.random(), speed: Math.random() * 0.003 + 0.001, alpha: Math.random() * 0.7 + 0.2, size: Math.random() * 2 + 1 });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      const rr = ringRadius();

      // Draw ring outlines
      for (let r = 0; r < 2; r++) {
        const cx = centers[r]!.x();
        const cy = centers[r]!.y();

        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `${COLORS[r]}18`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Second faint ring
        ctx.beginPath();
        ctx.arc(cx, cy, rr * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `${COLORS[r]}10`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Center core glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr * 0.3);
        grad.addColorStop(0, `${COLORS[r]}20`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(cx, cy, rr * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw orbital particles
      for (const p of orbitals) {
        p.angle += p.speed;
        const cx = centers[p.ring]!.x();
        const cy = centers[p.ring]!.y();
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[p.ring]! + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }

      // Draw stream particles between the two centers
      const x0 = centers[0]!.x(), y0 = centers[0]!.y();
      const x1 = centers[1]!.x(), y1 = centers[1]!.y();

      // Draw the connection line
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();

      for (const s of streams) {
        s.t += s.speed;
        if (s.t > 1) s.t = 0;

        const px = x0 + (x1 - x0) * s.t;
        const py = y0 + (y1 - y0) * s.t;

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);

        // Color transitions from lime to cyan along the path
        const ratio = s.t;
        const alpha = Math.floor(s.alpha * 255).toString(16).padStart(2, "0");
        ctx.fillStyle = ratio < 0.5 ? `#D4E84A${alpha}` : `#22D3EE${alpha}`;
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
      style={{ opacity: 0.6 }}
    />
  );
}
