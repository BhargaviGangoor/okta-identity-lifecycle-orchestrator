import { useEffect, useRef } from "react";

interface ConduitParticle {
  t: number;
  speed: number;
  curveOffset: number;
  size: number;
  alpha: number;
  color: string;
}

interface VortexRingParticle {
  angle: number;
  speed: number;
  radius: number;
  size: number;
  alpha: number;
}

export function DualVortexConduitBackground() {
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
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    let conduitParticles: ConduitParticle[] = [];
    let leftVortexParticles: VortexRingParticle[] = [];
    let rightVortexParticles: VortexRingParticle[] = [];

    const initParticles = () => {
      conduitParticles = [];
      for (let i = 0; i < 45; i++) {
        conduitParticles.push({
          t: Math.random(),
          speed: Math.random() * 0.006 + 0.003,
          curveOffset: (Math.random() - 0.5) * 140,
          size: Math.random() * 2 + 1.2,
          alpha: Math.random() * 0.7 + 0.3,
          color: Math.random() > 0.5 ? "#E8703A" : "#D4E84A",
        });
      }

      leftVortexParticles = [];
      rightVortexParticles = [];
      const baseR = Math.min(width, height) * 0.16;

      for (let i = 0; i < 35; i++) {
        leftVortexParticles.push({
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.008,
          radius: baseR * (0.4 + Math.random() * 0.7),
          size: Math.random() * 2.2 + 1,
          alpha: Math.random() * 0.6 + 0.2,
        });
        rightVortexParticles.push({
          angle: Math.random() * Math.PI * 2,
          speed: -(Math.random() * 0.015 + 0.008),
          radius: baseR * (0.4 + Math.random() * 0.7),
          size: Math.random() * 2.2 + 1,
          alpha: Math.random() * 0.6 + 0.2,
        });
      }
    };

    initParticles();

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      const leftX = width * 0.25;
      const rightX = width * 0.75;
      const centerY = height * 0.5;
      const vRadius = Math.min(width, height) * 0.16;

      // 1. Draw connecting flux streamlines (Bezier conduit)
      const fluxLines = 7;
      for (let i = 0; i < fluxLines; i++) {
        const offset = ((i - (fluxLines - 1) / 2) / fluxLines) * 100;
        const midY = centerY + offset * 1.5;
        const midX = (leftX + rightX) / 2;

        ctx.beginPath();
        ctx.moveTo(leftX, centerY);
        ctx.bezierCurveTo(leftX + (rightX - leftX) * 0.3, centerY + offset, midX, midY, rightX, centerY);
        ctx.strokeStyle = i % 2 === 0 ? "rgba(212, 232, 74, 0.06)" : "rgba(232, 112, 58, 0.05)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 2. Draw left & right vortex glows and rings
      const drawVortex = (cx: number, cy: number, colorHex: string, label: string) => {
        // Core glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vRadius * 1.3);
        grad.addColorStop(0, colorHex === "#E8703A" ? "rgba(232, 112, 58, 0.14)" : "rgba(34, 211, 238, 0.14)");
        grad.addColorStop(0.5, "rgba(212, 232, 74, 0.03)");
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(cx, cy, vRadius * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Concentric geometric rings
        [0.4, 0.7, 1.0].forEach((ratio) => {
          ctx.beginPath();
          ctx.arc(cx, cy, vRadius * ratio, 0, Math.PI * 2);
          ctx.strokeStyle = colorHex === "#E8703A" ? "rgba(232, 112, 58, 0.12)" : "rgba(34, 211, 238, 0.12)";
          ctx.lineWidth = 1;
          ctx.setLineDash(ratio === 0.7 ? [4, 6] : []);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Vortex Label
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = "center";
        ctx.fillText(label, cx, cy + vRadius + 22);
      };

      drawVortex(leftX, centerY, "#E8703A", "SRC: DEPT_LEGACY");
      drawVortex(rightX, centerY, "#22D3EE", "DST: DEPT_TARGET");
      ctx.textAlign = "start";

      // 3. Animate vortex particles
      const drawRingParticles = (particles: VortexRingParticle[], cx: number, cy: number, color: string) => {
        for (const p of particles) {
          p.angle += p.speed;
          const px = cx + Math.cos(p.angle) * p.radius;
          const py = cy + Math.sin(p.angle) * (p.radius * 0.85); // slight perspective flattening

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
          ctx.fill();
        }
      };

      drawRingParticles(leftVortexParticles, leftX, centerY, "#E8703A");
      drawRingParticles(rightVortexParticles, rightX, centerY, "#22D3EE");

      // 4. Animate conduit transfer particles
      for (const cp of conduitParticles) {
        cp.t += cp.speed;
        if (cp.t > 1) {
          cp.t = 0;
          cp.curveOffset = (Math.random() - 0.5) * 140;
          cp.speed = Math.random() * 0.006 + 0.003;
        }

        // Cubic Bezier interpolation: P0(leftX, centerY), P1, P2, P3(rightX, centerY)
        const t = cp.t;
        const p0x = leftX, p0y = centerY;
        const p1x = leftX + (rightX - leftX) * 0.35, p1y = centerY + cp.curveOffset;
        const p2x = leftX + (rightX - leftX) * 0.65, p2y = centerY + cp.curveOffset * 0.6;
        const p3x = rightX, p3y = centerY;

        const cx = (1 - t) ** 3 * p0x + 3 * (1 - t) ** 2 * t * p1x + 3 * (1 - t) * t ** 2 * p2x + t ** 3 * p3x;
        const cy = (1 - t) ** 3 * p0y + 3 * (1 - t) ** 2 * t * p1y + 3 * (1 - t) * t ** 2 * p2y + t ** 3 * p3y;

        // Transition color from amber/orange to cyan/lime along the conduit
        const currentAlpha = Math.sin(t * Math.PI) * cp.alpha;
        const color = t < 0.35 ? "#E8703A" : t < 0.65 ? "#D4E84A" : "#22D3EE";

        // Particle glow
        const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
        pg.addColorStop(0, color + Math.floor(currentAlpha * 200).toString(16).padStart(2, "0"));
        pg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        // Particle Core
        ctx.beginPath();
        ctx.arc(cx, cy, cp.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
      }

      // 5. Central Gate Reticle
      const midX = (leftX + rightX) / 2;
      ctx.beginPath();
      ctx.arc(midX, centerY, 12, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(212, 232, 74, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(midX, centerY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#D4E84A";
      ctx.fill();

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
