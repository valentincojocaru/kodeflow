import { useEffect, useRef } from "react";

interface Node {
  x: number; y: number; r: number;
  vx: number; vy: number;
  layer: number;
  pulse: number; pulseSpeed: number;
  size: number;
  connections: number[];
}

export default function NeuralHUD({ size = 420 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * DPR;
    canvas.height = size * DPR;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(DPR, DPR);

    const cx = size / 2, cy = size / 2;
    const layers = [
      { count: 1,  radius: 0,   nodeSize: 8 },
      { count: 6,  radius: 68,  nodeSize: 5 },
      { count: 10, radius: 128, nodeSize: 4 },
      { count: 14, radius: 182, nodeSize: 3 },
    ];

    // Build nodes
    const nodes: Node[] = [];
    layers.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 - Math.PI / 2;
        nodes.push({
          x: cx + Math.cos(angle) * layer.radius,
          y: cy + Math.sin(angle) * layer.radius,
          r: layer.radius,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          layer: li,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.025 + Math.random() * 0.035,
          size: layer.nodeSize,
          connections: [],
        });
      }
    });

    // Connect each node to 2-4 nodes in adjacent layers
    for (let i = 0; i < nodes.length; i++) {
      const targets = nodes
        .map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
        .filter(({ j, d }) => j !== i && d < 115 && d > 5)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .map(({ j }) => j);
      nodes[i].connections = targets;
    }

    // Energy pulses along connections
    interface Pulse { from: number; to: number; t: number; speed: number; color: string }
    const pulses: Pulse[] = [];
    const spawnPulse = () => {
      const from = Math.floor(Math.random() * nodes.length);
      if (nodes[from].connections.length === 0) return;
      const to = nodes[from].connections[Math.floor(Math.random() * nodes[from].connections.length)];
      pulses.push({
        from, to, t: 0,
        speed: 0.008 + Math.random() * 0.012,
        color: Math.random() > 0.4 ? "#b855ff" : "#f050c8",
      });
    };

    // Hex grid pattern (static, drawn once)
    const hexCanvas = document.createElement("canvas");
    hexCanvas.width = size * DPR;
    hexCanvas.height = size * DPR;
    const hctx = hexCanvas.getContext("2d")!;
    hctx.scale(DPR, DPR);
    const hexSize = 22;
    const hexW = hexSize * Math.sqrt(3);
    const hexH = hexSize * 2;
    for (let row = -1; row < size / hexH * 2 + 1; row++) {
      for (let col = -1; col < size / hexW + 1; col++) {
        const xOff = (row % 2) * (hexW / 2);
        const hx = col * hexW + xOff;
        const hy = row * hexH * 0.75;
        const dist = Math.hypot(hx - cx, hy - cy);
        if (dist > size * 0.5) continue;
        const alpha = Math.max(0, 0.06 - (dist / (size * 0.5)) * 0.05);
        hctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k * 60 - 30) * Math.PI / 180;
          const px = hx + hexSize * Math.cos(a);
          const py = hy + hexSize * Math.sin(a);
          k === 0 ? hctx.moveTo(px, py) : hctx.lineTo(px, py);
        }
        hctx.closePath();
        hctx.strokeStyle = `rgba(184,80,255,${alpha})`;
        hctx.lineWidth = 0.6;
        hctx.stroke();
      }
    }

    // Scan ring
    let scanAngle = 0;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
      ctx.clip();

      // Dark background inside orb
      const bgGrad = ctx.createRadialGradient(cx, cy - 30, 0, cx, cy, size * 0.49);
      bgGrad.addColorStop(0, "rgba(30,8,55,0.98)");
      bgGrad.addColorStop(0.6, "rgba(15,4,35,0.98)");
      bgGrad.addColorStop(1, "rgba(5,1,15,0.99)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Hex grid
      ctx.drawImage(hexCanvas, 0, 0, size, size);

      // Scan sector light
      const scanGrad = ctx.createConicalGradient
        ? null
        : null;
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, size * 0.47, scanAngle, scanAngle + 0.7);
      ctx.closePath();
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.47);
      sg.addColorStop(0, "rgba(184,80,255,0.8)");
      sg.addColorStop(1, "rgba(184,80,255,0)");
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.restore();
      scanAngle += 0.015;

      // Concentric rings
      [0.45, 0.32, 0.19, 0.1].forEach((ratio, ri) => {
        const r = size * ratio;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(184,80,255,${0.04 + ri * 0.015})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Ring tick marks
        const ticks = (ri + 1) * 8;
        for (let t = 0; t < ticks; t++) {
          const a = (t / ticks) * Math.PI * 2;
          const inner = r - 4;
          const outer = r + (t % 4 === 0 ? 8 : 4);
          const alpha = t % 4 === 0 ? 0.45 : 0.18;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
          ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
          ctx.strokeStyle = `rgba(184,80,255,${alpha})`;
          ctx.lineWidth = t % 4 === 0 ? 1.2 : 0.6;
          ctx.stroke();
        }
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (const j of nodes[i].connections) {
          if (j <= i) continue;
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          const alpha = Math.max(0, (1 - dist / 115)) * 0.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(184,80,255,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Draw energy pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const from = nodes[p.from];
        const to = nodes[p.to];
        const px = from.x + (to.x - from.x) * p.t;
        const py = from.y + (to.y - from.y) * p.t;
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 5);
        pg.addColorStop(0, p.color + "ff");
        pg.addColorStop(1, p.color + "00");
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.globalAlpha = 1 - p.t * 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw nodes
      for (const n of nodes) {
        n.pulse += n.pulseSpeed;
        const pa = 0.5 + Math.sin(n.pulse) * 0.35;
        const ps = n.size * (0.85 + Math.sin(n.pulse) * 0.25);

        // Glow halo
        const hg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, ps * 5);
        hg.addColorStop(0, `rgba(184,80,255,${pa * 0.5})`);
        hg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, ps * 5, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();

        // Core
        const cg = ctx.createRadialGradient(n.x - ps * 0.3, n.y - ps * 0.3, 0, n.x, n.y, ps);
        if (n.layer === 0) {
          cg.addColorStop(0, "#ffffff");
          cg.addColorStop(0.3, "#e0aaff");
          cg.addColorStop(1, "#b855ff");
        } else {
          cg.addColorStop(0, "#f0d0ff");
          cg.addColorStop(0.5, "#b855ff");
          cg.addColorStop(1, "#6b21a8");
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, ps, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.globalAlpha = pa;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Floating data labels
      const labels = [
        { angle: 0.4,  r: 145, text: "99.9%",  sub: "UPTIME" },
        { angle: 1.8,  r: 148, text: "∞",       sub: "SCALE" },
        { angle: 3.4,  r: 142, text: "<24h",    sub: "RESPONSE" },
        { angle: 5.0,  r: 147, text: "AI",      sub: "POWERED" },
      ];
      const lt = frame * 0.008;
      labels.forEach(({ angle, r, text, sub }) => {
        const a = angle + lt;
        const lx = cx + Math.cos(a) * r;
        const ly = cy + Math.sin(a) * r;
        const d = Math.hypot(lx - cx, ly - cy);
        if (d > size * 0.46) return;
        const fa = 0.5 + Math.sin(frame * 0.04 + angle) * 0.2;
        ctx.globalAlpha = fa;
        ctx.font = `bold 10px 'Space Grotesk', monospace`;
        ctx.fillStyle = "#d4aaff";
        ctx.textAlign = "center";
        ctx.fillText(text, lx, ly);
        ctx.font = `7px 'Space Grotesk', monospace`;
        ctx.fillStyle = "rgba(184,80,255,0.6)";
        ctx.fillText(sub, lx, ly + 10);
        ctx.globalAlpha = 1;
      });

      // Center core glow
      const t = frame * 0.04;
      const corePulse = 0.7 + Math.sin(t) * 0.3;
      const cg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * corePulse);
      cg2.addColorStop(0, "rgba(255,255,255,0.95)");
      cg2.addColorStop(0.2, "rgba(220,160,255,0.85)");
      cg2.addColorStop(0.6, "rgba(184,80,255,0.4)");
      cg2.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, 24 * corePulse, 0, Math.PI * 2);
      ctx.fillStyle = cg2;
      ctx.fill();

      // Center inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, 16 * corePulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * corePulse})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // Outer ring glow (outside clip)
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(184,80,255,${0.3 + Math.sin(t) * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(184,80,255,0.6)";
      ctx.stroke();
      ctx.shadowBlur = 0;

      frame++;

      // Spawn pulses
      if (frame % 18 === 0) spawnPulse();
    };

    let rafId: number;
    const loop = () => { draw(); rafId = requestAnimationFrame(loop); };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [size]);

  return <canvas ref={canvasRef} className="select-none" />;
}
