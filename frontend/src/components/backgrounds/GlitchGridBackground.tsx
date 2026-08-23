import { useEffect, useRef } from "react";

export function GlitchGridBackground() {
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

    interface GlitchLine { y: number; w: number; alpha: number; speed: number; color: string }
    let glitchLines: GlitchLine[] = [];
    let glitchTimer = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const GRID = 48;

    const spawnGlitch = () => {
      const count = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < count; i++) {
        glitchLines.push({
          y: Math.random() * height,
          w: Math.random() * 0.6 + 0.2,
          alpha: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 2 + 0.5,
          color: Math.random() > 0.6 ? "#D4E84A" : Math.random() > 0.5 ? "#E8703A" : "#22D3EE",
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      // Perspective grid lines — vertical
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Horizontal
      for (let y = 0; y <= height; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Animated scan line (slow moving top to bottom)
      const scanY = ((frame * 0.4) % (height + 80)) - 40;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "rgba(212, 232, 74, 0.06)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, width, 60);

      // Glitch horizontal lines
      glitchTimer++;
      if (glitchTimer % 90 === 0 || (Math.random() < 0.01 && frame > 60)) {
        spawnGlitch();
      }

      glitchLines = glitchLines.filter((g) => g.alpha > 0.02);
      for (const g of glitchLines) {
        const x = Math.random() * width * (1 - g.w);
        ctx.fillStyle =
          g.color + Math.floor(g.alpha * 255).toString(16).padStart(2, "0");
        ctx.fillRect(x, g.y, width * g.w, 1.5);
        g.y += g.speed * 0.3;
        g.alpha *= 0.94;
      }

      // Occasional bright intersection flash
      if (Math.random() < 0.005) {
        const gx = Math.floor(Math.random() * (width / GRID)) * GRID;
        const gy = Math.floor(Math.random() * (height / GRID)) * GRID;
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212, 232, 74, 0.9)";
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
      style={{ opacity: 0.9 }}
    />
  );
}
