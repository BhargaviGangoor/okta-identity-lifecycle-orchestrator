import { useEffect, useRef } from "react";

interface Building {
  gridX: number;
  gridZ: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  roofBeam: boolean;
  pulsePhase: number;
  windows: { y: number; alpha: number }[];
}

interface TrafficPacket {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  altitude: number;
  t: number;
  speed: number;
  color: string;
  size: number;
}

interface SkywayBeam {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  altitude: number;
  color: string;
}

export function HolographicCyberCityBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    let camZ = 0;
    let scrollY = 0;
    let targetScrollY = 0;

    let mouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX - width / 2) * 0.25;
      targetMouse.y = (e.clientY - height / 2) * 0.2;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initCity();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const CITY_COLS = 18;
    const CITY_ROWS = 32;
    const BLOCK_SIZE = 150;
    const TOTAL_DEPTH = CITY_ROWS * BLOCK_SIZE;

    let buildings: Building[] = [];
    let traffic: TrafficPacket[] = [];
    let skyways: SkywayBeam[] = [];

    const COLORS = ["#D4E84A", "#22D3EE", "#38BDF8", "#E8703A", "#A855F7"];

    const initCity = () => {
      buildings = [];
      traffic = [];
      skyways = [];

      // 1. Generate 3D Megacity Buildings across full grid
      for (let r = 0; r < CITY_ROWS; r++) {
        for (let c = -CITY_COLS / 2; c <= CITY_COLS / 2; c++) {
          // Leave open central avenues
          if (c === 0 || c === -1) continue;

          if (Math.random() < 0.72) {
            const bHeight = Math.random() * 420 + 100;
            const col = COLORS[Math.floor(Math.random() * COLORS.length)]!;
            
            // Random window rows
            const winRows: { y: number; alpha: number }[] = [];
            const rowCount = Math.floor(bHeight / 28);
            for (let w = 1; w < rowCount; w++) {
              winRows.push({
                y: w * 28,
                alpha: Math.random() * 0.5 + 0.15,
              });
            }

            buildings.push({
              gridX: c * BLOCK_SIZE + (Math.random() - 0.5) * 25,
              gridZ: r * BLOCK_SIZE,
              width: Math.random() * 55 + 45,
              depth: Math.random() * 55 + 45,
              height: bHeight,
              color: col,
              roofBeam: Math.random() < 0.45,
              pulsePhase: Math.random() * Math.PI * 2,
              windows: winRows,
            });
          }
        }
      }

      // 2. Multi-tier High-Speed Laser Traffic (Ground & Skyways)
      for (let i = 0; i < 140; i++) {
        const isCrossStreet = Math.random() > 0.4;
        const altitude = Math.random() > 0.6 ? -(Math.random() * 180 + 40) : 60; // Skyway vs Ground
        const speed = Math.random() * 0.009 + 0.004;
        const col = Math.random() > 0.45 ? "#D4E84A" : "#22D3EE";

        if (isCrossStreet) {
          const row = Math.floor(Math.random() * CITY_ROWS);
          traffic.push({
            startX: (-CITY_COLS / 2) * BLOCK_SIZE,
            startZ: row * BLOCK_SIZE,
            endX: (CITY_COLS / 2) * BLOCK_SIZE,
            endZ: row * BLOCK_SIZE,
            altitude,
            t: Math.random(),
            speed,
            color: col,
            size: Math.random() * 2.5 + 1.4,
          });
        } else {
          const colX = (Math.floor(Math.random() * 6) - 3) * BLOCK_SIZE;
          traffic.push({
            startX: colX,
            startZ: 0,
            endX: colX,
            endZ: TOTAL_DEPTH,
            altitude,
            t: Math.random(),
            speed: speed * 1.3,
            color: col,
            size: Math.random() * 2.5 + 1.4,
          });
        }
      }

      // 3. Elevated Glowing Skyways connecting districts
      for (let i = 0; i < 8; i++) {
        const row = Math.floor(Math.random() * CITY_ROWS);
        skyways.push({
          x1: (-CITY_COLS / 2) * BLOCK_SIZE,
          z1: row * BLOCK_SIZE,
          x2: (CITY_COLS / 2) * BLOCK_SIZE,
          z2: row * BLOCK_SIZE,
          altitude: -(Math.random() * 160 + 60),
          color: Math.random() > 0.5 ? "rgba(212, 232, 74, 0.12)" : "rgba(34, 211, 238, 0.12)",
        });
      }
    };

    initCity();

    // 3D Projection Engine
    const project = (x: number, y: number, z: number, cx: number, cy: number) => {
      const fov = 380;
      if (z <= 1) return null;
      const scale = fov / z;
      return {
        x: cx + x * scale,
        y: cy + y * scale,
        scale,
      };
    };

    const draw = () => {
      // Continuous camera drive forward + scroll integration
      scrollY += (targetScrollY - scrollY) * 0.08;
      camZ = (camZ + 1.8 + scrollY * 0.015) % TOTAL_DEPTH;

      // Mouse parallax smooth damping
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      // Camera focal center spans full screen with scroll elevation
      const scrollTilt = Math.sin(scrollY * 0.001) * 30;
      const cx = width / 2 + mouse.x;
      const cy = height * 0.48 + mouse.y + scrollTilt;

      // 1. Full-bleed Cyber Aurora Atmosphere (Edge-to-Edge)
      const skyGrad = ctx.createRadialGradient(cx, cy - 100, 0, cx, cy - 100, width * 0.75);
      skyGrad.addColorStop(0, "rgba(34, 211, 238, 0.09)");
      skyGrad.addColorStop(0.4, "rgba(212, 232, 74, 0.04)");
      skyGrad.addColorStop(1, "transparent");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Full-depth Ground Highway Grid
      ctx.strokeStyle = "rgba(212, 232, 74, 0.045)";
      ctx.lineWidth = 1;
      const roadCount = CITY_COLS + 4;

      for (let c = -roadCount / 2; c <= roadCount / 2; c++) {
        const roadX = c * BLOCK_SIZE;
        const p1 = project(roadX, 80, 20, cx, cy);
        const p2 = project(roadX, 80, TOTAL_DEPTH * 0.95, cx, cy);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 3. Elevated Skyways
      ctx.globalCompositeOperation = "lighter";
      for (const sw of skyways) {
        let relZ = sw.z1 - camZ;
        while (relZ < 10) relZ += TOTAL_DEPTH;
        while (relZ > TOTAL_DEPTH) relZ -= TOTAL_DEPTH;

        const p1 = project(sw.x1, sw.altitude, relZ, cx, cy);
        const p2 = project(sw.x2, sw.altitude, relZ, cx, cy);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = 2.5 * p1.scale;
          ctx.stroke();
        }
      }

      // 4. Render 3D Buildings across entire height & depth
      const visibleBuildings = buildings
        .map((b) => {
          let relZ = b.gridZ - camZ;
          while (relZ < 10) relZ += TOTAL_DEPTH;
          while (relZ > TOTAL_DEPTH) relZ -= TOTAL_DEPTH;
          return { b, relZ };
        })
        .sort((a, b) => b.relZ - a.relZ);

      for (const item of visibleBuildings) {
        const { b, relZ } = item;
        const hw = b.width / 2;
        const hd = b.depth / 2;
        const baseY = 80;
        const topY = baseY - b.height;

        // 8 vertices of 3D box
        const p1 = project(b.gridX - hw, baseY, relZ - hd, cx, cy);
        const p2 = project(b.gridX + hw, baseY, relZ - hd, cx, cy);
        const p3 = project(b.gridX + hw, baseY, relZ + hd, cx, cy);
        const p4 = project(b.gridX - hw, baseY, relZ + hd, cx, cy);

        const p5 = project(b.gridX - hw, topY, relZ - hd, cx, cy);
        const p6 = project(b.gridX + hw, topY, relZ - hd, cx, cy);
        const p7 = project(b.gridX + hw, topY, relZ + hd, cx, cy);
        const p8 = project(b.gridX - hw, topY, relZ + hd, cx, cy);

        if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6 || !p7 || !p8) continue;

        const depthRatio = 1 - relZ / TOTAL_DEPTH;
        const depthAlpha = Math.max(0.06, Math.min(0.55, depthRatio * 0.6));

        // Dark glass building silhouette
        ctx.fillStyle = "rgba(10, 11, 16, 0.82)";

        // Front Face
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p6.x, p6.y);
        ctx.lineTo(p5.x, p5.y);
        ctx.closePath();
        ctx.fill();

        // Right Face
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p7.x, p7.y);
        ctx.lineTo(p6.x, p6.y);
        ctx.closePath();
        ctx.fill();

        // Top Roof Face
        ctx.beginPath();
        ctx.moveTo(p5.x, p5.y);
        ctx.lineTo(p6.x, p6.y);
        ctx.lineTo(p7.x, p7.y);
        ctx.lineTo(p8.x, p8.y);
        ctx.closePath();
        ctx.fillStyle = b.color + "22";
        ctx.fill();

        // Neon Wireframe Outlines
        ctx.strokeStyle = b.color.startsWith("#")
          ? b.color + Math.floor(depthAlpha * 255).toString(16).padStart(2, "0")
          : `rgba(212, 232, 74, ${depthAlpha})`;
        ctx.lineWidth = Math.max(0.8, p1.scale * 1.6);

        // Frame Edges
        [
          [p1, p2], [p2, p3], [p3, p4], [p4, p1],
          [p5, p6], [p6, p7], [p7, p8], [p8, p5],
          [p1, p5], [p2, p6], [p3, p7], [p4, p8],
        ].forEach(([va, vb]) => {
          ctx.beginPath();
          ctx.moveTo(va!.x, va!.y);
          ctx.lineTo(vb!.x, vb!.y);
          ctx.stroke();
        });

        // Glowing Windows / Floor Tiers
        for (const win of b.windows) {
          const wy = baseY - win.y;
          const wp1 = project(b.gridX - hw, wy, relZ - hd, cx, cy);
          const wp2 = project(b.gridX + hw, wy, relZ - hd, cx, cy);
          if (wp1 && wp2) {
            ctx.beginPath();
            ctx.moveTo(wp1.x, wp1.y);
            ctx.lineTo(wp2.x, wp2.y);
            ctx.strokeStyle = b.color + Math.floor(win.alpha * depthAlpha * 255).toString(16).padStart(2, "0");
            ctx.stroke();
          }
        }

        // Rooftop Laser Spire Shooting into Sky
        if (b.roofBeam) {
          const spireTop = project(b.gridX, topY - 70, relZ, cx, cy);
          const spireBase = project(b.gridX, topY, relZ, cx, cy);
          if (spireTop && spireBase) {
            ctx.beginPath();
            ctx.moveTo(spireBase.x, spireBase.y);
            ctx.lineTo(spireTop.x, spireTop.y);
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Spire Beacon Flare
            const bg = ctx.createRadialGradient(spireTop.x, spireTop.y, 0, spireTop.x, spireTop.y, 10);
            bg.addColorStop(0, b.color);
            bg.addColorStop(0.5, b.color + "50");
            bg.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(spireTop.x, spireTop.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = bg;
            ctx.fill();
          }
        }
      }

      // 5. Continuous Multi-Tier Highway Traffic Pulses (Ground & Sky)
      for (const tf of traffic) {
        tf.t = (tf.t + tf.speed) % 1;

        const curX = tf.startX + (tf.endX - tf.startX) * tf.t;
        let curZ = tf.startZ + (tf.endZ - tf.startZ) * tf.t - camZ;
        while (curZ < 10) curZ += TOTAL_DEPTH;
        while (curZ > TOTAL_DEPTH) curZ -= TOTAL_DEPTH;

        const pt = project(curX, tf.altitude, curZ, cx, cy);
        if (pt && pt.x > -40 && pt.x < width + 40 && pt.y > -40 && pt.y < height + 40) {
          const alpha = (1 - curZ / TOTAL_DEPTH) * 0.95;
          const sz = tf.size * pt.scale * 3.5;

          // Traffic light flare
          const tg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, sz * 4);
          tg.addColorStop(0, tf.color + "F0");
          tg.addColorStop(0.5, tf.color + "45");
          tg.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, sz * 4, 0, Math.PI * 2);
          ctx.fillStyle = tg;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, sz * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
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
