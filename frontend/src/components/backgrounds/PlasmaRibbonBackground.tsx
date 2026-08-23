import { useEffect, useRef } from "react";

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export function PlasmaRibbonBackground() {
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
      initEmbers();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let embers: Ember[] = [];
    const EMBER_COLORS = ["#D4E84A", "#22D3EE", "#38BDF8", "#A855F7", "#E8703A"];

    const initEmbers = () => {
      embers = [];
      const count = 70;
      for (let i = 0; i < count; i++) {
        embers.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -Math.random() * 0.8 - 0.2,
          size: Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.7 + 0.2,
          color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)]!,
        });
      }
    };

    initEmbers();

    const RIBBON_LAYERS = [
      { baseColor: "#D4E84A", freq: 0.0018, speed: 0.012, amp: 85, yRatio: 0.35 },
      { baseColor: "#22D3EE", freq: 0.0022, speed: 0.016, amp: 110, yRatio: 0.48 },
      { baseColor: "#A855F7", freq: 0.0015, speed: 0.009, amp: 95, yRatio: 0.60 },
      { baseColor: "#E8703A", freq: 0.0025, speed: 0.014, amp: 75, yRatio: 0.72 },
    ];

    const draw = () => {
      time += 0.012;

      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";

      // 1. Draw Undulating Plasma Waves
      const step = 8;
      for (let layerIdx = 0; layerIdx < RIBBON_LAYERS.length; layerIdx++) {
        const layer = RIBBON_LAYERS[layerIdx]!;
        const baseY = height * layer.yRatio;

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width + step; x += step) {
          // Complex harmonic wave equation
          const wave1 = Math.sin(x * layer.freq + time * layer.speed * 10) * layer.amp;
          const wave2 = Math.cos(x * layer.freq * 2.2 - time * layer.speed * 8) * (layer.amp * 0.45);
          const wave3 = Math.sin((x + time * 50) * 0.004) * 20;

          // Mouse ripple interaction
          let mouseDisplacement = 0;
          if (mouse.active) {
            const mdx = x - mouse.x;
            const mdist = Math.abs(mdx);
            if (mdist < 300) {
              const mFactor = Math.cos((mdist / 300) * (Math.PI / 2));
              mouseDisplacement = Math.sin(time * 6 + mdist * 0.04) * (45 * mFactor);
            }
          }

          const y = baseY + wave1 + wave2 + wave3 + mouseDisplacement;
          if (x === 0) ctx.lineTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Wave gradient fill
        const waveGrad = ctx.createLinearGradient(0, baseY - layer.amp, 0, baseY + layer.amp * 2);
        waveGrad.addColorStop(0, layer.baseColor + "25");
        waveGrad.addColorStop(0.5, layer.baseColor + "08");
        waveGrad.addColorStop(1, "transparent");
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Glowing Crest Line
        ctx.beginPath();
        for (let x = 0; x <= width + step; x += step) {
          const wave1 = Math.sin(x * layer.freq + time * layer.speed * 10) * layer.amp;
          const wave2 = Math.cos(x * layer.freq * 2.2 - time * layer.speed * 8) * (layer.amp * 0.45);
          const wave3 = Math.sin((x + time * 50) * 0.004) * 20;

          let mouseDisplacement = 0;
          if (mouse.active) {
            const mdx = x - mouse.x;
            const mdist = Math.abs(mdx);
            if (mdist < 300) {
              const mFactor = Math.cos((mdist / 300) * (Math.PI / 2));
              mouseDisplacement = Math.sin(time * 6 + mdist * 0.04) * (45 * mFactor);
            }
          }

          const y = baseY + wave1 + wave2 + wave3 + mouseDisplacement;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = layer.baseColor + "70";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Secondary glow stroke
        ctx.strokeStyle = layer.baseColor + "20";
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // 2. Floating Luminous Embers
      for (const e of embers) {
        e.x += e.vx;
        e.y += e.vy;

        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }

        const eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 4);
        eg.addColorStop(0, e.color + Math.floor(e.alpha * 240).toString(16).padStart(2, "0"));
        eg.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = eg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
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
