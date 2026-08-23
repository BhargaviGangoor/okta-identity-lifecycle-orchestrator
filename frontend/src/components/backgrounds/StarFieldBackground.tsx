import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

export function StarFieldBackground() {
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

    const COUNT = 180;
    const stars: Star[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random(),
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.012 + 0.004,
    }));

    // A few accent dots in brand colors
    const accents = [
      { x: 0.2, y: 0.3, color: "#D4E84A", size: 1.5 },
      { x: 0.75, y: 0.2, color: "#22D3EE", size: 1.2 },
      { x: 0.5, y: 0.7, color: "#A855F7", size: 1.3 },
      { x: 0.85, y: 0.65, color: "#D4E84A", size: 1 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed;
        const twinkle = 0.5 + Math.sin(s.twinklePhase) * 0.5;
        const a = s.alpha * twinkle * (0.5 + s.z * 0.5);

        // Parallax: deeper stars move slower
        s.x -= 0.04 * s.z;
        if (s.x < 0) s.x = width;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (0.5 + s.z * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      // Accent stars with glow
      for (const a of accents) {
        const ax = a.x * width;
        const ay = a.y * height;
        const pulse = 0.6 + Math.sin(frame * 0.02 + a.x * 10) * 0.4;

        const grad = ctx.createRadialGradient(ax, ay, 0, ax, ay, 8);
        grad.addColorStop(0, a.color + "50");
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(ax, ay, 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ax, ay, a.size, 0, Math.PI * 2);
        ctx.fillStyle = a.color + Math.floor(pulse * 200).toString(16).padStart(2, "0");
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
      style={{ opacity: 0.7 }}
    />
  );
}
