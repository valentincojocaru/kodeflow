import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  // Tight spring for core dot
  const sx = useSpring(mx, { stiffness: 160, damping: 22, mass: 0.35 });
  const sy = useSpring(my, { stiffness: 160, damping: 22, mass: 0.35 });
  // Lazy spring for outer ring
  const tx = useSpring(mx, { stiffness: 42, damping: 24, mass: 0.8 });
  const ty = useSpring(my, { stiffness: 42, damping: 24, mass: 0.8 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Trail stored as raw array — zero React state updates
    interface TrailPt { x: number; y: number; birth: number; }
    const trail: TrailPt[] = [];
    const TRAIL_LEN = 10;   // reduced from 14 → fewer gradient calls
    const TRAIL_LIFE = 480; // ms — slightly shorter for snappier feel

    let rafId: number;
    const renderTrail = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Expire old points in-place (avoid filter + spread allocation each frame)
      let write = 0;
      for (let i = 0; i < trail.length; i++) {
        if (now - trail[i].birth < TRAIL_LIFE) trail[write++] = trail[i];
      }
      trail.length = write;

      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const age = (now - p.birth) / TRAIL_LIFE;
        const alpha = (1 - age) * 0.65;
        const r = 3.5 * (1 - age * 0.55);
        // Skip tiny/invisible trail dots — saves gradient creation
        if (alpha < 0.04 || r < 0.5) continue;
        const outerR = r * 2.5;
        const hue = i % 2 === 0 ? "184,80,255" : "240,80,200";
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, outerR);
        grad.addColorStop(0, `rgba(${hue},${alpha})`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, outerR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      rafId = requestAnimationFrame(renderTrail);
    };
    rafId = requestAnimationFrame(renderTrail);

    const move = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
      // Push trail point — no setState
      if (trail.length >= TRAIL_LEN) trail.shift();
      trail.push({ x: e.clientX, y: e.clientY, birth: performance.now() });
    };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const leave = () => setVisible(false);
    const hover = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovering(!!el.closest("a, button, [role=button], input, textarea, select, [data-magnetic]"));
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousemove", hover, { passive: true });
    window.addEventListener("mousedown", down, { passive: true });
    window.addEventListener("mouseup", up, { passive: true });
    document.addEventListener("mouseleave", leave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousemove", hover);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
    };
  }, [mx, my]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>

      {/* Canvas-based trail — no React re-renders per trail point */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9989, mixBlendMode: "screen" }}
      />

      {/* Outer ring */}
      <motion.div className="fixed top-0 left-0 pointer-events-none"
        style={{ x: tx, y: ty, translateX: "-50%", translateY: "-50%", zIndex: 9998 }}>
        <motion.div className="rounded-full border"
          animate={{
            width: clicking ? 16 : hovering ? 50 : 38,
            height: clicking ? 16 : hovering ? 50 : 38,
            opacity: visible ? 1 : 0,
            borderColor: hovering ? "rgba(240,80,200,0.75)" : "rgba(184,80,255,0.5)",
          }}
          transition={{ duration: 0.15 }}
          style={{
            boxShadow: hovering
              ? "0 0 18px rgba(240,80,200,0.35), inset 0 0 8px rgba(240,80,200,0.08)"
              : "0 0 14px rgba(184,80,255,0.25), inset 0 0 6px rgba(184,80,255,0.06)",
          }}
        />
      </motion.div>

      {/* Core dot */}
      <motion.div className="fixed top-0 left-0 pointer-events-none"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%", zIndex: 9999 }}>
        <motion.div className="rounded-full"
          animate={{
            width: clicking ? 4 : hovering ? 10 : 6,
            height: clicking ? 4 : hovering ? 10 : 6,
            opacity: visible ? 1 : 0,
            backgroundColor: hovering ? "#f050c8" : "#b855ff",
          }}
          transition={{ duration: 0.09 }}
          style={{
            boxShadow: hovering
              ? "0 0 16px rgba(240,80,200,1), 0 0 32px rgba(240,80,200,0.55)"
              : "0 0 14px rgba(184,80,255,1), 0 0 28px rgba(184,80,255,0.55)",
          }}
        />
      </motion.div>
    </>
  );
}
