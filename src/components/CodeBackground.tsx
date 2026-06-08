import { useEffect, useRef } from "react";

const TOKENS = [
  "const","let","var","function","return","if","else","for","while","class",
  "import","export","default","async","await","try","catch","new","this",
  "typeof","=>","===","!==","&&","||","...","??","?.","++","--",
  "useState","useEffect","useRef","useCallback","useMemo","useContext",
  "interface","type","string","number","boolean","Promise","Array","void","any",
  "data","value","props","state","index","item","node","event","error","result",
  "query","response","config","token","req","res","next","app","router","db",
  "true","false","null","undefined","0","1","[]","{}","()","=>",
  "fetch","then","catch","JSON","parse","stringify","Object","keys","map",
  "filter","reduce","find","forEach","push","pop","splice","slice","join",
  "flex","grid","px","rem","vh","vw","rgba","transform","transition",
  "fs","path","http","server","listen","connect","send","emit","on",
  ".dev",".tsx",".ts",".css","npm","pnpm","git","push","build","run",
];

interface Stream {
  x: number;
  y: number;
  speed: number;
  tokens: string[];
  length: number;
  opacity: number;
  color: string;
  charIndex: number;
  nextTokenTimer: number;
}

export default function CodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const FONT_SIZE = 13;
    const COL_WIDTH = 22;
    const COLORS = [
      "#b855ff", "#c97aff", "#9b30e8",
      "#8b5cf6", "#a78bfa", "#7c3aed",
      "#d946ef", "#e879f9", "#c026d3",
      "#6366f1", "#818cf8",
    ];

    const numCols = Math.ceil(width / COL_WIDTH);

    const createStream = (colIndex: number): Stream => {
      const length = 8 + Math.floor(Math.random() * 18);
      const tokens: string[] = [];
      for (let i = 0; i < length + 5; i++) {
        tokens.push(TOKENS[Math.floor(Math.random() * TOKENS.length)]);
      }
      return {
        x: colIndex * COL_WIDTH + Math.random() * 8,
        y: -Math.random() * height * 1.5,
        speed: 0.4 + Math.random() * 1.2,
        tokens,
        length,
        opacity: 0.15 + Math.random() * 0.45,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        charIndex: 0,
        nextTokenTimer: 0,
      };
    };

    const streams: Stream[] = Array.from({ length: numCols }, (_, i) => createStream(i));

    // Trail buffer: each cell stores [token, alpha]
    type Cell = { token: string; alpha: number; color: string };
    const trail: Map<string, Cell[]> = new Map();

    let rafId: number;
    let lastTime = 0;
    let paused = false;
    const TARGET_MS = 1000 / 28;

    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Fira Code", monospace`;

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (paused) return;
      if (now - lastTime < TARGET_MS) return;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let si = 0; si < streams.length; si++) {
        const s = streams[si];
        s.y += s.speed;

        const key = String(si);
        if (!trail.has(key)) trail.set(key, []);
        const cells = trail.get(key)!;

        // Push new leading token
        s.nextTokenTimer += s.speed;
        if (s.nextTokenTimer >= FONT_SIZE * 1.4) {
          s.nextTokenTimer = 0;
          const tok = s.tokens[s.charIndex % s.tokens.length];
          s.charIndex++;
          cells.unshift({ token: tok, alpha: 1.0, color: s.color });
          if (cells.length > s.length) cells.pop();
        }

        // Draw trail
        for (let ci = 0; ci < cells.length; ci++) {
          const cell = cells[ci];
          const yPos = s.y - ci * FONT_SIZE * 1.4;
          if (yPos < -20 || yPos > height + 20) continue;

          const trailFade = 1 - ci / cells.length;
          let alpha: number;
          let color: string;

          if (ci === 0) {
            // Leading token — brightest, near white
            alpha = s.opacity * 1.0;
            color = "#f0f0ff";
          } else if (ci < 3) {
            // Near-head — bright color
            alpha = s.opacity * trailFade * 0.9;
            color = s.color;
          } else {
            // Tail — dimmer
            alpha = s.opacity * trailFade * 0.5;
            color = s.color;
          }

          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.fillStyle = color;
          ctx.fillText(cell.token, s.x, yPos);
        }

        // Reset when stream goes off screen
        if (s.y - s.length * FONT_SIZE * 1.4 > height + 100) {
          const newStream = createStream(si);
          streams[si] = newStream;
          trail.set(String(si), []);
        }
      }

      ctx.globalAlpha = 1;
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  );
}
