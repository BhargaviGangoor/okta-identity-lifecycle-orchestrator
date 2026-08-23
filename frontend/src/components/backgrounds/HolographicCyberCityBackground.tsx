import { useEffect, useRef } from "react";

interface Building {
  gridX: number;
  gridZ: number;
  width: number;
  depth: number;
  topY: number;
  baseY: number;
  color: string;
  roofBeam: boolean;
  pulsePhase: number;
  windowTiers: { y: number; alpha: number }[];
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

interface SkySearchBeam {
  x: number;
  z: number;
  angle: number;
  rotSpeed: number;
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

    const CITY_COLS = 22;
    const CITY_ROWS = 36;
    const BLOCK_SIZE = 160;
    const TOTAL_DEPTH = CITY_ROWS * BLOCK_SIZE;

    let buildings: Building[] = [];
    let traffic: TrafficPacket[] = [];
    let searchBeams: SkySearchBeam[] = [];

    const COLORS = ["#D4E84A", "#22D3EE", "#38BDF8", "#E8703A", "#A855F7"];

    const initCity = () => {
      buildings = [];
      traffic = [];
      searchBeams = [];

      // 1. Generate 3D Megacity Buildings spanning full vertical altitude
      for (let r = 0; r < CITY_ROWS; r++) {
        for (let c = -CITY_COLS / 2; c <= CITY_COLS / 2; c++) {
          // Leave open central expressways
          if (c === 0 || c === -1) continue;

          if (Math.random() < 0.75) {
            const bWidth = Math.random() * 60 + 50;
            const bDepth = Math.random() * 60 + 50;
            const baseY = 240; // Deep ground floor below eye level
            const bHeight = Math.random() * 650 + 250; // Towering skyscrapers reaching high into sky
            const topY = baseY - bHeight;
            const col = COLORS[Math.floor(Math.random() * COLORS.length)]!;

            const winRows: { y: number; alpha: number }[] = [];
            const rowCount = Math.floor(bHeight / 30);
            for (let w = 1; w < rowCount; w++) {
              winRows.push({
                y: baseY - w * 30,
                alpha: Math.random() * 0.6 + 0.15,
              });
            }

            buildings.push({
              gridX: c * BLOCK_SIZE + (Math.random() - 0.5) * 30,
              gridZ: r * BLOCK_SIZE,
              width: bWidth,
              depth: bDepth,
              baseY,
              topY,
              color: col,
              roofBeam: Math.random() < 0.5,
              pulsePhase: Math.random() * Math.PI * 2,
              windowTiers: winRows,
            });
          }
        }
      }

      // 2. High-Density Flying Laser Traffic across TOP, MIDDLE & BOTTOM altitudes
      for (let i = 0; i < 180; i++) {
        const isCrossStreet = Math.random() > 0.45;
        // Altitudes: High Skyways (-300px), Mid Skyways (-80px), Ground Expressways (+220px)
        const altChoice = Math.random();
        const altitude =
          altChoice < 0.35
            ? -(Math.random() * 250 + 100) // High Sky (Top of screen)
            : altChoice < 0.7
            ? (Math.random() - 0.5) * 100   // Mid Sky (Middle of screen)
            : Math.random() * 60 + 180;    // Ground Highway (Bottom of screen)

        const speed = Math.random() * 0.012 + 0.005;
        const col = Math.random() > 0.4 ? "#D4E84A" : "#22D3EE";

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
            size: Math.random() * 2.8 + 1.5,
          });
        } else {
          const colX = (Math.floor(Math.random() * 8) - 4) * BLOCK_SIZE;
          traffic.push({
            startX: colX,
            startZ: 0,
            endX: colX,
            endZ: TOTAL_DEPTH,
            altitude,
            t: Math.random(),
            speed: speed * 1.4,
            color: col,
            size: Math.random() * 2.8 + 1.5,
          });
        }
      }

      // 3. Volumetric Searchlight Beams across whole sky
      for (let i = 0; i < 12; i++) {
        searchBeams.push({
          x: (Math.random() - 0.5) * (CITY_COLS * BLOCK_SIZE * 0.8),
          z: Math.random() * TOTAL_DEPTH,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          color: Math.random() > 0.5 ? "rgba(212, 232, 74, 0.16)" : "rgba(34, 211, 238, 0.16)",
        });
      }
    };

    initCity();

    // 3D Perspective Projection
    const project = (x: number, y: number, z: number, cx: number, cy: number) => {
      const fov = 420;
      if (z <= 1) return null;
      const scale = fov / z;
      return {
        x: cx + x * scale,
        y: cy + y * scale,
        scale,
      };
    };

    const draw = () => {
      // Continuous camera drive forward + scroll acceleration
      scrollY += (targetScrollY - scrollY) * 0.08;
      camZ = (camZ + 2.0 + scrollY * 0.02) % TOTAL_DEPTH;

      // Mouse parallax
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      // Camera center spanning full screen
      const cx = width / 2 + mouse.x;
      const cy = height * 0.5 + mouse.y;

      // 1. Edge-to-Edge Ambient Cyber Atmosphere
      const skyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.85);
      skyGrad.addColorStop(0, "rgba(34, 211, 238, 0.08)");
      skyGrad.addColorStop(0.5, "rgba(212, 232, 74, 0.03)");
      skyGrad.addColorStop(1, "transparent");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Full-depth Ground Highway Matrix
      ctx.strokeStyle = "rgba(212, 232, 74, 0.05)";
      ctx.lineWidth = 1;
      const roadCount = CITY_COLS + 6;

      for (let c = -roadCount / 2; c <= roadCount / 2; c++) {
        const roadX = c * BLOCK_SIZE;
        const p1 = project(roadX, 240, 30, cx, cy);
        const p2 = project(roadX, 240, TOTAL_DEPTH * 0.95, cx, cy);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 3. Volumetric Searchlight Beams (Full Sky Height)
      ctx.globalCompositeOperation = "lighter";
      for (const sb of searchBeams) {
        sb.angle += sb.rotSpeed;
        let relZ = sb.z - camZ;
        while (relZ < 10) relZ += TOTAL_DEPTH;
        while (relZ > TOTAL_DEPTH) relZ -= TOTAL_DEPTH;

        const base = project(sb.x, 200, relZ, cx, cy);
        const topX = sb.x + Math.sin(sb.angle) * 450;
        const topY = -700; // Shoots all the way to top of viewport
        const top = project(topX, topY, relZ * 0.85, cx, cy);

        if (base && top) {
          ctx.beginPath();
          ctx.moveTo(base.x - 8 * base.scale, base.y);
          ctx.lineTo(top.x - 45 * top.scale, top.y);
          ctx.lineTo(top.x + 45 * top.scale, top.y);
          ctx.lineTo(base.x + 8 * base.scale, base.y);
          ctx.closePath();
          ctx.fillStyle = sb.color;
          ctx.fill();
        }
      }

      // 4. Render 3D Megacity Buildings (Sorted from Far to Near)
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

        // 8 vertices of 3D box
        const p1 = project(b.gridX - hw, b.baseY, relZ - hd, cx, cy);
        const p2 = project(b.gridX + hw, b.baseY, relZ - hd, cx, cy);
        const p3 = project(b.gridX + hw, b.baseY, relZ + hd, cx, cy);
        const p4 = project(b.gridX - hw, b.baseY, relZ + hd, cx, cy);

        const p5 = project(b.gridX - hw, b.topY, relZ - hd, cx, cy);
        const p6 = project(b.gridX + hw, b.topY, relZ - hd, cx, cy);
        const p7 = project(b.gridX + hw, b.topY, relZ + hd, cx, cy);
        const p8 = project(b.gridX - hw, b.topY, relZ + hd, cx, cy);

        if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6 || !p7 || !p8) continue;

        const depthRatio = 1 - relZ / TOTAL_DEPTH;
        const depthAlpha = Math.max(0.08, Math.min(0.65, depthRatio * 0.75));

        // Dark glass building silhouette
        ctx.fillStyle = "rgba(10, 11, 16, 0.85)";

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
        ctx.fillStyle = b.color + "25";
        ctx.fill();

        // Neon Wireframe Outlines
        ctx.strokeStyle = b.color.startsWith("#")
          ? b.color + Math.floor(depthAlpha * 255).toString(16).padStart(2, "0")
          : `rgba(212, 232, 74, ${depthAlpha})`;
        ctx.lineWidth = Math.max(0.9, p1.scale * 1.8);

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

        // Glowing Window Tiers
        for (const win of b.windowTiers) {
          const wp1 = project(b.gridX - hw, win.y, relZ - hd, cx, cy);
          const wp2 = project(b.gridX + hw, win.y, relZ - hd, cx, cy);
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
          const spireTop = project(b.gridX, b.topY - 120, relZ, cx, cy);
          const spireBase = project(b.gridX, b.topY, relZ, cx, cy);
          if (spireTop && spireBase) {
            ctx.beginPath();
            ctx.moveTo(spireBase.x, spireBase.y);
            ctx.lineTo(spireTop.x, spireTop.y);
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 2.0;
            ctx.stroke();

            // Spire Beacon Flare
            const bg = ctx.createRadialGradient(spireTop.x, spireTop.y, 0, spireTop.x, spireTop.y, 14);
            bg.addColorStop(0, b.color);
            bg.addColorStop(0.5, b.color + "60");
            bg.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(spireTop.x, spireTop.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = bg;
            ctx.fill();
          }
        }
      }

      // 5. Continuous Multi-Tier Highway Traffic (Top, Middle & Bottom)
      for (const tf of traffic) {
        tf.t = (tf.t + tf.speed) % 1;

        const curX = tf.startX + (tf.endX - tf.startX) * tf.t;
        let curZ = tf.startZ + (tf.endZ - tf.startZ) * tf.t - camZ;
        while (curZ < 10) curZ += TOTAL_DEPTH;
        while (curZ > TOTAL_DEPTH) curZ -= TOTAL_DEPTH;

        const pt = project(curX, tf.altitude, curZ, cx, cy);
        if (pt && pt.x > -60 && pt.x < width + 60 && pt.y > -60 && pt.y < height + 60) {
          const sz = tf.size * pt.scale * 4.0;

          // Traffic light flare
          const tg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, sz * 4);
          tg.addColorStop(0, tf.color + "F5");
          tg.addColorStop(0.4, tf.color + "50");
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
