import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
  size: number;
  hue: number; baseHue: number;
  alpha: number; life: number;
}

function sampleTextPixels(texts: string[], fontSize: number, w: number, h: number, gap: number): Array<{ x: number; y: number }> {
  const off = document.createElement("canvas");
  off.width = w; off.height = h;
  const c = off.getContext("2d")!;
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#ffffff";
  const lineH = fontSize * 1.1;
  const totalH = texts.length * lineH;
  let startY = (h - totalH) / 2 + fontSize * 0.5;
  texts.forEach(text => {
    c.font = `900 ${fontSize}px 'Space Grotesk', 'Courier New', monospace`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, w / 2, startY);
    startY += lineH;
  });
  const d = c.getImageData(0, 0, w, h).data;
  const pts: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      if (d[(y * w + x) * 4 + 3] > 80) pts.push({ x, y });
    }
  }
  return pts;
}

export default function InteractiveParticleField({ width = 560, height = 480 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, inside: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5); // cap at 1.5
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(DPR, DPR);

    let paused = false;
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - r.left) * (width / r.width);
      mouseRef.current.y = (e.clientY - r.top) * (height / r.height);
    };
    const onEnter = () => { mouseRef.current.inside = true; };
    const onLeave = () => { mouseRef.current.inside = false; mouseRef.current.x = -9999; mouseRef.current.y = -9999; };

    canvas.addEventListener("mousemove", onMouseMove, { passive: true });
    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);

    // Gap 5 instead of 4 — fewer particles, same visual shape
    const gap = 5;
    const pixels = sampleTextPixels(["</>"], 240, width, height, gap);

    const EXTRA = 40; // reduced from 60
    const particles: Particle[] = pixels.map((p, i) => {
      const hue = 265 + (i / pixels.length) * 60;
      return {
        x: p.x + (Math.random() - 0.5) * 12,
        y: p.y + (Math.random() - 0.5) * 12,
        ox: p.x, oy: p.y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1.2 + Math.random() * 1.4,
        hue, baseHue: hue,
        alpha: 0.75 + Math.random() * 0.25,
        life: Math.random(),
      };
    });

    for (let i = 0; i < EXTRA; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * Math.min(width, height) * 0.42;
      const ox = width / 2 + Math.cos(angle) * r;
      const oy = height / 2 + Math.sin(angle) * r;
      particles.push({ x: ox, y: oy, ox, oy, vx: 0, vy: 0, size: 0.7 + Math.random() * 0.7, hue: 285 + Math.random() * 45, baseHue: 285, alpha: 0.12 + Math.random() * 0.18, life: Math.random() });
    }

    let frame = 0;
    let rafId: number;
    let lastTime = 0;
    // Idle at 30fps when mouse not inside, 60fps when interacting
    const IDLE_MS = 1000 / 30;

    const REPEL_RADIUS = 110;
    const REPEL_FORCE = 5.5;
    const SPRING = 0.055;
    const FRICTION = 0.865;

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (paused) return;

      const { inside } = mouseRef.current;
      // Throttle to 30fps when idle (no mouse interaction)
      if (!inside && now - lastTime < IDLE_MS) return;
      lastTime = now;
      frame++;

      ctx.clearRect(0, 0, width, height);

      const { x: mx, y: my } = mouseRef.current;

      for (const p of particles) {
        p.life += 0.012;
        const odx = p.ox - p.x;
        const ody = p.oy - p.y;
        let ax = odx * SPRING;
        let ay = ody * SPRING;

        if (inside) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < REPEL_RADIUS) {
            const strength = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            ax += (dx / dist) * strength;
            ay += (dy / dist) * strength;
          }
        }

        p.vx = (p.vx + ax) * FRICTION;
        p.vy = (p.vy + ay) * FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.hue = p.baseHue + Math.min(speed * 4, 30);

        // Only draw glow gradient if particle is big enough / moving
        if (p.size > 1.0 || speed > 0.5) {
          const glowR = p.size * (3 + speed * 0.8);
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          glow.addColorStop(0, `hsla(${p.hue}, 90%, 72%, ${p.alpha * 0.9})`);
          glow.addColorStop(1, `hsla(${p.hue}, 90%, 72%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + speed * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 82%, ${p.alpha})`;
        ctx.fill();
      }

      if (inside && mx > -100) {
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, REPEL_RADIUS);
        mg.addColorStop(0, "rgba(240, 80, 200, 0.14)");
        mg.addColorStop(0.5, "rgba(184, 80, 255, 0.06)");
        mg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, REPEL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = mg;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(240, 80, 200, 0.6)";
        ctx.fill();
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [width, height]);

  return <canvas ref={canvasRef} className="select-none" style={{ willChange: "transform" }} />;
}
