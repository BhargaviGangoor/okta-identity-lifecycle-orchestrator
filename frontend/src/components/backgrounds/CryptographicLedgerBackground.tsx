import { useEffect, useRef } from "react";

interface LedgerBlock {
  x: number;
  targetY: number;
  currentY: number;
  vy: number;
  size: number;
  alpha: number;
  sealed: boolean;
  hash: string;
  sealFlash: number;
  color: string;
}

const HASHES = [
  "SHA256:8f4c2e", "MERKLE:90a1b2", "BLOCK:10492", "SEALED:0x7e",
  "SOC2:VERIFIED", "PROOF:e3b0c4", "AUDIT:IMMUTABLE", "SIG:ED25519"
];

export function CryptographicLedgerBackground() {
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
      initBlocks();
    };
    window.addEventListener("resize", handleResize);

    let blocks: LedgerBlock[] = [];

    const initBlocks = () => {
      blocks = [];
      const columns = 5;
      const colWidth = width / (columns + 1);

      for (let c = 1; c <= columns; c++) {
        const colX = c * colWidth + (Math.random() - 0.5) * 30;
        const count = 4;
        for (let i = 0; i < count; i++) {
          const sz = 38;
          const targetY = height * 0.25 + i * (sz * 1.5);
          blocks.push({
            x: colX,
            targetY,
            currentY: targetY,
            vy: 0,
            size: sz,
            alpha: 0.7,
            sealed: true,
            hash: HASHES[(c + i) % HASHES.length]!,
            sealFlash: 0,
            color: (c + i) % 2 === 0 ? "#D4E84A" : "#22D3EE",
          });
        }
      }
    };

    initBlocks();

    // Drop new block periodically
    let dropTimer = 0;
    const dropNewBlock = () => {
      const columns = 5;
      const colWidth = width / (columns + 1);
      const chosenCol = Math.floor(Math.random() * columns) + 1;
      const colX = chosenCol * colWidth + (Math.random() - 0.5) * 30;
      const sz = 38;
      const targetY = height * 0.25 + Math.random() * (height * 0.55);

      blocks.push({
        x: colX,
        targetY,
        currentY: -60,
        vy: Math.random() * 2 + 3,
        size: sz,
        alpha: 0.9,
        sealed: false,
        hash: HASHES[Math.floor(Math.random() * HASHES.length)]!,
        sealFlash: 0,
        color: Math.random() > 0.4 ? "#D4E84A" : "#22D3EE",
      });
    };

    // Draw isometric 3D cube
    const drawIsoCube = (cx: number, cy: number, sz: number, strokeColor: string, fillAlpha: number, flash = 0) => {
      const h = sz * 0.58; // isometric angle projection
      const w = sz;

      // Top face
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + w, cy);
      ctx.lineTo(cx, cy + h);
      ctx.lineTo(cx - w, cy);
      ctx.closePath();
      ctx.fillStyle = flash > 0.1
        ? `rgba(255, 255, 255, ${flash * 0.5})`
        : `rgba(212, 232, 74, ${fillAlpha * 0.08})`;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left face
      ctx.beginPath();
      ctx.moveTo(cx - w, cy);
      ctx.lineTo(cx, cy + h);
      ctx.lineTo(cx, cy + h + sz);
      ctx.lineTo(cx - w, cy + sz);
      ctx.closePath();
      ctx.fillStyle = `rgba(8, 9, 12, 0.7)`;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right face
      ctx.beginPath();
      ctx.moveTo(cx + w, cy);
      ctx.lineTo(cx, cy + h);
      ctx.lineTo(cx, cy + h + sz);
      ctx.lineTo(cx + w, cy + sz);
      ctx.closePath();
      ctx.fillStyle = `rgba(18, 19, 24, 0.7)`;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const draw = () => {
      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      dropTimer++;
      if (dropTimer % 110 === 0 && blocks.length < 32) {
        dropNewBlock();
      }

      // Draw connecting ledger chain lines
      ctx.strokeStyle = "rgba(212, 232, 74, 0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
          const b1 = blocks[i]!;
          const b2 = blocks[j]!;
          const dx = b1.x - b2.x;
          const dy = b1.currentY - b2.currentY;
          if (Math.abs(dx) < 40 && Math.abs(dy) < 120) {
            ctx.beginPath();
            ctx.moveTo(b1.x, b1.currentY);
            ctx.lineTo(b2.x, b2.currentY);
            ctx.stroke();
          }
        }
      }

      // Update & Draw blocks
      for (const b of blocks) {
        if (!b.sealed) {
          b.currentY += b.vy;
          if (b.currentY >= b.targetY) {
            b.currentY = b.targetY;
            b.sealed = true;
            b.sealFlash = 1.0; // Trigger laser seal flash
          }
        }

        if (b.sealFlash > 0.01) {
          b.sealFlash *= 0.94;
        }

        const strokeColor = b.color === "#22D3EE"
          ? `rgba(34, 211, 238, ${b.alpha * 0.35})`
          : `rgba(212, 232, 74, ${b.alpha * 0.35})`;

        drawIsoCube(b.x, b.currentY, b.size, strokeColor, b.alpha, b.sealFlash);

        // Hash stamp label
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = b.sealFlash > 0.1
          ? "rgba(255, 255, 255, 0.9)"
          : b.color === "#22D3EE"
          ? "rgba(34, 211, 238, 0.6)"
          : "rgba(212, 232, 74, 0.6)";
        ctx.fillText(b.hash, b.x - b.size * 0.8, b.currentY + b.size + 14);

        // Sealing laser beam horizontal sweep
        if (b.sealFlash > 0.1) {
          ctx.beginPath();
          ctx.moveTo(0, b.currentY + b.size * 0.5);
          ctx.lineTo(width, b.currentY + b.size * 0.5);
          ctx.strokeStyle = `rgba(212, 232, 74, ${b.sealFlash * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Keep block list bounded
      if (blocks.length > 30) {
        blocks.shift();
      }

      // Telemetry HUD footer
      ctx.fillStyle = "rgba(212, 232, 74, 0.35)";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText("IMMUTABLE-LEDGER: MERKLE TREE SEALED // SOC2 TYPE-II", 32, height - 32);

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
