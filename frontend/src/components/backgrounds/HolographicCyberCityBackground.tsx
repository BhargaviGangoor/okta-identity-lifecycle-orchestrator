import { useEffect, useRef } from "react";

interface Building {
  gridX: number; // grid coordinate X
  gridZ: number; // grid coordinate Z
  width: number;
  depth: number;
  height: number;
  color: string;
  roofBeam: boolean;
  pulsePhase: number;
}

interface TrafficParticle {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  t: number;
  speed: number;
  color: string;
  size: number;
}

interface SearchBeam {
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
    let mouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX - width / 2) * 0.35;
      targetMouse.y = (e.clientY - height / 2) * 0.25;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initCity();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const CITY_COLS = 16;
    const CITY_ROWS = 28;
    const BLOCK_SIZE = 140;
    const TOTAL_DEPTH = CITY_ROWS * BLOCK_SIZE;

    let buildings: Building[] = [];
    let traffic: TrafficParticle[] = [];
    let searchBeams: SearchBeam[] = [];

    const COLORS = ["#D4E84A", "#22D3EE", "#38BDF8", "#E8703A", "#A855F7"];

    const initCity = () => {
      buildings = [];
      traffic = [];
      searchBeams = [];

      for (let r = 0; r < CITY_ROWS; r++) {
        for (let c = -CITY_COLS / 2; c <= CITY_COLS / 2; c++) {
          // Leave open street avenues in center
          if (c === 0 || c === -1) continue;

          // Randomly place buildings
          if (Math.random() < 0.65) {
            const h = Math.random() * 260 + 60;
            const col = COLORS[Math.floor(Math.random() * COLORS.length)]!;
            buildings.push({
              gridX: c * BLOCK_SIZE + (Math.random() - 0.5) * 20,
              gridZ: r * BLOCK_SIZE,
              width: Math.random() * 45 + 40,
              depth: Math.random() * 45 + 40,
              height: h,
              color: col,
              roofBeam: Math.random() < 0.35,
              pulsePhase: Math.random() * Math.PI * 2,
            });
          }
        }
      }

      // Highway Traffic Particles
      for (let i = 0; i < 90; i++) {
        const isCrossStreet = Math.random() > 0.5;
        const speed = Math.random() * 0.008 + 0.004;
        const col = Math.random() > 0.4 ? "#D4E84A" : "#22D3EE";

        if (isCrossStreet) {
          const row = Math.floor(Math.random() * CITY_ROWS);
          traffic.push({
            startX: (-CITY_COLS / 2) * BLOCK_SIZE,
            startZ: row * BLOCK_SIZE,
            endX: (CITY_COLS / 2) * BLOCK_SIZE,
            endZ: row * BLOCK_SIZE,
            t: Math.random(),
            speed,
            color: col,
            size: Math.random() * 2.2 + 1.2,
          });
        } else {
          traffic.push({
            startX: 0,
            startZ: 0,
            endX: 0,
            endZ: TOTAL_DEPTH,
            t: Math.random(),
            speed,
            color: col,
            size: Math.random() * 2.2 + 1.2,
          });
        }
      }

      // Searchlight beams
      for (let i = 0; i < 8; i++) {
        searchBeams.push({
          x: (Math.random() - 0.5) * (CITY_COLS * BLOCK_SIZE * 0.7),
          z: Math.random() * TOTAL_DEPTH,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          color: Math.random() > 0.5 ? "rgba(212, 232, 74, 0.14)" : "rgba(34, 211, 238, 0.14)",
        });
      }
    };

    initCity();

    // 3D Projection Helper
    const project = (x: number, y: number, z: number, cx: number, cy: number) => {
      const fov = 340;
      if (z <= 1) return null;
      const scale = fov / z;
      return {
        x: cx + x * scale,
        y: cy + y * scale,
        scale,
      };
    };

    const draw = () => {
      // Continuous camera forward flight motion
      camZ = (camZ + 1.6) % TOTAL_DEPTH;

      // Mouse parallax smooth damping
      mouse.x += (targetMouse.x - mouse.x) * 0.04;
      mouse.y += (targetMouse.y - mouse.y) * 0.04;

      ctx.fillStyle = "#08090C";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + mouse.x;
      const cy = height * 0.42 + mouse.y;

      // 1. Skyline Aurora Nebula
      const skyGrad = ctx.createRadialGradient(cx, cy - 80, 0, cx, cy - 80, width * 0.65);
      skyGrad.addColorStop(0, "rgba(34, 211, 238, 0.06)");
      skyGrad.addColorStop(0.5, "rgba(212, 232, 74, 0.03)");
      skyGrad.addColorStop(1, "transparent");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Ground Grid Lines (Perspective roads)
      ctx.strokeStyle = "rgba(212, 232, 74, 0.04)";
      ctx.lineWidth = 1;
      const roadCount = CITY_COLS + 2;

      for (let c = -roadCount / 2; c <= roadCount / 2; c++) {
        const roadX = c * BLOCK_SIZE;
        const p1 = project(roadX, 80, 40, cx, cy);
        const p2 = project(roadX, 80, TOTAL_DEPTH * 0.9, cx, cy);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 3. Searchlight Beams in the sky
      ctx.globalCompositeOperation = "lighter";
      for (const sb of searchBeams) {
        sb.angle += sb.rotSpeed;
        let relZ = sb.z - camZ;
        if (relZ < 10) relZ += TOTAL_DEPTH;
        if (relZ > TOTAL_DEPTH) relZ -= TOTAL_DEPTH;

        const base = project(sb.x, 60, relZ, cx, cy);
        const topX = sb.x + Math.sin(sb.angle) * 350;
        const topY = -450;
        const top = project(topX, topY, relZ * 0.9, cx, cy);

        if (base && top) {
          ctx.beginPath();
          ctx.moveTo(base.x - 6 * base.scale, base.y);
          ctx.lineTo(top.x - 35 * top.scale, top.y);
          ctx.lineTo(top.x + 35 * top.scale, top.y);
          ctx.lineTo(base.x + 6 * base.scale, base.y);
          ctx.closePath();
          ctx.fillStyle = sb.color;
          ctx.fill();
        }
      }

      // 4. Render 3D Buildings sorted by Depth (Far to Near)
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

        // Project 8 vertices of 3D box
        const p1 = project(b.gridX - hw, baseY, relZ - hd, cx, cy);
        const p2 = project(b.gridX + hw, baseY, relZ - hd, cx, cy);
        const p3 = project(b.gridX + hw, baseY, relZ + hd, cx, cy);
        const p4 = project(b.gridX - hw, baseY, relZ + hd, cx, cy);

        const p5 = project(b.gridX - hw, topY, relZ - hd, cx, cy);
        const p6 = project(b.gridX + hw, topY, relZ - hd, cx, cy);
        const p7 = project(b.gridX + hw, topY, relZ + hd, cx, cy);
        const p8 = project(b.gridX - hw, topY, relZ + hd, cx, cy);

        if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6 || !p7 || !p8) continue;

        const depthAlpha = Math.max(0.04, Math.min(0.4, (1 - relZ / TOTAL_DEPTH) * 0.45));

        // Dark glass building fill
        ctx.fillStyle = "rgba(10, 11, 15, 0.75)";

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
        ctx.fillStyle = b.color + "18";
        ctx.fill();

        // Wireframe edges
        ctx.strokeStyle = b.color.startsWith("#")
          ? b.color + Math.floor(depthAlpha * 255).toString(16).padStart(2, "0")
          : `rgba(212, 232, 74, ${depthAlpha})`;
        ctx.lineWidth = 1;

        // Draw outer frame
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

        // Floor tier lines
        const tiers = 3;
        for (let t = 1; t <= tiers; t++) {
          const ty = baseY - (b.height * (t / (tiers + 1)));
          const tp1 = project(b.gridX - hw, ty, relZ - hd, cx, cy);
          const tp2 = project(b.gridX + hw, ty, relZ - hd, cx, cy);
          const tp3 = project(b.gridX + hw, ty, relZ + hd, cx, cy);
          if (tp1 && tp2 && tp3) {
            ctx.beginPath();
            ctx.moveTo(tp1.x, tp1.y);
            ctx.lineTo(tp2.x, tp2.y);
            ctx.lineTo(tp3.x, tp3.y);
            ctx.strokeStyle = `rgba(212, 232, 74, ${depthAlpha * 0.5})`;
            ctx.stroke();
          }
        }

        // Rooftop Laser Spire
        if (b.roofBeam) {
          const spireTop = project(b.gridX, topY - 50, relZ, cx, cy);
          const spireBase = project(b.gridX, topY, relZ, cx, cy);
          if (spireTop && spireBase) {
            ctx.beginPath();
            ctx.moveTo(spireBase.x, spireBase.y);
            ctx.lineTo(spireTop.x, spireTop.y);
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Spire beacon flash
            const bg = ctx.createRadialGradient(spireTop.x, spireTop.y, 0, spireTop.x, spireTop.y, 8);
            bg.addColorStop(0, b.color);
            bg.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(spireTop.x, spireTop.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = bg;
            ctx.fill();
          }
        }
      }

      // 5. Continuous Highway Traffic Data Pulses
      for (const tf of traffic) {
        tf.t = (tf.t + tf.speed) % 1;

        const curX = tf.startX + (tf.endX - tf.startX) * tf.t;
        let curZ = tf.startZ + (tf.endZ - tf.startZ) * tf.t - camZ;
        while (curZ < 10) curZ += TOTAL_DEPTH;
        while (curZ > TOTAL_DEPTH) curZ -= TOTAL_DEPTH;

        const pt = project(curX, 78, curZ, cx, cy);
        if (pt && pt.x > -20 && pt.x < width + 20 && pt.y > -20 && pt.y < height + 20) {
          const alpha = (1 - curZ / TOTAL_DEPTH) * 0.9;
          const sz = tf.size * pt.scale * 3;

          // Traffic light flare
          const tg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, sz * 4);
          tg.addColorStop(0, tf.color + "E0");
          tg.addColorStop(0.5, tf.color + "40");
          tg.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, sz * 4, 0, Math.PI * 2);
          ctx.fillStyle = tg;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, sz * 0.7, 0, Math.PI * 2);
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
