import { useEffect, useRef } from "react";

interface P3 { x: number; y: number; z: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; warm: boolean }

function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${r},${g},${b},${a})`;
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Cap AI holografic dintr-un nor de puncte 3D + rețea neuronală fină.
 * Totul în blending aditiv, fără contururi dure — se topește în fundalul violet.
 */
export default function AiRobotScene({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    let raf = 0, t = 0, running = false;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let mx = 0.5, my = 0.5;          // target mouse
    let cmx = 0.5, cmy = 0.5;        // smoothed mouse
    let W = 0, H = 0;

    // ── Build a head-shaped 3D point cloud (Fibonacci sphere, deformed) ──────
    const N = 1150;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts: P3[] = [];
    for (let i = 0; i < N; i++) {
      let y = 1 - 2 * (i + 0.5) / N;        // 1 → -1
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      let x = Math.cos(th) * r;
      let z = Math.sin(th) * r;

      // proportions: narrower width, full height, good depth
      x *= 0.80; z *= 0.92; y *= 1.06;

      // jaw taper — narrow the lower half toward the chin
      if (y < 0) {
        const taper = 1 + y * 0.42;         // 1 at y=0 → 0.58 at y=-1
        x *= taper; z *= taper * 0.96;
      }
      // gentle crown lift + slight face flattening at the very front
      if (z > 0.55 && Math.abs(y) < 0.45) z *= 0.93;

      pts.push({ x, y, z });
    }

    // ── Precompute a sparse "neural" mesh (nearest-neighbour links) ──────────
    const links: [number, number][] = [];
    const step = 7; // only every Nth point participates → keeps it light & airy
    for (let i = 0; i < N; i += step) {
      let best = -1, bd = Infinity;
      for (let j = 0; j < N; j += step) {
        if (i === j) continue;
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bd) { bd = d; best = j; }
      }
      if (best > i && bd < 0.09) links.push([i, best]);
    }

    // eye anchors in head-local space (front face)
    const eyes: P3[] = [
      { x: -0.30, y: 0.13, z: 0.88 },
      { x: 0.30, y: 0.13, z: 0.88 },
    ];

    // ── Ambient particles ───────────────────────────────────────────────────
    const PARTS: Particle[] = [];
    function spawnPart(cx: number, cy: number, S: number) {
      const a = Math.random() * Math.PI * 2, rr = S * (0.3 + Math.random() * 1.1);
      PARTS.push({
        x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * 0.8,
        vx: (Math.random() - .5) * .25, vy: -.25 - Math.random() * .55,
        life: 90 + Math.random() * 120, maxLife: 90 + Math.random() * 120,
        size: .6 + Math.random() * 1.4, warm: Math.random() < .35,
      });
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.offsetWidth || 520;
      H = canvas.offsetHeight || 620;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function onMove(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
    }
    window.addEventListener("mousemove", onMove);

    // projected scratch buffers
    const sx = new Float32Array(N), sy = new Float32Array(N);
    const sa = new Float32Array(N), ss = new Float32Array(N), sd = new Float32Array(N);
    const scr = new Uint8Array(N); // on-screen / front flag

    function project(p: P3, ca: number, sai: number, cb: number, sbi: number,
                     cx: number, cy: number, S: number, f: number) {
      // rotate Y
      const x1 = p.x * ca + p.z * sai;
      const z1 = -p.x * sai + p.z * ca;
      // rotate X
      const y1 = p.y * cb - z1 * sbi;
      const z2 = p.y * sbi + z1 * cb;
      const proj = f / (f - z2);
      return {
        X: cx + x1 * S * proj,
        Y: cy - y1 * S * proj,
        Z: z2,
        proj,
      };
    }

    function frame() {
      t += 0.01;
      cmx += (mx - cmx) * 0.05;
      cmy += (my - cmy) * 0.05;

      ctx.clearRect(0, 0, W, H);

      const S = Math.min(W, H) * 0.30;
      const cx = W / 2 + (cmx - 0.5) * 26;
      const cy = H / 2 + Math.sin(t * 0.6) * 7 + (cmy - 0.5) * 14;
      const f = 2.7;
      const a = t * 0.16 + (cmx - 0.5) * 0.8;           // yaw
      const b = (cmy - 0.5) * 0.45 + Math.sin(t * 0.5) * 0.04; // pitch
      const ca = Math.cos(a), sai = Math.sin(a), cb = Math.cos(b), sbi = Math.sin(b);
      const edgeR = Math.min(W, H) * 0.52;

      // ── soft nebula ambiance (normal blend, behind everything) ──
      const neb = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 2.6);
      neb.addColorStop(0, rgba(70, 40, 130, 0.12));
      neb.addColorStop(0.45, rgba(45, 25, 90, 0.06));
      neb.addColorStop(1, "transparent");
      ctx.fillStyle = neb;
      ctx.beginPath(); ctx.arc(cx, cy, S * 2.6, 0, Math.PI * 2); ctx.fill();

      const warmGlow = ctx.createRadialGradient(cx, cy - S * 0.05, 0, cx, cy - S * 0.05, S * 1.2);
      warmGlow.addColorStop(0, rgba(249, 115, 22, 0.07));
      warmGlow.addColorStop(1, "transparent");
      ctx.fillStyle = warmGlow;
      ctx.beginPath(); ctx.arc(cx, cy - S * 0.05, S * 1.2, 0, Math.PI * 2); ctx.fill();

      // everything glowing uses additive blending → it melts/blooms
      ctx.globalCompositeOperation = "lighter";

      // ── pulsing core (the "mind") ──
      const corePulse = 0.6 + 0.4 * Math.sin(t * 1.6);
      const core = ctx.createRadialGradient(cx, cy - S * 0.02, 0, cx, cy - S * 0.02, S * 0.7);
      core.addColorStop(0, rgba(255, 170, 80, 0.16 * corePulse));
      core.addColorStop(0.4, rgba(150, 70, 230, 0.08 * corePulse));
      core.addColorStop(1, "transparent");
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy - S * 0.02, S * 0.7, 0, Math.PI * 2); ctx.fill();

      // ── project all points ──
      for (let i = 0; i < N; i++) {
        const pr = project(pts[i], ca, sai, cb, sbi, cx, cy, S, f);
        sx[i] = pr.X; sy[i] = pr.Y; sd[i] = pr.Z;
        const dn = Math.min(1, Math.max(0, (pr.Z + 1.1) / 2.2)); // depth 0..1
        const dd = Math.hypot(pr.X - cx, pr.Y - cy) / edgeR;
        const edge = Math.max(0, 1 - Math.max(0, dd - 0.5) / 0.62); // melt at edges
        sa[i] = (0.12 + 0.78 * dn) * edge;
        ss[i] = (0.5 + 1.5 * pr.proj) * (0.45 + 0.6 * dn);
        scr[i] = edge > 0.02 ? 1 : 0;
      }

      // ── neural mesh lines (front-biased, very faint) ──
      ctx.lineWidth = 0.6;
      for (const [i, j] of links) {
        if (!scr[i] || !scr[j]) continue;
        const dn = ((sd[i] + sd[j]) * 0.5 + 1.1) / 2.2;
        if (dn < 0.42) continue;
        const al = Math.min(sa[i], sa[j]) * dn * 0.5;
        if (al < 0.012) continue;
        const lg = ctx.createLinearGradient(sx[i], sy[i], sx[j], sy[j]);
        lg.addColorStop(0, rgba(150, 90, 235, al));
        lg.addColorStop(0.5, rgba(249, 130, 60, al * 0.7));
        lg.addColorStop(1, rgba(150, 90, 235, al));
        ctx.strokeStyle = lg;
        ctx.beginPath(); ctx.moveTo(sx[i], sy[i]); ctx.lineTo(sx[j], sy[j]); ctx.stroke();
      }

      // ── point cloud ──
      for (let i = 0; i < N; i++) {
        if (!scr[i]) continue;
        const dn = Math.min(1, Math.max(0, (sd[i] + 1.1) / 2.2));
        const r = lerp(118, 255, dn * dn);
        const g = lerp(58, 150, dn * dn * dn);
        const bl = lerp(212, 95, dn);
        ctx.fillStyle = rgba(r | 0, g | 0, bl | 0, sa[i]);
        ctx.beginPath(); ctx.arc(sx[i], sy[i], ss[i], 0, Math.PI * 2); ctx.fill();
      }

      // ── eyes (the focal wow) ──
      const eyePulse = 0.65 + 0.35 * Math.sin(t * 2.0);
      for (const e of eyes) {
        const pr = project(e, ca, sai, cb, sbi, cx, cy, S, f);
        if (pr.Z <= 0.05) continue; // only when facing us
        const face = Math.min(1, (pr.Z - 0.05) / 0.6);
        const rad = S * 0.17 * pr.proj;
        const halo = ctx.createRadialGradient(pr.X, pr.Y, 0, pr.X, pr.Y, rad);
        halo.addColorStop(0, rgba(255, 200, 110, 0.85 * eyePulse * face));
        halo.addColorStop(0.25, rgba(249, 115, 22, 0.55 * eyePulse * face));
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(pr.X, pr.Y, rad, 0, Math.PI * 2); ctx.fill();
        // bright pupil
        ctx.fillStyle = rgba(255, 245, 220, 0.95 * eyePulse * face);
        ctx.beginPath(); ctx.arc(pr.X, pr.Y, 2.1 * pr.proj, 0, Math.PI * 2); ctx.fill();
      }

      // ── ambient particles ──
      if (PARTS.length < 60 && Math.random() < 0.5) spawnPart(cx, cy, S);
      for (let i = PARTS.length - 1; i >= 0; i--) {
        const p = PARTS[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) { PARTS.splice(i, 1); continue; }
        const al = (p.life / p.maxLife) * 0.5;
        ctx.fillStyle = p.warm ? rgba(249, 140, 60, al) : rgba(150, 95, 235, al);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      if (running) raf = requestAnimationFrame(frame);
    }

    let visible = false;
    function start() {
      if (running || !visible || document.hidden) return;
      if (reduce) { frame(); return; } // single static frame, no loop
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    // Pause whenever the canvas is offscreen (covers `hidden lg:block` on mobile
    // and scroll-out-of-view) so we never burn CPU on an invisible animation.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    }, { threshold: 0 });
    io.observe(canvas);

    function onVis() { document.hidden ? stop() : start(); }
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ display: "block", background: "transparent" }}
    />
  );
}
