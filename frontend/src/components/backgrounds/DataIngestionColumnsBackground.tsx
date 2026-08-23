import { useEffect, useRef } from "react";

interface TelemetryStream {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  opacity: number;
  fontSize: number;
}

interface HexCell {
  x: number;
  y: number;
  size: number;
  pulsePhase: number;
  glow: number;
  color: string;
}

const ATTRIBUTES = [
  "OKTA_UID", "0x8F94D2", "ROLE:DEV_OPS", "DEPT:CORE_INFRA",
  "MFA:WEBAUTHN", "SOD:CLEAR", "STATUS:ACTIVE", "GRP:AWS-PROD-ADM",
  "PRIV_SCORE:0.12", "JWT:VERIFIED", "SESSION:TLS1.3", "IDP:SYNCED",
  "0xA4C9E1", "RISK:LOW", "GRANT:JUST-IN-TIME", "HASH:SHA256"
];

export function DataIngestionColumnsBackground() {
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
      initElements();
    };
    window.addEventListener("resize", handleResize);

    let streams: TelemetryStream[] = [];
    let hexGrid: HexCell[] = [];

    const initElements = () => {
      // 1. Telemetry streams
      const colWidth = 140;
      const colCount = Math.ceil(width / colWidth);
      streams = [];
      for (let i = 0; i < colCount; i++) {
        const streamChars: string[] = [];
        for (let j = 0; j < 25; j++) {
          streamChars.push(ATTRIBUTES[Math.floor(Math.random() * ATTRIBUTES.length)]!);
        }
        streams.push({
          x: i * colWidth + 24 + (Math.random() - 0.5) * 20,
          y: -(Math.random() * height),
          speed: Math.random() * 0.7 + 0.35,
          chars: streamChars,
          opacity: Math.random() * 0.18 + 0.08,
          fontSize: 10,
        });
      }

      // 2. Isometric Hex grid points
      hexGrid = [];
      const hexSize = 56;
      const xSpacing = hexSize * Math.sqrt(3);
      const ySpacing = hexSize * 1.5;
      const cols = Math.ceil(width / xSpacing) + 1;
      const rows = Math.ceil(height / ySpacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const xOffset = r % 2 === 1 ? xSpacing / 2 : 0;
          hexGrid.push({
            x: c * xSpacing + xOffset,
            y: r * ySpacing,
            size: hexSize,
            pulsePhase: Math.random() * Math.PI * 2,
            glow: 0,
            color: Math.random() > 0.4 ? "#D4E84A" : "#22D3EE",
          });
        }
      }
    };

    initElements();

    // Helper: draw hexagon
    const drawHex = (x: number, y: number, r: number, strokeColor: string, fillAlpha = 0) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = x + r * Math.cos(angle);
        const hy = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      if (fillAlpha > 0) {
        ctx.fillStyle = `rgba(212, 232, 74, ${fillAlpha})`;
        ctx.fill();
      }
    };

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      // 1. Draw subtle isometric Hex grid
      for (const cell of hexGrid) {
        cell.pulsePhase += 0.015;
        const pulse = 0.5 + Math.sin(cell.pulsePhase) * 0.5;

        // Occasional highlight trigger
        if (Math.random() < 0.0006) {
          cell.glow = 1.0;
        }
        if (cell.glow > 0.01) {
          cell.glow *= 0.96;
        }

        const baseAlpha = 0.03 + pulse * 0.02 + cell.glow * 0.25;
        const strokeColor = cell.color === "#22D3EE"
          ? `rgba(34, 211, 238, ${baseAlpha})`
          : `rgba(212, 232, 74, ${baseAlpha})`;

        drawHex(cell.x, cell.y, cell.size * 0.5, strokeColor, cell.glow * 0.08);

        // Center dot on pulsing nodes
        if (cell.glow > 0.1 || pulse > 0.85) {
          const dotAlpha = cell.glow > 0.1 ? cell.glow * 0.8 : 0.15;
          ctx.beginPath();
          ctx.arc(cell.x, cell.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 232, 74, ${dotAlpha})`;
          ctx.fill();
        }
      }

      // 2. Draw vertical cascading telemetry streams
      ctx.font = '10px "JetBrains Mono", monospace';
      for (const st of streams) {
        st.y += st.speed;
        const lineSpacing = st.fontSize + 8;
        const totalHeight = st.chars.length * lineSpacing;

        if (st.y > height + 50) {
          st.y = -totalHeight - 30;
          st.speed = Math.random() * 0.7 + 0.35;
        }

        for (let i = 0; i < st.chars.length; i++) {
          const cy = st.y + i * lineSpacing;
          if (cy < -20 || cy > height + 20) continue;

          // Head of column is bright lime, trailing items fade down
          const isHead = i === st.chars.length - 1;
          const charAlpha = isHead ? st.opacity * 2.2 : st.opacity * ((i + 1) / st.chars.length);
          const isHighlighted = (st.x + i) % 7 === 0;

          ctx.fillStyle = isHead
            ? `rgba(255, 255, 255, ${Math.min(1, charAlpha)})`
            : isHighlighted
            ? `rgba(34, 211, 238, ${charAlpha})`
            : `rgba(212, 232, 74, ${charAlpha})`;

          ctx.fillText(st.chars[i]!, st.x, cy);
        }
      }

      // 3. Ambient cyber top vignette
      const topGrad = ctx.createLinearGradient(0, 0, 0, 180);
      topGrad.addColorStop(0, "rgba(8, 9, 12, 0.6)");
      topGrad.addColorStop(1, "transparent");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 180);

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
