import { useEffect, useRef } from "react";

export function MatrixRainBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    const CHARS = "0123456789ABCDEF:./\\|><≡∑∆∏Ω∞§¶";
    const FONT_SIZE = 13;
    const cols = Math.floor(width / FONT_SIZE);
    const drops: number[] = Array(cols).fill(1);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.fillStyle = "rgba(8, 9, 12, 0.07)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]!;
        const y = drops[i]! * FONT_SIZE;

        // Head char is brighter
        const headAlpha = drops[i] === 1 ? 0.9 : 0.28;
        ctx.fillStyle = `rgba(212, 232, 74, ${headAlpha})`;
        ctx.fillText(char, i * FONT_SIZE, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]!++;
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
      style={{ opacity: 0.18 }}
    />
  );
}
