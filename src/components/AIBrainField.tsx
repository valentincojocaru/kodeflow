import { useEffect, useRef } from "react";

export default function AIBrainField({
  width = 520,
  height = 440,
}: {
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5); // cap at 1.5 instead of 2
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(DPR, DPR);

    let paused = false;
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    let mx = -9999, my = -9999, inside = false;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * (width / r.width);
      my = (e.clientY - r.top) * (height / r.height);
    };
    canvas.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("mouseenter", () => { inside = true; });
    canvas.addEventListener("mouseleave", () => { inside = false; mx = -9999; my = -9999; });

    const cx = width / 2, cy = height / 2 + 10;
    const FOV = 650;
    const RX = width * 0.34;
    const RY = height * 0.34;
    const RZ = width * 0.24;

    // Reduced from 420 → 300 particles (imperceptible at this size)
    const N = 300;
    const pax = new Float32Array(N);
    const pay = new Float32Array(N);
    const paz = new Float32Array(N);
    const px2d = new Float32Array(N);
    const py2d = new Float32Array(N);
    const pDepth = new Float32Array(N);
    const ox = new Float32Array(N);
    const oy = new Float32Array(N);
    const ovx = new Float32Array(N);
    const ovy = new Float32Array(N);
    const pHue = new Float32Array(N);
    const pSize = new Float32Array(N);
    const pPulse = new Float32Array(N);
    const pPulseSpd = new Float32Array(N);

    const goldenAngle = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const lat = Math.acos(1 - 2 * t);
      const lon = goldenAngle * i;
      const bump = 1 + 0.08 * Math.sin(lon * 4) * Math.sin(lat * 3) + 0.06 * Math.cos(lon * 3) * Math.sin(lat * 2) + 0.04 * Math.sin(lon * 7) * Math.cos(lat * 5);
      pax[i] = Math.sin(lat) * Math.cos(lon) * RX * bump;
      pay[i] = Math.cos(lat) * RY * (0.92 + 0.08 * Math.sin(lon * 2));
      paz[i] = Math.sin(lat) * Math.sin(lon) * RZ * bump;
      const yNorm = (pay[i] / RY + 1) / 2;
      const latNorm = (Math.cos(lat) + 1) / 2;
      pHue[i] = 195 + yNorm * 30 + latNorm * 50;
      pSize[i] = 1.1 + Math.random() * 1.1;
      pPulse[i] = Math.random() * Math.PI * 2;
      pPulseSpd[i] = 0.016 + Math.random() * 0.024;
    }

    // Pre-build connections
    const CONN_THRESH_SQ = 90 * 90;
    const connA: number[] = [];
    const connB: number[] = [];
    for (let i = 0; i < N; i++) {
      let cnt = 0;
      for (let j = i + 1; j < N && cnt < 3; j++) {
        const dx = pax[i] - pax[j];
        const dy = pay[i] - pay[j];
        const dz = paz[i] - paz[j];
        if (dx * dx + dy * dy + dz * dz < CONN_THRESH_SQ) {
          connA.push(i); connB.push(j); cnt++;
        }
      }
    }

    interface Pulse { ai: number; bi: number; t: number; spd: number; hue: number; }
    const travelers: Pulse[] = [];
    const spawnPulse = () => {
      if (connA.length === 0) return;
      const k = Math.floor(Math.random() * connA.length);
      travelers.push({ ai: connA[k], bi: connB[k], t: 0, spd: 0.013 + Math.random() * 0.018, hue: 180 + Math.random() * 80 });
    };

    const sortIdx = Array.from({ length: N }, (_, i) => i);
    let rotY = 0;
    let frame = 0;
    let rafId: number;
    let lastTime = 0;
    const TARGET_MS = 1000 / 45; // 45fps cap — imperceptible vs 60, saves ~25% CPU

    const REPEL_RADIUS = 110;
    const REPEL_FORCE = 7;
    const SPRING = 0.055;
    const FRICTION = 0.86;

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (paused) return;
      if (now - lastTime < TARGET_MS) return;
      lastTime = now;
      frame++;

      ctx.clearRect(0, 0, width, height);
      rotY += 0.0045;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      for (let i = 0; i < N; i++) {
        const rx = pax[i] * cosY - paz[i] * sinY;
        const rz = pax[i] * sinY + paz[i] * cosY;
        const ry = pay[i];
        const scale = FOV / (FOV + rz);
        px2d[i] = cx + rx * scale;
        py2d[i] = cy + ry * scale;
        pDepth[i] = rz;

        const sx2 = px2d[i] + ox[i];
        const sy2 = py2d[i] + oy[i];
        if (inside) {
          const dx = sx2 - mx, dy = sy2 - my;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < REPEL_RADIUS) {
            const str = ((1 - dist / REPEL_RADIUS) ** 1.5) * REPEL_FORCE;
            ovx[i] += (dx / dist) * str;
            ovy[i] += (dy / dist) * str;
          }
        }
        ovx[i] += (-ox[i]) * SPRING;
        ovy[i] += (-oy[i]) * SPRING;
        ovx[i] *= FRICTION;
        ovy[i] *= FRICTION;
        ox[i] += ovx[i];
        oy[i] += ovy[i];
        pPulse[i] += pPulseSpd[i];
      }

      // Sort every 3rd frame instead of 2nd
      if (frame % 3 === 0) {
        sortIdx.sort((a, b) => pDepth[b] - pDepth[a]);
      }

      // Aura
      const aura = ctx.createRadialGradient(cx, cy, 30, cx, cy, RX * 1.1);
      aura.addColorStop(0, "rgba(100, 160, 255, 0.06)");
      aura.addColorStop(0.5, "rgba(140, 80, 255, 0.04)");
      aura.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.ellipse(cx, cy, RX * 1.1, RY * 1.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();

      // Neural connections
      const numConn = connA.length;
      for (let k = 0; k < numConn; k++) {
        const ai = connA[k], bi = connB[k];
        if (pDepth[ai] > FOV * 0.8 && pDepth[bi] > FOV * 0.8) continue;
        const avgDepth = (pDepth[ai] + pDepth[bi]) / 2;
        const depthAlpha = Math.max(0, 0.22 - avgDepth * 0.00015);
        if (depthAlpha < 0.005) continue;
        const hue = (pHue[ai] + pHue[bi]) / 2;
        ctx.beginPath();
        ctx.moveTo(px2d[ai] + ox[ai], py2d[ai] + oy[ai]);
        ctx.lineTo(px2d[bi] + ox[bi], py2d[bi] + oy[bi]);
        ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${depthAlpha})`;
        ctx.lineWidth = 0.55;
        ctx.stroke();
      }

      // Pulse travelers
      for (let k = travelers.length - 1; k >= 0; k--) {
        const tr = travelers[k];
        tr.t += tr.spd;
        if (tr.t >= 1) { travelers.splice(k, 1); continue; }
        const ai = tr.ai, bi = tr.bi;
        const ex = px2d[ai] + ox[ai] + (px2d[bi] + ox[bi] - px2d[ai] - ox[ai]) * tr.t;
        const ey = py2d[ai] + oy[ai] + (py2d[bi] + oy[bi] - py2d[ai] - oy[ai]) * tr.t;
        const avgD = (pDepth[ai] + pDepth[bi]) / 2;
        const ps = FOV / (FOV + avgD);
        const pr = 5 * ps;
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, pr);
        eg.addColorStop(0, `hsla(${tr.hue}, 100%, 88%, 1)`);
        eg.addColorStop(0.4, `hsla(${tr.hue}, 90%, 70%, 0.6)`);
        eg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(ex, ey, pr, 0, Math.PI * 2);
        ctx.fillStyle = eg;
        ctx.fill();
      }

      // Particles — skip gradient for back-facing (scale < 0.4), use simple fill+shadow
      for (const i of sortIdx) {
        const rz = pDepth[i];
        const scale = FOV / (FOV + rz);
        if (scale < 0.18) continue;

        const spx = px2d[i] + ox[i];
        const spy = py2d[i] + oy[i];
        const pulseF = 0.82 + Math.sin(pPulse[i]) * 0.18;
        const sz = pSize[i] * scale * pulseF;
        const hue = pHue[i];
        const depthA = Math.max(0.08, Math.min(1, (scale - 0.25) * 1.6));
        const alpha = depthA * (0.65 + Math.sin(pPulse[i]) * 0.25);

        // Only draw expensive gradient glow for front-facing particles
        if (scale > 0.5) {
          const glowR = sz * (3.5 + Math.sin(pPulse[i]) * 0.8);
          const grad = ctx.createRadialGradient(spx, spy, 0, spx, spy, glowR);
          grad.addColorStop(0, `hsla(${hue}, 92%, 74%, ${alpha * 0.9})`);
          grad.addColorStop(0.5, `hsla(${hue}, 85%, 60%, ${alpha * 0.35})`);
          grad.addColorStop(1, `hsla(${hue}, 80%, 55%, 0)`);
          ctx.beginPath();
          ctx.arc(spx, spy, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(spx, spy, Math.max(sz * 0.55, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + 20}, 100%, 90%, ${alpha})`;
        ctx.fill();
      }

      // Mouse ring
      if (inside && mx > 0) {
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, REPEL_RADIUS);
        mg.addColorStop(0, "rgba(180, 120, 255, 0.09)");
        mg.addColorStop(0.6, "rgba(100, 180, 255, 0.04)");
        mg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, REPEL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = mg;
        ctx.fill();
      }

      // Spawn pulse every 12 frames instead of 10
      if (frame % 12 === 0) spawnPulse();
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [width, height]);

  return <canvas ref={canvasRef} className="select-none" style={{ willChange: "transform" }} />;
}
