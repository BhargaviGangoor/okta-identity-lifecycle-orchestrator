import { useEffect, useRef } from "react";

const ATTRS = [
  "name:", "dept:", "role:", "groups:", "okta_id:", "status:",
  "mfa:", "risk:", "email:", "manager:", "location:", "title:",
  "joined:", "last_login:", "apps:", "entitlements:",
];

export function DataStreamBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    const FONT_SIZE = 11;
    const COL_W = 160;
    const cols = Math.ceil(width / COL_W);

    interface Column {
      x: number;
      y: number;
      speed: number;
      lines: string[];
      color: string;
    }

    const COLORS = ["rgba(212,232,74,", "rgba(34,211,238,", "rgba(255,255,255,"];

    const makeLines = (): string[] => {
      const out: string[] = [];
      for (let i = 0; i < 40; i++) {
        const attr = ATTRS[Math.floor(Math.random() * ATTRS.length)]!;
        const val = Math.random() > 0.5
          ? `"${Math.random().toString(36).slice(2, 8)}"`
          : `${Math.floor(Math.random() * 999)}`;
        out.push(`${attr} ${val}`);
      }
      return out;
    };

    const columns: Column[] = Array.from({ length: cols }, (_, i) => ({
      x: i * COL_W + Math.random() * 20,
      y: -(Math.random() * height),
      speed: Math.random() * 0.6 + 0.3,
      lines: makeLines(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;

      for (const col of columns) {
        for (let i = 0; i < col.lines.length; i++) {
          const ly = col.y + i * (FONT_SIZE + 4);
          if (ly < -20 || ly > height + 20) continue;

          // Fade near top and bottom
          const relY = ly / height;
          const fade = Math.min(relY, 1 - relY) * 4;
          const alpha = Math.min(0.22, fade * 0.22);

          ctx.fillStyle = col.color + alpha + ")";
          ctx.fillText(col.lines[i]!, col.x, ly);
        }

        col.y += col.speed;
        if (col.y > height + col.lines.length * (FONT_SIZE + 4)) {
          col.y = -(col.lines.length * (FONT_SIZE + 4));
          col.lines = makeLines();
          col.speed = Math.random() * 0.6 + 0.3;
        }
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
      style={{ opacity: 1 }}
    />
  );
}
