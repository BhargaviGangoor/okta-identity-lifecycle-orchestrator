import { useEffect, useRef } from "react";

interface AnomalyWave {
  x: number;
  z: number;
  radius: number;
  maxRadius: number;
  intensity: number;
  color: string;
}

export function SeismicGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    let gridOffset = 0;
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let waves: AnomalyWave[] = [];

    const spawnWave = () => {
      waves.push({
        x: (Math.random() - 0.5) * 400,
        z: Math.random() * 400 + 100,
        radius: 0,
        maxRadius: Math.random() * 120 + 80,
        intensity: 1.0,
        color: Math.random() > 0.4 ? "#E8703A" : "#D4E84A",
      });
    };

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      gridOffset = (gridOffset + 0.8) % 40;

      const horizonY = height * 0.45;
      const fov = 280;
      const gridRows = 26;
      const gridCols = 24;
      const colSpacing = 60;
      const rowSpacing = 35;

      // Randomly spawn seismic anomaly wave
      if (Math.random() < 0.025 && waves.length < 5) {
        spawnWave();
      }

      // Update waves
      waves.forEach((w) => {
        w.radius += 2.0;
        w.intensity = Math.max(0, 1 - w.radius / w.maxRadius);
      });
      waves = waves.filter((w) => w.intensity > 0.02);

      // Function to get elevation displacement at (gx, gz)
      const getElevation = (gx: number, gz: number) => {
        let elev = 0;
        for (const w of waves) {
          const dx = gx - w.x;
          const dz = gz - w.z;
          const d = Math.sqrt(dx * dx + dz * dz);
          const diff = Math.abs(d - w.radius);
          if (diff < 30) {
            elev += Math.sin((diff / 30) * Math.PI) * (25 * w.intensity);
          }
        }
        return elev;
      };

      // 1. Horizon glow
      const hGrad = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 80);
      hGrad.addColorStop(0, "transparent");
      hGrad.addColorStop(0.5, "rgba(232, 112, 58, 0.08)");
      hGrad.addColorStop(1, "transparent");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, horizonY - 40, width, 120);

      // 2. Horizon divider line
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.strokeStyle = "rgba(212, 232, 74, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Project & Draw Perspective Grid Lines
      // Horizontal rows (flowing forward)
      for (let r = 1; r <= gridRows; r++) {
        const gz = (r * rowSpacing) - gridOffset + 40;
        if (gz <= 10) continue;

        const screenY = horizonY + (fov * rowSpacing) / gz;
        if (screenY > height + 20) continue;

        const alpha = Math.min(0.35, ((screenY - horizonY) / (height - horizonY)) * 0.4);

        ctx.beginPath();
        let started = false;

        for (let c = -gridCols / 2; c <= gridCols / 2; c++) {
          const gx = c * colSpacing;
          const elev = getElevation(gx, gz);
          const screenX = width / 2 + (gx * fov) / gz;
          const py = screenY - (elev * fov) / gz;

          if (!started) {
            ctx.moveTo(screenX, py);
            started = true;
          } else {
            ctx.lineTo(screenX, py);
          }
        }

        ctx.strokeStyle = `rgba(212, 232, 74, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Longitudinal columns (converging toward horizon center)
      for (let c = -gridCols / 2; c <= gridCols / 2; c++) {
        const gx = c * colSpacing;
        ctx.beginPath();
        let started = false;

        for (let r = 1; r <= gridRows; r++) {
          const gz = (r * rowSpacing) - gridOffset + 40;
          if (gz <= 10) continue;

          const screenY = horizonY + (fov * rowSpacing) / gz;
          if (screenY > height + 20) continue;

          const elev = getElevation(gx, gz);
          const screenX = width / 2 + (gx * fov) / gz;
          const py = screenY - (elev * fov) / gz;

          if (!started) {
            ctx.moveTo(screenX, py);
            started = true;
          } else {
            ctx.lineTo(screenX, py);
          }
        }

        const colAlpha = Math.abs(c) < 3 ? 0.25 : 0.12;
        ctx.strokeStyle = `rgba(212, 232, 74, ${colAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 4. Glitch horizontal interference bar
      if (Math.random() < 0.06) {
        const glitchY = horizonY + Math.random() * (height - horizonY);
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(232, 112, 58, 0.18)" : "rgba(212, 232, 74, 0.18)";
        ctx.fillRect(0, glitchY, width, Math.random() * 3 + 1);
      }

      // Telemetry HUD status
      ctx.fillStyle = "rgba(212, 232, 74, 0.35)";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText("DRIFT-SEISMOGRAPH: SCANNING TOPOLOGY // 0.04 Hz", 32, horizonY - 14);

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
