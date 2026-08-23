import { useEffect, useRef } from "react";

interface CosmosStar {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface OrbitRing {
  tiltAngle: number;
  rotAngle: number;
  rotSpeed: number;
  radiusX: number;
  radiusY: number;
  color: string;
  dotCount: number;
}

export function GalaxyVortexBackground() {
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
      initCosmos();
    };
    window.addEventListener("resize", handleResize);

    let stars: CosmosStar[] = [];
    let rings: OrbitRing[] = [];

    const initCosmos = () => {
      // 1. Multi-depth stars
      stars = [];
      const starCount = 140;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 0.8 + 0.2,
          size: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.6 + 0.15,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.015 + 0.005,
        });
      }

      // 2. Tilted 3D orbital rings
      rings = [
        { tiltAngle: 0.35, rotAngle: 0, rotSpeed: 0.003, radiusX: 240, radiusY: 90, color: "#D4E84A", dotCount: 22 },
        { tiltAngle: -0.45, rotAngle: 1.2, rotSpeed: -0.0025, radiusX: 360, radiusY: 130, color: "#22D3EE", dotCount: 30 },
        { tiltAngle: 0.8, rotAngle: 2.5, rotSpeed: 0.002, radiusX: 480, radiusY: 180, color: "rgba(212, 232, 74, 0.4)", dotCount: 36 },
      ];
    };

    initCosmos();

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Central galactic core nebula
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 320);
      coreGrad.addColorStop(0, "rgba(34, 211, 238, 0.06)");
      coreGrad.addColorStop(0.4, "rgba(212, 232, 74, 0.03)");
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Stars with parallax drift and twinkle
      for (const st of stars) {
        st.twinklePhase += st.twinkleSpeed;
        const tw = 0.5 + Math.sin(st.twinklePhase) * 0.5;
        const a = st.alpha * tw * st.z;

        // Slow galactic drift
        st.x -= 0.08 * st.z;
        if (st.x < 0) st.x = width;

        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size * st.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.fill();
      }

      // 3. Draw Tilted Galaxy Orbital Rings & Nodes
      for (const ring of rings) {
        ring.rotAngle += ring.rotSpeed;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.tiltAngle);

        // Ring Ellipse Stroke
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.radiusX, ring.radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color.startsWith("#") ? ring.color + "18" : ring.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Orbiting node particles on ellipse
        for (let i = 0; i < ring.dotCount; i++) {
          const theta = ring.rotAngle + (i / ring.dotCount) * Math.PI * 2;
          const px = Math.cos(theta) * ring.radiusX;
          const py = Math.sin(theta) * ring.radiusY;

          // Depth illusion based on y position in ellipse
          const depthAlpha = ((py / ring.radiusY) + 1) * 0.4 + 0.2;
          const dotSize = (py / ring.radiusY > 0) ? 2.5 : 1.5;

          ctx.beginPath();
          ctx.arc(px, py, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = ring.color.startsWith("#")
            ? ring.color + Math.floor(depthAlpha * 255).toString(16).padStart(2, "0")
            : `rgba(212, 232, 74, ${depthAlpha})`;
          ctx.fill();
        }

        ctx.restore();
      }

      // Galactic core point
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(212, 232, 74, 0.8)";
      ctx.fill();

      // Telemetry label
      ctx.fillStyle = "rgba(34, 211, 238, 0.3)";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText("TOPOLOGICAL-COSMOS: ACTIVE // 360° ORBITAL TILT", 32, height - 32);

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
