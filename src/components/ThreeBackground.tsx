import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number;
  size: number; color: string;
  pulse: number; pulseSpeed: number;
}

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    const DPR = 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let paused = false;

    // Pause when tab hidden — biggest RAM/CPU win
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * DPR;
        canvas.height = height * DPR;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }, 200);
    };
    const onMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });

    // Reduced to 80 particles — background doesn't need more
    const count = 80;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.4,
      color: Math.random() > 0.45 ? "#b855ff" : "#f050c8",
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.016,
    }));

    let frame = 0;
    let rafId: number;
    let lastTime = 0;
    // Background runs at 30fps — completely imperceptible, halves CPU load
    const TARGET_MS = 1000 / 30;

    const MAX_DIST_SQ = 110 * 110;

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (paused) return;
      if (now - lastTime < TARGET_MS) return;
      lastTime = now;
      frame++;

      ctx.clearRect(0, 0, width, height);

      // Perspective grid
      const horizon = height * 0.75;
      const vanishX = width / 2;
      const t = (frame * 0.005) % 1;

      ctx.save();
      for (let i = 0; i <= 14; i++) {
        const progress = (i / 14 + t) % 1;
        const y = horizon + (height - horizon) * progress;
        const spread = (y - horizon) / (height - horizon);
        const x0 = vanishX - spread * (width * 0.9);
        const x1 = vanishX + spread * (width * 0.9);
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.strokeStyle = `rgba(184,80,255,${spread * 0.1})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      for (let i = -8; i <= 8; i++) {
        const xFar = vanishX + i * (width / 16) * 0.25;
        const xNear = vanishX + i * (width / 16) * 3.2;
        const alpha = Math.max(0, 0.09 - Math.abs(i) * 0.01);
        ctx.beginPath();
        ctx.moveTo(xFar, horizon);
        ctx.lineTo(xNear, height + 20);
        ctx.strokeStyle = `rgba(184,80,255,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();

      const mx = mouseX / width - 0.5;
      const my = mouseY / height - 0.5;

      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const pulseAlpha = 0.3 + Math.sin(p.pulse) * 0.2;
        const dynamicSize = p.size * (0.7 + p.z * 0.5 + Math.sin(p.pulse) * 0.15);

        p.x += p.vx + mx * p.z * 0.07;
        p.y += p.vy + my * p.z * 0.07;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Skip expensive gradient for tiny/dim particles — use shadow blur instead
        if (dynamicSize > 0.8) {
          const haloR = dynamicSize * 5;
          const haloGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
          haloGrad.addColorStop(0, p.color + "55");
          haloGrad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.globalAlpha = pulseAlpha * 0.32;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulseAlpha * (0.6 + p.z * 0.4);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Connections — batched by color to minimise GPU state changes
      const purpleLines: [number, number, number, number, number][] = [];
      const pinkLines: [number, number, number, number, number][] = [];
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MAX_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            const t2 = 1 - dist / 110;
            const bucket = particles[i].color === "#b855ff" ? purpleLines : pinkLines;
            bucket.push([particles[i].x, particles[i].y, particles[j].x, particles[j].y, t2]);
          }
        }
      }
      const drawBatch = (lines: typeof purpleLines, rgb: string) => {
        for (const [x0, y0, x1, y1, t2] of lines) {
          ctx.globalAlpha = t2 * 0.12;
          ctx.lineWidth = t2 * 0.75;
          ctx.strokeStyle = `rgba(${rgb},1)`;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      };
      ctx.globalAlpha = 1;
      drawBatch(purpleLines, "184,85,255");
      drawBatch(pinkLines, "240,80,200");
      ctx.globalAlpha = 1;

      // Ambient blobs — every 3rd frame
      if (frame % 3 === 0) {
        const t3 = frame * 0.005;
        const blobs = [
          { x: width * 0.2 + Math.sin(t3 * 0.7) * 80, y: height * 0.3 + Math.cos(t3 * 0.5) * 60, r: 240, color: "184,80,255", a: 0.055 },
          { x: width * 0.8 + Math.cos(t3 * 0.6) * 100, y: height * 0.6 + Math.sin(t3 * 0.4) * 80, r: 280, color: "240,80,200", a: 0.045 },
          { x: width * 0.5 + Math.sin(t3 * 0.3) * 120, y: height * 0.8 + Math.cos(t3 * 0.8) * 40, r: 200, color: "150,50,230", a: 0.035 },
        ];
        for (const b of blobs) {
          const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          g.addColorStop(0, `rgba(${b.color},${b.a})`);
          g.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.globalAlpha = 1;
          ctx.fill();
        }
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
