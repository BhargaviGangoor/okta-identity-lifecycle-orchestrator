import { useEffect, useRef } from "react";

interface ShatterShard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  size: number;
  alpha: number;
  color: string;
  points: [number, number][];
}

export function QuantumDisintegrationBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    let cycleTimer = 0;
    let state: "assembling" | "holding" | "shattering" = "holding";
    let stateProgress = 0; // 0..1

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let shards: ShatterShard[] = [];

    const triggerShatter = () => {
      const cx = width / 2;
      const cy = height / 2;
      shards = [];
      const shardCount = 80;

      for (let i = 0; i < shardCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.2;
        const color = Math.random() > 0.6 ? "#E8703A" : Math.random() > 0.4 ? "#D4E84A" : "rgba(255, 255, 255, 0.9)";
        
        // Micro-polygon points
        const sz = Math.random() * 8 + 4;
        const pts: [number, number][] = [
          [-sz * (Math.random() * 0.5 + 0.5), -sz * (Math.random() * 0.5 + 0.5)],
          [sz * (Math.random() * 0.5 + 0.5), -sz * (Math.random() * 0.3 + 0.3)],
          [sz * (Math.random() * 0.4 + 0.2), sz * (Math.random() * 0.5 + 0.5)],
          [-sz * (Math.random() * 0.3 + 0.2), sz * (Math.random() * 0.5 + 0.3)],
        ];

        shards.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
          size: sz,
          alpha: 1.0,
          color,
          points: pts,
        });
      }
    };

    const drawShield = (cx: number, cy: number, scale: number, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Shield Path
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(50, -35);
      ctx.lineTo(45, 25);
      ctx.lineTo(0, 65);
      ctx.lineTo(-45, 25);
      ctx.lineTo(-50, -35);
      ctx.closePath();

      // Glow fill
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
      grad.addColorStop(0, `rgba(232, 112, 58, ${alpha * 0.15})`);
      grad.addColorStop(0.6, `rgba(212, 232, 74, ${alpha * 0.05})`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fill();

      // Outer outline
      ctx.strokeStyle = `rgba(232, 112, 58, ${alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner lock emblem
      ctx.beginPath();
      ctx.arc(0, -5, 12, Math.PI, 0, false);
      ctx.lineTo(12, 12);
      ctx.lineTo(-12, 12);
      ctx.closePath();
      ctx.strokeStyle = `rgba(212, 232, 74, ${alpha * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    };

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      cycleTimer++;

      // State machine: HOLD (120 frames) -> SHATTER (140 frames) -> ASSEMBLE (90 frames)
      if (state === "holding") {
        stateProgress = Math.min(1, stateProgress + 0.02);
        drawShield(cx, cy, 1.0, stateProgress);

        // Subtly vibrating charge-up
        if (cycleTimer % 180 === 0) {
          state = "shattering";
          triggerShatter();
          stateProgress = 0;
        }
      } else if (state === "shattering") {
        // Render fading shards
        for (const s of shards) {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.985;
          s.vy *= 0.985;
          s.rot += s.rotSpeed;
          s.alpha *= 0.975;

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);

          ctx.beginPath();
          s.points.forEach(([px, py], idx) => {
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();

          ctx.fillStyle = s.color.startsWith("#")
            ? s.color + Math.floor(s.alpha * 255).toString(16).padStart(2, "0")
            : s.color;
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          ctx.restore();
        }

        // Dissolve Shockwave ring
        stateProgress += 0.012;
        const ringR = stateProgress * (Math.min(width, height) * 0.5);
        const ringA = Math.max(0, 1 - stateProgress) * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(232, 112, 58, ${ringA})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (shards.every((s) => s.alpha < 0.02)) {
          state = "assembling";
          stateProgress = 0;
        }
      } else if (state === "assembling") {
        stateProgress += 0.02;
        // Inward materializing flash
        drawShield(cx, cy, 0.4 + stateProgress * 0.6, stateProgress);

        if (stateProgress >= 1) {
          state = "holding";
          stateProgress = 1;
        }
      }

      // Telemetry HUD text in corners
      ctx.fillStyle = "rgba(232, 112, 58, 0.3)";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText("ZERO-STANDING-PRIVILEGE // PURGE-CYCLE: ACTIVE", 32, height - 32);

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
