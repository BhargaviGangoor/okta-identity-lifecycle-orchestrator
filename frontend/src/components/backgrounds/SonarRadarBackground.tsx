import { useEffect, useRef } from "react";

interface Blip {
  x: number;
  y: number;
  r: number;
  angle: number;
  dist: number;
  intensity: number;
  pulseRadius: number;
  label: string;
  type: "user" | "policy" | "okta";
}

export function SonarRadarBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;
    let sweepAngle = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initBlips();
    };
    window.addEventListener("resize", handleResize);

    const labels = [
      "OKTA-TENANT-PROD", "DIR-SYNC:ACTV", "MFA-POL:ENFRCD",
      "SOD-GUARD:PASS", "IAM-GATE:01", "IDP-CLUSTER-EU",
      "AUTH-STREAM:LIVE", "APP-CATALOG:OK", "RBAC-ROOT:LOCK"
    ];

    let blips: Blip[] = [];

    const initBlips = () => {
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) * 0.44;
      blips = [];
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const dist = (0.25 + Math.random() * 0.7) * maxR;
        blips.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          r: Math.random() * 2.5 + 2,
          angle: (angle + Math.PI * 2) % (Math.PI * 2),
          dist,
          intensity: 0,
          pulseRadius: 0,
          label: labels[i % labels.length]!,
          type: i % 3 === 0 ? "okta" : i % 3 === 1 ? "policy" : "user",
        });
      }
    };

    initBlips();

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) * 0.46;

      // Subtle background grid
      ctx.strokeStyle = "rgba(212, 232, 74, 0.02)";
      ctx.lineWidth = 1;
      const gridGap = 48;
      for (let x = 0; x <= width; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Concentric Radar Rings
      const ringSteps = [0.2, 0.4, 0.6, 0.8, 1.0];
      ringSteps.forEach((step, idx) => {
        const r = maxR * step;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === ringSteps.length - 1 ? "rgba(212, 232, 74, 0.16)" : "rgba(212, 232, 74, 0.06)";
        ctx.lineWidth = idx === ringSteps.length - 1 ? 1.5 : 1;
        if (idx % 2 === 1) ctx.setLineDash([4, 6]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring distance markers
        ctx.fillStyle = "rgba(212, 232, 74, 0.35)";
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${Math.round(step * 100)}% RNG`, cx + 6, cy - r + 12);
      });

      // Crosshair Axes (N, S, E, W)
      ctx.strokeStyle = "rgba(212, 232, 74, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - maxR * 1.05, cy);
      ctx.lineTo(cx + maxR * 1.05, cy);
      ctx.moveTo(cx, cy - maxR * 1.05);
      ctx.lineTo(cx, cy + maxR * 1.05);
      ctx.stroke();

      // Sweeping Beam & Cone
      sweepAngle = (sweepAngle + 0.015) % (Math.PI * 2);

      // Radar Sweep Glow Wedge
      const wedgeSegments = 30;
      for (let i = 0; i < wedgeSegments; i++) {
        const segAngle = sweepAngle - (i / wedgeSegments) * (Math.PI * 0.35);
        const alpha = (1 - i / wedgeSegments) * 0.14;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, segAngle - 0.02, segAngle);
        ctx.closePath();
        ctx.fillStyle = `rgba(212, 232, 74, ${alpha})`;
        ctx.fill();
      }

      // Leading beam line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.strokeStyle = "rgba(212, 232, 74, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
      coreGrad.addColorStop(0, "rgba(212, 232, 74, 0.6)");
      coreGrad.addColorStop(0.5, "rgba(212, 232, 74, 0.15)");
      coreGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#D4E84A";
      ctx.fill();

      // Update & Render Blips
      for (const blip of blips) {
        // Angle difference to sweep beam
        let angleDiff = sweepAngle - blip.angle;
        while (angleDiff < 0) angleDiff += Math.PI * 2;
        while (angleDiff >= Math.PI * 2) angleDiff -= Math.PI * 2;

        // If beam recently crossed blip
        if (angleDiff < 0.04) {
          blip.intensity = 1;
          blip.pulseRadius = 0;
        }

        if (blip.intensity > 0.01) {
          blip.intensity *= 0.985;
          blip.pulseRadius += 0.8;

          const color = blip.type === "okta" ? "#22D3EE" : blip.type === "policy" ? "#E8703A" : "#D4E84A";

          // Expanding shockwave ripple
          if (blip.pulseRadius < 35) {
            const shockAlpha = (1 - blip.pulseRadius / 35) * blip.intensity * 0.4;
            ctx.beginPath();
            ctx.arc(blip.x, blip.y, blip.pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = color === "#22D3EE" ? `rgba(34, 211, 238, ${shockAlpha})` : `rgba(212, 232, 74, ${shockAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Blip Halo Glow
          const bGrad = ctx.createRadialGradient(blip.x, blip.y, 0, blip.x, blip.y, 14);
          bGrad.addColorStop(0, color === "#22D3EE" ? `rgba(34, 211, 238, ${blip.intensity * 0.7})` : `rgba(212, 232, 74, ${blip.intensity * 0.7})`);
          bGrad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(blip.x, blip.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = bGrad;
          ctx.fill();

          // Blip Core
          ctx.beginPath();
          ctx.arc(blip.x, blip.y, blip.r, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          // Blip Label
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(255, 255, 255, ${blip.intensity * 0.8})`;
          ctx.fillText(blip.label, blip.x + 8, blip.y + 3);
        } else {
          // Faint dormant blip
          ctx.beginPath();
          ctx.arc(blip.x, blip.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(212, 232, 74, 0.15)";
          ctx.fill();
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
    />
  );
}
