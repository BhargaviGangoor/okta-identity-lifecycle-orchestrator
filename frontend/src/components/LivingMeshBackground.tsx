import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  type: string;
  pulsePhase: number;
}

interface Packet {
  sourceIdx: number;
  targetIdx: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

export function LivingMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Target vs smoothed interpolated mouse position (smooth damping)
    let targetMouse = { x: -1000, y: -1000, active: false };
    let smoothMouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
      targetMouse.active = true;
      if (!smoothMouse.active) {
        smoothMouse.x = e.clientX;
        smoothMouse.y = e.clientY;
        smoothMouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      targetMouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener("resize", handleResize);

    // High-contrast vibrant neon identity color themes
    const colorThemes = [
      { color: "#D4E84A", glow: "rgba(212, 232, 74, 0.6)", type: "user" },
      { color: "#22D3EE", glow: "rgba(34, 211, 238, 0.6)", type: "group" },
      { color: "#E8703A", glow: "rgba(232, 112, 58, 0.6)", type: "policy" },
      { color: "#A855F7", glow: "rgba(168, 85, 247, 0.6)", type: "app" },
      { color: "#38BDF8", glow: "rgba(56, 189, 248, 0.6)", type: "audit" },
      { color: "#4ADE80", glow: "rgba(74, 222, 128, 0.6)", type: "okta" },
    ];

    let nodes: Node[] = [];
    let packets: Packet[] = [];

    const initNodes = () => {
      const count = Math.min(Math.max(Math.floor((width * height) / 10000), 65), 120);
      nodes = [];
      packets = [];

      for (let i = 0; i < count; i++) {
        const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)]!;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 3 + 2.5,
          color: theme.color,
          glowColor: theme.glow,
          type: theme.type,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    initNodes();

    // Spawn packets continuously
    const spawnPacket = () => {
      if (nodes.length < 2) return;
      const sourceIdx = Math.floor(Math.random() * nodes.length);
      const targetIdx = Math.floor(Math.random() * nodes.length);
      if (sourceIdx !== targetIdx) {
        const source = nodes[sourceIdx]!;
        const target = nodes[targetIdx]!;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 220) {
          packets.push({
            sourceIdx,
            targetIdx,
            progress: 0,
            speed: 0.015 + Math.random() * 0.02,
            color: source.color,
            size: Math.random() * 2 + 3,
          });
        }
      }
    };

    const packetInterval = setInterval(spawnPacket, 180);

    // Main render loop
    let tick = 0;
    const render = () => {
      tick += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp interpolation (0.075 damping for liquid glide)
      if (targetMouse.active) {
        smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.075;
        smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.075;
      }

      // 1. Draw large flowing ambient nebulae in the background
      const orb1X = width * 0.2 + Math.sin(tick * 0.4) * 140;
      const orb1Y = height * 0.25 + Math.cos(tick * 0.35) * 100;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 20, orb1X, orb1Y, width * 0.45);
      grad1.addColorStop(0, "rgba(212, 232, 74, 0.14)");
      grad1.addColorStop(0.4, "rgba(212, 232, 74, 0.05)");
      grad1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.8 + Math.cos(tick * 0.3) * 140;
      const orb2Y = height * 0.7 + Math.sin(tick * 0.4) * 110;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 20, orb2X, orb2Y, width * 0.5);
      grad2.addColorStop(0, "rgba(34, 211, 238, 0.12)");
      grad2.addColorStop(0.4, "rgba(34, 211, 238, 0.04)");
      grad2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      const orb3X = width * 0.5 + Math.sin(tick * 0.25) * 120;
      const orb3Y = height * 0.9 + Math.cos(tick * 0.25) * 90;
      const grad3 = ctx.createRadialGradient(orb3X, orb3Y, 20, orb3X, orb3Y, width * 0.45);
      grad3.addColorStop(0, "rgba(232, 112, 58, 0.11)");
      grad3.addColorStop(0.4, "rgba(232, 112, 58, 0.035)");
      grad3.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // Smooth Cursor Glowing Light Aura
      if (targetMouse.active && smoothMouse.x > 0) {
        const cursorGrad = ctx.createRadialGradient(
          smoothMouse.x,
          smoothMouse.y,
          5,
          smoothMouse.x,
          smoothMouse.y,
          130
        );
        cursorGrad.addColorStop(0, "rgba(212, 232, 74, 0.16)");
        cursorGrad.addColorStop(0.5, "rgba(34, 211, 238, 0.06)");
        cursorGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = cursorGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw glowing connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j]!;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 190;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.55;
            
            // Two-color gradient connection
            const lineGrad = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
            lineGrad.addColorStop(0, node.color);
            lineGrad.addColorStop(1, other.color);

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 1.25;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // 3. Update & draw glowing nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]!;

        // Smooth liquid mouse repulsion using interpolated cursor position
        if (targetMouse.active && smoothMouse.x > 0) {
          const mdx = smoothMouse.x - node.x;
          const mdy = smoothMouse.y - node.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 180) {
            const force = (180 - mdist) / 180;
            node.x -= (mdx / mdist) * force * 2.2;
            node.y -= (mdy / mdist) * force * 2.2;
          }
        }

        // Velocity drift
        node.x += node.vx;
        node.y += node.vy;

        // Wrap viewport boundaries
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        const pulse = Math.sin(tick * 3 + node.pulsePhase) * 1.5 + node.radius;

        // Outer radiant aura
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse * 5, 0, Math.PI * 2);
        ctx.fillStyle = node.glowColor;
        ctx.fill();

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. Update & draw live photon data pulses
      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p]!;
        pkt.progress += pkt.speed;

        const source = nodes[pkt.sourceIdx];
        const target = nodes[pkt.targetIdx];

        if (!source || !target || pkt.progress >= 1) {
          packets.splice(p, 1);
          continue;
        }

        const px = source.x + (target.x - source.x) * pkt.progress;
        const py = source.y + (target.y - source.y) * pkt.progress;

        // Draw traveling photon core
        ctx.beginPath();
        ctx.arc(px, py, pkt.size, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 24;
        ctx.fill();

        // Photon outer halo
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = pkt.color;
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(packetInterval);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{
        background: "radial-gradient(ellipse at 50% 10%, #151720 0%, #090A0E 50%, #040507 100%)",
      }}
    />
  );
}
