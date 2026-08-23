import { useEffect, useRef } from "react";

interface WarpStreak {
  x: number;
  y: number;
  z: number;
  pz: number;
  size: number;
  color: string;
}

interface LightPillar {
  x: number;
  height: number;
  width: number;
  alpha: number;
  color: string;
  speed: number;
}

export function HyperspaceWarpBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    let mouse = { x: 0, y: 0 };
    let targetTilt = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetTilt.x = (e.clientX - width / 2) * 0.25;
      targetTilt.y = (e.clientY - height / 2) * 0.25;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    let streaks: WarpStreak[] = [];
    let pillars: LightPillar[] = [];
    const WARP_COLORS = ["#D4E84A", "#22D3EE", "#38BDF8", "#E8703A", "#FFFFFF"];

    const initElements = () => {
      streaks = [];
      const count = 350;
      for (let i = 0; i < count; i++) {
        streaks.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * 1000 + 1,
          pz: 1000,
          size: Math.random() * 2 + 1,
          color: WARP_COLORS[Math.floor(Math.random() * WARP_COLORS.length)]!,
        });
      }

      pillars = [];
      for (let i = 0; i < 14; i++) {
        pillars.push({
          x: Math.random() * width,
          height: Math.random() * (height * 0.8) + 100,
          width: Math.random() * 30 + 15,
          alpha: Math.random() * 0.35 + 0.1,
          color: Math.random() > 0.4 ? "#D4E84A" : "#E8703A",
          speed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    initElements();

    let gridOffset = 0;
    const speed = 18; // Warp speed

    const draw = () => {
      // Smooth camera tilt damping
      mouse.x += (targetTilt.x - mouse.x) * 0.05;
      mouse.y += (targetTilt.y - mouse.y) * 0.05;

      ctx.fillStyle = "rgba(8, 9, 12, 0.4)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";

      const cx = width / 2 + mouse.x;
      const cy = height / 2 + mouse.y;

      // 1. Perspective Tunnel Grid (Floor & Ceiling)
      gridOffset = (gridOffset + 1.2) % 30;
      const gridRows = 16;
      const gridCols = 18;

      ctx.strokeStyle = "rgba(212, 232, 74, 0.08)";
      ctx.lineWidth = 1;

      // Floor grid lines
      for (let r = 1; r <= gridRows; r++) {
        const gz = r * 30 - gridOffset + 10;
        const sy = cy + (400 * 20) / gz;
        if (sy > height + 50) continue;

        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
        ctx.stroke();
      }

      for (let c = -gridCols / 2; c <= gridCols / 2; c++) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + c * 160, height + 50);
        ctx.stroke();
      }

      // 2. Light Pillars on perimeter
      for (const pil of pillars) {
        pil.alpha = 0.15 + Math.sin(Date.now() * pil.speed) * 0.12;

        const pGrad = ctx.createLinearGradient(pil.x, height, pil.x, height - pil.height);
        pGrad.addColorStop(0, pil.color + Math.floor(pil.alpha * 220).toString(16).padStart(2, "0"));
        pGrad.addColorStop(0.7, pil.color + "15");
        pGrad.addColorStop(1, "transparent");

        ctx.fillStyle = pGrad;
        ctx.fillRect(pil.x - pil.width / 2, height - pil.height, pil.width, pil.height);
      }

      // 3. Hyperspace Warp Speed Streaks
      for (const st of streaks) {
        st.pz = st.z;
        st.z -= speed;

        if (st.z <= 1) {
          st.z = 1000;
          st.pz = 1000;
          st.x = (Math.random() - 0.5) * width * 2;
          st.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 400 / st.z;
        const px = st.x * k + cx;
        const py = st.y * k + cy;

        const pk = 400 / st.pz;
        const prevX = st.x * pk + cx;
        const prevY = st.y * pk + cy;

        if (px < -50 || px > width + 50 || py < -50 || py > height + 50) continue;

        const alpha = Math.min(1.0, (1 - st.z / 1000) * 1.5);

        // Motion blur streak line
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.strokeStyle = st.color === "#FFFFFF"
          ? `rgba(255, 255, 255, ${alpha})`
          : st.color + Math.floor(alpha * 240).toString(16).padStart(2, "0");
        ctx.lineWidth = Math.max(1, (1 - st.z / 1000) * 3.5);
        ctx.stroke();

        // White hot tip
        ctx.beginPath();
        ctx.arc(px, py, (1 - st.z / 1000) * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      }

      // 4. Center Horizon Core Flash
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140);
      coreGrad.addColorStop(0, "rgba(212, 232, 74, 0.18)");
      coreGrad.addColorStop(0.5, "rgba(34, 211, 238, 0.05)");
      coreGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
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
