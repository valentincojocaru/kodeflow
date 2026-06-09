import { useEffect, useRef } from "react";

interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; orange: boolean }
interface NNode { x: number; y: number; vx: number; vy: number; pulse: number; conn: number[] }

function hex(r: number, g: number, b: number, a: number) {
  return `rgba(${r},${g},${b},${a})`;
}

export default function AiRobotScene({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    let raf = 0, t = 0;
    let mx = 0.5, my = 0.5;
    let W = 0, H = 0;

    // ── Neural network nodes ──────────────────────────────────────────────
    const NODES: NNode[] = Array.from({ length: 28 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - .5) * .00055,
      vy: (Math.random() - .5) * .00055,
      pulse: Math.random() * Math.PI * 2,
      conn: [],
    }));
    NODES.forEach((n, i) => {
      NODES.forEach((m, j) => {
        if (i < j && Math.hypot(n.x - m.x, n.y - m.y) < .28) n.conn.push(j);
      });
    });

    // ── Particles ─────────────────────────────────────────────────────────
    const PARTS: Particle[] = [];
    function spawnPart(cx: number, cy: number) {
      const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 90;
      PARTS.push({
        x: cx + Math.cos(a) * r, y: cy - 20 + (Math.random() - .5) * 160,
        vx: (Math.random() - .5) * .4, vy: -.4 - Math.random() * .9,
        life: 80 + Math.random() * 100, maxLife: 80 + Math.random() * 100,
        size: .8 + Math.random() * 1.8, orange: Math.random() < .45,
      });
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.offsetWidth || 520;
      H = canvas.offsetHeight || 620;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function onMove(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
    }
    canvas.addEventListener("mousemove", onMove);

    // ── Draw helpers ─────────────────────────────────────────────────────
    function radGlow(x: number, y: number, r: number, inner: string, outer = "transparent") {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, inner); g.addColorStop(1, outer);
      return g;
    }

    // ── Neural network ───────────────────────────────────────────────────
    function drawNeural() {
      NODES.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < .01 || n.x > .99) n.vx *= -1;
        if (n.y < .01 || n.y > .99) n.vy *= -1;
        const nx = n.x * W, ny = n.y * H;
        const p = .18 + .18 * Math.sin(t + n.pulse);
        n.conn.forEach(j => {
          const m = NODES[j], ox = m.x * W, oy = m.y * H;
          const d = Math.hypot(nx - ox, ny - oy), maxD = Math.min(W, H) * .3;
          if (d > maxD) return;
          const a = (1 - d / maxD) * .1;
          const lg = ctx.createLinearGradient(nx, ny, ox, oy);
          lg.addColorStop(0, hex(147, 51, 234, a));
          lg.addColorStop(.5, hex(249, 115, 22, a * .6));
          lg.addColorStop(1, hex(147, 51, 234, a));
          ctx.strokeStyle = lg; ctx.lineWidth = .6;
          ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(ox, oy); ctx.stroke();
        });
        ctx.fillStyle = hex(147, 51, 234, p);
        ctx.shadowColor = "#7c3aed"; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.arc(nx, ny, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    // ── Orbital rings ─────────────────────────────────────────────────────
    function drawOrbits(cx: number, cy: number, R: number) {
      const RINGS = [
        { spd: .28,  rx: R * 2.05, ry: R * .52, tilt: .28,  col: [147, 51, 234],  dots: 5 },
        { spd: -.18, rx: R * 2.5,  ry: R * .62, tilt: -.18, col: [249, 115, 22],  dots: 4 },
        { spd: .14,  rx: R * 1.65, ry: R * .42, tilt: .22,  col: [6, 182, 212],   dots: 6 },
      ];
      RINGS.forEach(ring => {
        const [r, g, b] = ring.col;
        const N = 90;
        ctx.save(); ctx.translate(cx, cy);
        // ring dashes
        ctx.strokeStyle = hex(r, g, b, .18);
        ctx.lineWidth = .9; ctx.setLineDash([3, 9]);
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const θ = (i / N) * Math.PI * 2 + t * ring.spd;
          const px = Math.cos(θ) * ring.rx;
          const py = Math.sin(θ) * ring.ry + Math.cos(θ) * ring.rx * ring.tilt * .35;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
        // bright dots
        for (let d = 0; d < ring.dots; d++) {
          const θ = (d / ring.dots + t * ring.spd / (Math.PI * 2)) * Math.PI * 2;
          const px = Math.cos(θ) * ring.rx;
          const py = Math.sin(θ) * ring.ry + Math.cos(θ) * ring.rx * ring.tilt * .35;
          const dp = .55 + .45 * Math.sin(t * 2.2 + d);
          ctx.fillStyle = hex(r, g, b, dp);
          ctx.shadowColor = `rgb(${r},${g},${b})`; ctx.shadowBlur = 7;
          ctx.beginPath(); ctx.arc(px, py, 2.8, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      });
    }

    // ── Robot ─────────────────────────────────────────────────────────────
    function drawRobot(): { cx: number; cy: number; R: number } {
      const tilX = (mx - .5) * 14, tilY = (my - .5) * 7;
      const bob = Math.sin(t * .45) * 5;
      const cx = W / 2 + tilX, cy = H / 2 + bob + tilY;
      const R = Math.min(W, H) * .21;

      // far bg glow
      ctx.fillStyle = radGlow(cx, cy, R * 4.5, hex(100, 30, 200, .06));
      ctx.beginPath(); ctx.arc(cx, cy, R * 4.5, 0, Math.PI * 2); ctx.fill();

      // ── Shoulders / base ──
      const sW = R * 2.4, sH = R * .55, sY = cy + R * 1.05;
      ctx.fillStyle = hex(12, 8, 30, .9);
      ctx.strokeStyle = hex(147, 51, 234, .35);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - sW / 2, sY + sH);
      ctx.lineTo(cx - sW / 2 + R * .3, sY);
      ctx.lineTo(cx + sW / 2 - R * .3, sY);
      ctx.lineTo(cx + sW / 2, sY + sH);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // shoulder groove lines
      for (let s of [-1, 1]) {
        ctx.strokeStyle = hex(147, 51, 234, .2);
        ctx.lineWidth = .6;
        ctx.beginPath();
        ctx.moveTo(cx + s * R * .4, sY + R * .08);
        ctx.lineTo(cx + s * R * .8, sY + R * .08);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + s * R * .35, sY + R * .22);
        ctx.lineTo(cx + s * R * .75, sY + R * .22);
        ctx.stroke();
      }

      // ── Neck ──
      const nW = R * .34, nH = R * .42;
      const nY = cy + R * .82;
      ctx.fillStyle = hex(10, 7, 25, .92);
      ctx.strokeStyle = hex(147, 51, 234, .45);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - nW / 2, nY + nH);
      ctx.lineTo(cx - nW / 2 + 4, nY);
      ctx.lineTo(cx + nW / 2 - 4, nY);
      ctx.lineTo(cx + nW / 2, nY + nH);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      for (let i = 1; i <= 5; i++) {
        ctx.strokeStyle = hex(147, 51, 234, .12 + i * .04);
        ctx.lineWidth = .5;
        ctx.beginPath();
        ctx.moveTo(cx - nW / 2 + 3, nY + i * (nH / 6));
        ctx.lineTo(cx + nW / 2 - 3, nY + i * (nH / 6));
        ctx.stroke();
      }

      // ── Head shape ──
      const hw = R * 1.08, hh = R * 1.28;
      const hpts: [number, number][] = [
        [cx,            cy - hh],
        [cx + hw * .5,  cy - hh + R * .09],
        [cx + hw,       cy - hh * .52],
        [cx + hw * .97, cy],
        [cx + hw,       cy + hh * .44],
        [cx + hw * .58, cy + hh * .72],
        [cx,            cy + hh * .82],
        [cx - hw * .58, cy + hh * .72],
        [cx - hw,       cy + hh * .44],
        [cx - hw * .97, cy],
        [cx - hw,       cy - hh * .52],
        [cx - hw * .5,  cy - hh + R * .09],
      ];
      function headPath() {
        ctx.beginPath();
        ctx.moveTo(hpts[0][0], hpts[0][1]);
        hpts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.closePath();
      }

      // head shadow glow
      ctx.shadowColor = "#7c3aed"; ctx.shadowBlur = 22;
      headPath();
      const hg = ctx.createLinearGradient(cx, cy - hh, cx, cy + hh);
      hg.addColorStop(0, hex(22, 15, 52, .94));
      hg.addColorStop(.5, hex(12, 8, 34, .97));
      hg.addColorStop(1, hex(8, 5, 22, .95));
      ctx.fillStyle = hg; ctx.fill(); ctx.shadowBlur = 0;

      // head border
      ctx.shadowColor = "#9333ea"; ctx.shadowBlur = 10;
      ctx.strokeStyle = hex(147, 51, 234, .65);
      ctx.lineWidth = 1.8;
      headPath(); ctx.stroke(); ctx.shadowBlur = 0;

      // head facets (inner edge lines for depth)
      const facets: [[number,number],[number,number]][] = [
        [hpts[1], hpts[11]], [hpts[2], hpts[10]], [hpts[4], hpts[8]],
      ];
      facets.forEach(([a, b]) => {
        const midx = (a[0] + b[0]) / 2, midy = (a[1] + b[1]) / 2;
        const lg = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
        lg.addColorStop(0, hex(147, 51, 234, .05));
        lg.addColorStop(.5, hex(147, 51, 234, .14));
        lg.addColorStop(1, hex(147, 51, 234, .05));
        ctx.strokeStyle = lg; ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      });

      // face plate inner panel
      const fpW = hw * .77, fpH = hh * .72;
      ctx.strokeStyle = hex(147, 51, 234, .22); ctx.lineWidth = .8;
      ctx.fillStyle = hex(20, 14, 46, .38);
      ctx.beginPath();
      ctx.roundRect(cx - fpW, cy - fpH / 2, fpW * 2, fpH, 8);
      ctx.fill(); ctx.stroke();

      // ── VISOR / eyes ──
      const eyePulse = .7 + .3 * Math.sin(t * 1.6);
      const eyeY = cy - hh * .2;
      const eyeW = hw * .38, eyeH = R * .095;
      const eyeGap = hw * .52;

      for (const s of [-1, 1]) {
        const ex = cx + s * eyeGap * .5;
        // outer glow halo
        ctx.fillStyle = radGlow(ex, eyeY, eyeW * 1.7, hex(249, 115, 22, .18 * eyePulse));
        ctx.beginPath(); ctx.arc(ex, eyeY, eyeW * 1.7, 0, Math.PI * 2); ctx.fill();

        // socket
        ctx.fillStyle = hex(3, 2, 12, .85);
        ctx.beginPath();
        ctx.roundRect(ex - eyeW * .56, eyeY - eyeH * 1.25, eyeW * 1.12, eyeH * 2.5, eyeH * .55);
        ctx.fill();

        // glowing slit
        const eg = ctx.createLinearGradient(ex - eyeW * .5, eyeY, ex + eyeW * .5, eyeY);
        eg.addColorStop(0, hex(249, 115, 22, .35 * eyePulse));
        eg.addColorStop(.25, hex(255, 165, 60, eyePulse));
        eg.addColorStop(.5, hex(255, 220, 80, eyePulse));
        eg.addColorStop(.75, hex(255, 165, 60, eyePulse));
        eg.addColorStop(1, hex(249, 115, 22, .35 * eyePulse));
        ctx.fillStyle = eg;
        ctx.shadowColor = "#f97316"; ctx.shadowBlur = 16 * eyePulse;
        ctx.beginPath();
        ctx.roundRect(ex - eyeW * .5, eyeY - eyeH * .65, eyeW, eyeH * 1.3, eyeH * .35);
        ctx.fill(); ctx.shadowBlur = 0;

        // scanning dot
        const sdx = ex + Math.cos(t * .7 + s) * eyeW * .22;
        ctx.fillStyle = hex(255, 240, 120, .95 * eyePulse);
        ctx.shadowColor = "#fff"; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.arc(sdx, eyeY, 2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // visor bridge line
      ctx.strokeStyle = hex(100, 40, 180, .4 + .15 * Math.sin(t));
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - eyeGap * .5 + eyeW * .5, eyeY);
      ctx.lineTo(cx + eyeGap * .5 - eyeW * .5, eyeY);
      ctx.stroke();

      // eyebrow ridge
      ctx.strokeStyle = hex(147, 51, 234, .5 + .15 * Math.sin(t * .9));
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - hw * .62, eyeY - eyeH * 2.6);
      ctx.lineTo(cx - eyeGap * .5, eyeY - eyeH * 1.5);
      ctx.moveTo(cx + hw * .62, eyeY - eyeH * 2.6);
      ctx.lineTo(cx + eyeGap * .5, eyeY - eyeH * 1.5);
      ctx.stroke();

      // ── Nose ridge ──
      ctx.strokeStyle = hex(147, 51, 234, .25);
      ctx.lineWidth = .8;
      ctx.beginPath();
      ctx.moveTo(cx, eyeY + eyeH * 2);
      ctx.lineTo(cx, cy + hh * .06);
      ctx.stroke();

      // ── Mouth speaker ──
      const mY = cy + hh * .3, mW = hw * .5;
      ctx.fillStyle = hex(10, 7, 26, .8);
      ctx.strokeStyle = hex(147, 51, 234, .38);
      ctx.lineWidth = .8;
      ctx.beginPath();
      ctx.roundRect(cx - mW * .5, mY - R * .095, mW, R * .19, 4);
      ctx.fill(); ctx.stroke();
      // audio bars
      const barPulse = .5 + .5 * Math.sin(t * 2.3 + .5);
      for (let i = 0; i < 7; i++) {
        const bx2 = cx - mW * .38 + i * mW * .75 / 6;
        const bh = R * .12 * (.2 + .8 * Math.abs(Math.sin(t * 3.1 + i * .7))) * barPulse;
        const isMid = i === 3;
        ctx.fillStyle = isMid ? hex(249, 115, 22, .85 * barPulse) : hex(147, 51, 234, .6 * barPulse);
        ctx.shadowColor = isMid ? "#f97316" : "#7c3aed"; ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.roundRect(bx2 - 1.8, mY - bh / 2, 3.6, bh, 2);
        ctx.fill(); ctx.shadowBlur = 0;
      }

      // ── Chin details ──
      const chinY = cy + hh * .6;
      ctx.strokeStyle = hex(147, 51, 234, .2); ctx.lineWidth = .7;
      [-1, 0, 1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(cx + s * R * .25, chinY);
        ctx.lineTo(cx + s * R * .25, chinY + R * .15);
        ctx.stroke();
      });

      // ── Circuit traces (clipped to head) ──
      ctx.save();
      headPath(); ctx.clip();
      ctx.strokeStyle = hex(249, 115, 22, .12); ctx.lineWidth = .65;
      const traces = [
        [[cx - hw * .58, cy - hh * .38], [cx - hw * .3, cy - hh * .38], [cx - hw * .3, cy - hh * .05]],
        [[cx - hw * .68, cy + hh * .1],  [cx - hw * .42, cy + hh * .1], [cx - hw * .42, cy + hh * .35]],
        [[cx + hw * .58, cy - hh * .38], [cx + hw * .3,  cy - hh * .38],[cx + hw * .3,  cy - hh * .05]],
        [[cx + hw * .68, cy + hh * .1],  [cx + hw * .42, cy + hh * .1], [cx + hw * .42, cy + hh * .35]],
        [[cx - hw * .22, cy - hh * .68], [cx - hw * .22, cy - hh * .5], [cx + hw * .22, cy - hh * .5]],
        [[cx + hw * .22, cy - hh * .68], [cx + hw * .22, cy - hh * .5]],
      ] as [number, number][][];
      traces.forEach(tr => {
        ctx.beginPath();
        ctx.moveTo(tr[0][0], tr[0][1]);
        tr.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.stroke();
      });
      // circuit junction dots
      [
        [cx - hw * .3, cy - hh * .38], [cx + hw * .3, cy - hh * .38],
        [cx - hw * .42, cy + hh * .1], [cx + hw * .42, cy + hh * .1],
      ].forEach(([jx, jy]) => {
        ctx.fillStyle = hex(249, 115, 22, .35);
        ctx.beginPath(); ctx.arc(jx, jy, 2, 0, Math.PI * 2); ctx.fill();
      });

      // ── Scan line ──
      const sp = (t * .25) % 1;
      const sly = (cy - hh) + sp * hh * 2.1;
      if (sly > cy - hh && sly < cy + hh * .85) {
        const sa = .55 * Math.sin(sp * Math.PI);
        const slg = ctx.createLinearGradient(cx - hw, sly, cx + hw, sly);
        slg.addColorStop(0, "transparent");
        slg.addColorStop(.35, hex(6, 182, 212, .28 * sa));
        slg.addColorStop(.5, hex(6, 182, 212, .55 * sa));
        slg.addColorStop(.65, hex(6, 182, 212, .28 * sa));
        slg.addColorStop(1, "transparent");
        ctx.strokeStyle = hex(6, 182, 212, .6 * sa);
        ctx.shadowColor = "#06b6d4"; ctx.shadowBlur = 8;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(cx - hw, sly); ctx.lineTo(cx + hw, sly); ctx.stroke();
        ctx.fillStyle = slg;
        ctx.fillRect(cx - hw, sly - 4, hw * 2, 8);
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // ── Antenna ──
      const antBotY = cy - hh, antTopY = antBotY - R * .42;
      ctx.strokeStyle = hex(147, 51, 234, .6); ctx.lineWidth = 1.8;
      ctx.shadowColor = "#7c3aed"; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.moveTo(cx, antBotY); ctx.lineTo(cx, antTopY); ctx.stroke();
      ctx.shadowBlur = 0;
      const antP = .5 + .5 * Math.sin(t * 2.1);
      ctx.fillStyle = hex(249, 115, 22, antP);
      ctx.shadowColor = "#f97316"; ctx.shadowBlur = 12 * antP;
      ctx.beginPath(); ctx.arc(cx, antTopY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // side blips
      for (const s of [-1, 1]) {
        ctx.strokeStyle = hex(147, 51, 234, .35); ctx.lineWidth = .9;
        ctx.beginPath();
        ctx.moveTo(cx + s * hw * .68, cy - hh * .72);
        ctx.lineTo(cx + s * hw * .88, cy - hh * .95);
        ctx.stroke();
        const bp = .4 + .3 * Math.sin(t * 1.8 + s * 1.3);
        ctx.fillStyle = hex(6, 182, 212, bp);
        ctx.shadowColor = "#06b6d4"; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(cx + s * hw * .88, cy - hh * .95, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      return { cx, cy, R };
    }

    // ── HUD corners ───────────────────────────────────────────────────────
    function drawHUD(cx: number, cy: number, R: number) {
      const items = [
        { x: cx + R * 2.55, y: cy - R * .55, label: "NEURAL", val: "98.3%",  a: 1 },
        { x: cx + R * 2.55, y: cy + R * .22, label: "LATENCY", val: "1.1ms", a: -1 },
        { x: cx - R * 2.55, y: cy - R * .55, label: "CORES",   val: "512",   a: 1 },
        { x: cx - R * 2.55, y: cy + R * .22, label: "UPTIME",  val: "99.9%", a: -1 },
      ];
      items.forEach(el => {
        const alpha = .35 + .18 * Math.sin(t * .65 + el.x * .005);
        const bW = 52, bH = 30, cs = 7;
        // corner brackets
        ctx.strokeStyle = hex(6, 182, 212, alpha * .7); ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.moveTo(el.x - bW/2 + cs, el.y - bH/2);
        ctx.lineTo(el.x - bW/2, el.y - bH/2);
        ctx.lineTo(el.x - bW/2, el.y - bH/2 + cs);
        ctx.moveTo(el.x + bW/2 - cs, el.y - bH/2);
        ctx.lineTo(el.x + bW/2, el.y - bH/2);
        ctx.lineTo(el.x + bW/2, el.y - bH/2 + cs);
        ctx.moveTo(el.x - bW/2 + cs, el.y + bH/2);
        ctx.lineTo(el.x - bW/2, el.y + bH/2);
        ctx.lineTo(el.x - bW/2, el.y + bH/2 - cs);
        ctx.moveTo(el.x + bW/2 - cs, el.y + bH/2);
        ctx.lineTo(el.x + bW/2, el.y + bH/2);
        ctx.lineTo(el.x + bW/2, el.y + bH/2 - cs);
        ctx.stroke();
        // texts
        ctx.textAlign = "center";
        ctx.fillStyle = hex(6, 182, 212, alpha * .75);
        ctx.font = "7px monospace";
        ctx.fillText(el.label, el.x, el.y - 3);
        ctx.fillStyle = hex(249, 115, 22, Math.min(alpha * 1.3, .9));
        ctx.font = "bold 11px monospace";
        ctx.fillText(el.val, el.x, el.y + 9);
        // connector line
        const sign = el.x > cx ? -1 : 1;
        ctx.strokeStyle = hex(6, 182, 212, alpha * .2);
        ctx.lineWidth = .5; ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.moveTo(el.x + sign * bW / 2, el.y);
        ctx.lineTo(cx + (-sign) * R * 1.25, el.y * .4 + cy * .6);
        ctx.stroke(); ctx.setLineDash([]);
      });
      ctx.textAlign = "left";
    }

    // ── Particles ─────────────────────────────────────────────────────────
    function drawParticles(cx: number, cy: number) {
      if (PARTS.length < 45 && Math.random() < .45) spawnPart(cx, cy);
      for (let i = PARTS.length - 1; i >= 0; i--) {
        const p = PARTS[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) { PARTS.splice(i, 1); continue; }
        const a = (p.life / p.maxLife) * .65;
        ctx.fillStyle = p.orange ? hex(249, 115, 22, a) : hex(147, 51, 234, a);
        ctx.shadowColor = p.orange ? "#f97316" : "#9333ea"; ctx.shadowBlur = 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // ── Main loop ─────────────────────────────────────────────────────────
    function frame() {
      ctx.clearRect(0, 0, W, H);
      t += 0.017;
      drawNeural();
      const { cx, cy, R } = drawRobot();
      drawOrbits(cx, cy, R);
      drawHUD(cx, cy, R);
      drawParticles(cx, cy);
      raf = requestAnimationFrame(frame);
    }

    let hidden = false;
    function onVis() { hidden = document.hidden; if (!hidden) frame(); }
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
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
