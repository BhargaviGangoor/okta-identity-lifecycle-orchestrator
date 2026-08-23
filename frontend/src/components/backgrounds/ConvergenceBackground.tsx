import { useEffect, useRef } from "react";

interface ConvergenceParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  alpha: number;
  size: number;
  color: string;
  speed: number;
  arrived: boolean;
  arrivalTimer: number;
}

export function ConvergenceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;
    let particles: ConvergenceParticle[] = [];
    let frame = 0;
    let pulseRadius = 0;
    let pulsing = false;

    const COLORS = ["#D4E84A", "#22D3EE", "#A855F7", "#E8703A", "#38BDF8", "#4ADE80"];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const spawnWave = () => {
      const count = 30 + Math.floor(Math.random() * 20);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.min(width, height) * (0.3 + Math.random() * 0.3);
        const col = COLORS[Math.floor(Math.random() * COLORS.length)]!;
        particles.push({
          x: width / 2 + Math.cos(angle) * dist * (1 + (Math.random() - 0.5) * 0.4),
          y: height / 2 + Math.sin(angle) * dist * (1 + (Math.random() - 0.5) * 0.4),
          targetX: width / 2 + (Math.random() - 0.5) * 12,
          targetY: height / 2 + (Math.random() - 0.5) * 12,
          alpha: Math.random() * 0.5 + 0.3,
          size: Math.random() * 2 + 1,
          color: col,
          speed: Math.random() * 0.015 + 0.008,
          arrived: false,
          arrivalTimer: 0,
        });
      }
    };

    spawnWave();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      // Spawn new waves periodically or when all arrived
      const allArrived = particles.every((p) => p.arrived);
      if (allArrived || (frame % 280 === 0)) {
        if (allArrived) {
          pulsing = true;
          pulseRadius = 0;
        }
        particles = [];
        spawnWave();
      }

      // Core glow
      const coreGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 60);
      coreGrad.addColorStop(0, "rgba(212, 232, 74, 0.12)");
      coreGrad.addColorStop(0.5, "rgba(212, 232, 74, 0.04)");
      coreGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Pulse ring on convergence
      if (pulsing) {
        pulseRadius += 4;
        const pulseAlpha = Math.max(0, 0.5 - pulseRadius / 300);
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 232, 74, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        if (pulseRadius > 300) pulsing = false;
      }

      for (const p of particles) {
        if (!p.arrived) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 3) {
            p.arrived = true;
            p.arrivalTimer = 0;
          } else {
            p.x += dx * p.speed;
            p.y += dy * p.speed;
          }
        } else {
          p.arrivalTimer++;
          p.alpha = Math.max(0, p.alpha - 0.005);
        }

        // Draw trail line to center
        if (!p.arrived) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.targetX, p.targetY);
          ctx.strokeStyle = p.color + "0A";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
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
      style={{ opacity: 0.55 }}
    />
  );
}
