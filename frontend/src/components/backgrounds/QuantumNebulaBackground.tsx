import { useEffect, useRef } from "react";

interface NebulaParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  angle: number;
  speed: number;
}

export function QuantumNebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;
    let time = 0;

    let mouse = { x: width / 2, y: height / 2, active: false };

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
      initParticles();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const COLORS = ["#D4E84A", "#22D3EE", "#38BDF8", "#A855F7", "#E8703A"];
    let particles: NebulaParticle[] = [];

    const initParticles = () => {
      particles = [];
      const count = Math.min(Math.floor((width * height) / 2200), 750);

      for (let i = 0; i < count; i++) {
        const col = COLORS[Math.floor(Math.random() * COLORS.length)]!;
        const sz = Math.random() * 2.8 + 1.0;
        const al = Math.random() * 0.65 + 0.2;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: sz,
          baseSize: sz,
          alpha: al,
          baseAlpha: al,
          color: col,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 1.2 + 0.4,
        });
      }
    };

    initParticles();

    // Simplified 2D pseudo curl-noise vector field
    const getFlow = (x: number, y: number, t: number) => {
      const scale = 0.003;
      const angle =
        Math.sin(x * scale + t * 0.4) * 2 +
        Math.cos(y * scale + t * 0.3) * 2 +
        Math.sin((x + y) * scale * 0.5) * Math.PI;
      return { fx: Math.cos(angle), fy: Math.sin(angle) };
    };

    const draw = () => {
      time += 0.004;

      // Dark background with faint persistence for subtle motion blur
      ctx.fillStyle = "rgba(8, 9, 12, 0.28)";
      ctx.fillRect(0, 0, width, height);

      // Additive blending for brilliant luminous glow
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        // Fluid flow field force
        const flow = getFlow(p.x, p.y, time);
        p.vx += flow.fx * 0.08 * p.speed;
        p.vy += flow.fy * 0.08 * p.speed;

        // Interactive mouse gravity vortex
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 260) {
            const force = ((260 - dist) / 260) * 0.6;
            // Swirling gravitational force
            p.vx += (dx / dist) * force + (-dy / dist) * force * 1.2;
            p.vy += (dy / dist) * force + (dx / dist) * force * 1.2;
            p.size = p.baseSize * (1 + force * 2.2);
            p.alpha = Math.min(1.0, p.baseAlpha * (1 + force * 1.8));
          } else {
            p.size = p.baseSize;
            p.alpha = p.baseAlpha;
          }
        }

        // Dampen velocity
        p.vx *= 0.94;
        p.vy *= 0.94;

        p.x += p.vx;
        p.y += p.vy;

        // Screen wrap
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Draw luminous particle with radial glow halo
        const haloR = p.size * 5;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
        grad.addColorStop(0, p.color + Math.floor(p.alpha * 240).toString(16).padStart(2, "0"));
        grad.addColorStop(0.4, p.color + Math.floor(p.alpha * 70).toString(16).padStart(2, "0"));
        grad.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // White-hot core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.95})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
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
