import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  radius: number;
  color: string;
}

export function DissolveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;
    let particles: Particle[] = [];
    let spawnTimer = 0;

    const COLORS = ["#E8703A", "#D4E84A", "#22D3EE", "#A855F7"];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const spawnCluster = () => {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const count = Math.floor(Math.random() * 18) + 12;
      const col = COLORS[Math.floor(Math.random() * COLORS.length)]!;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.2;
        particles.push({
          x: cx + (Math.random() - 0.5) * 30,
          y: cy + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: Math.random() * 0.5 + 0.3,
          decay: Math.random() * 0.004 + 0.002,
          radius: Math.random() * 2.5 + 1,
          color: col,
        });
      }
    };

    // Pre-seed
    for (let i = 0; i < 12; i++) spawnCluster();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      spawnTimer++;
      if (spawnTimer % 60 === 0) spawnCluster();

      particles = particles.filter((p) => p.alpha > 0.01);

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          p.color +
          Math.floor(p.alpha * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.fill();

        // Glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        grad.addColorStop(0, p.color + Math.floor(p.alpha * 80).toString(16).padStart(2, "0"));
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.998;
        p.vy *= 0.998;
        p.alpha -= p.decay;
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
