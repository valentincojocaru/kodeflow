import { useEffect, useRef } from "react";

interface V3 { x: number; y: number; z: number }

const rotY = (v: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
};
const rotX = (v: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
};
const rotZ = (v: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
};
const proj = (v: V3, cx: number, cy: number, fov: number): [number, number, number] => {
  const z = v.z + fov;
  const s = z > 1 ? fov / z : 0;
  return [v.x * s + cx, v.y * s + cy, s];
};

function makeIco(r: number): { verts: V3[]; edges: [number, number][] } {
  const phi = (1 + Math.sqrt(5)) / 2;
  const L = Math.sqrt(1 + phi * phi);
  const raw: [number, number, number][] = [
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1],
  ];
  const verts: V3[] = raw.map(([x, y, z]) => ({
    x: (x / L) * r, y: (y / L) * r, z: (z / L) * r,
  }));
  const edges: [number, number][] = [];
  const thr = (r * 1.2) ** 2;
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++) {
      const dx = verts[i].x - verts[j].x, dy = verts[i].y - verts[j].y, dz = verts[i].z - verts[j].z;
      if (dx * dx + dy * dy + dz * dz < thr) edges.push([i, j]);
    }
  return { verts, edges };
}

function makeRing(radius: number, segs: number, tX: number, tZ: number): V3[] {
  return Array.from({ length: segs + 1 }, (_, i) => {
    const a = (i / segs) * Math.PI * 2;
    return rotZ(rotX({ x: radius * Math.cos(a), y: radius * Math.sin(a), z: 0 }, tX), tZ);
  });
}

export default function HeroScene3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = canvas.offsetWidth || 600;
    let h = canvas.offsetHeight || 600;

    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const getR  = () => Math.min(w, h) * 0.26;
    const getFov = () => Math.min(w, h) * 1.35;

    const { verts: icoV, edges: icoE } = makeIco(getR());

    const ringDefs = [
      { tilt: [0.25, 0],   color: "#9333ea", op: 0.82, lw: 0.8,  rMul: 1.44 },
      { tilt: [1.1,  0.5], color: "#f97316", op: 0.38, lw: 0.55, rMul: 1.76 },
      { tilt: [-0.5, 1.0], color: "#b855ff", op: 0.22, lw: 0.4,  rMul: 2.18 },
    ];

    const NPTS = 500;
    const ptsData: { v: V3; color: string; phase: number }[] = Array.from({ length: NPTS }, () => {
      const r = getR() * 1.4 + Math.random() * getR() * 2.6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      return {
        v: { x: r * Math.sin(ph) * Math.cos(th), y: r * Math.sin(ph) * Math.sin(th), z: r * Math.cos(ph) },
        color: Math.random() > 0.45 ? "#b855ff" : "#f97316",
        phase: Math.random() * Math.PI * 2,
      };
    });

    let mX = 0, mY = 0;
    const onMouse = (e: MouseEvent) => {
      mX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    let paused = false;
    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let rafId: number, t = 0, cRY = 0, cRX = 0;

    const frame = () => {
      rafId = requestAnimationFrame(frame);
      if (paused) return;
      t += 0.0065;

      const cx = w / 2, cy = h / 2, R = getR(), fov = getFov();
      cRY += (t * 0.65 + mX * 0.5 - cRY) * 0.04;
      cRX += (Math.sin(t * 0.25) * 0.12 + mY * 0.22 - cRX) * 0.04;

      const xf = (v: V3) => rotX(rotY(v, cRY), cRX);

      ctx.clearRect(0, 0, w, h);
      const S = Math.min(w, h);

      // Ambient purple glow
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.58);
      g1.addColorStop(0,   "rgba(147,51,234,0.22)");
      g1.addColorStop(0.45,"rgba(100,20,155,0.10)");
      g1.addColorStop(1,   "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, S * 0.58, 0, Math.PI * 2);
      ctx.fillStyle = g1; ctx.fill();

      // Inner bright core
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.27);
      g2.addColorStop(0,   "rgba(192,90,255,0.32)");
      g2.addColorStop(0.5, "rgba(147,51,234,0.1)");
      g2.addColorStop(1,   "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, S * 0.27, 0, Math.PI * 2);
      ctx.fillStyle = g2; ctx.fill();

      // Orange halo offset
      const g3 = ctx.createRadialGradient(cx + S * 0.04, cy - S * 0.06, 0, cx, cy, S * 0.68);
      g3.addColorStop(0, "rgba(249,115,22,0.08)");
      g3.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, S * 0.68, 0, Math.PI * 2);
      ctx.fillStyle = g3; ctx.fill();

      // Rings
      for (const rd of ringDefs) {
        const rPts = makeRing(R * rd.rMul, 130, rd.tilt[0], rd.tilt[1]);
        const ps = rPts.map(p => proj(xf(p), cx, cy, fov));
        for (let i = 0; i < ps.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(ps[i][0], ps[i][1]);
          ctx.lineTo(ps[i + 1][0], ps[i + 1][1]);
          ctx.strokeStyle = rd.color;
          ctx.globalAlpha = rd.op * Math.min(ps[i][2] * 0.88, 1.0);
          ctx.lineWidth = rd.lw;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Icosahedron edges
      const pv = icoV.map(v => proj(xf(v), cx, cy, fov));
      for (const [a, b] of icoE) {
        const [ax, ay, as_] = pv[a], [bx, by, bs] = pv[b];
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = "#9333ea";
        ctx.globalAlpha = 0.32 * Math.min(((as_ + bs) * 0.5) * 1.1, 1);
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Vertex glow dots
      for (const [vx, vy, vs] of pv) {
        if (vs < 0.1) continue;
        const dr = 2.2 * vs;
        const gd = ctx.createRadialGradient(vx, vy, 0, vx, vy, dr * 5);
        gd.addColorStop(0, "rgba(192,90,255,0.95)");
        gd.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(vx, vy, dr * 5, 0, Math.PI * 2);
        ctx.fillStyle = gd; ctx.globalAlpha = 0.38 * Math.min(vs, 1); ctx.fill();
        ctx.beginPath(); ctx.arc(vx, vy, dr, 0, Math.PI * 2);
        ctx.fillStyle = "#e0abff"; ctx.globalAlpha = Math.min(vs, 1); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Particles
      for (const { v, color, phase } of ptsData) {
        const animated = { x: v.x, y: v.y + Math.sin(t * 0.38 + phase) * 7, z: v.z };
        const [px, py, ps] = proj(xf(animated), cx, cy, fov);
        if (ps < 0.05 || px < -30 || px > w + 30 || py < -30 || py > h + 30) continue;
        ctx.beginPath(); ctx.arc(px, py, 1.5 * ps, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.72 * Math.min(ps, 1);
        ctx.fill(); ctx.globalAlpha = 1;
      }
    };

    frame();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
