import { useEffect, useRef } from "react";

// ─── Real code lines ────────────────────────────────────────────────────────

const CODE_LINES = [
  "import { useState, useEffect, useCallback } from 'react'",
  "import { motion, AnimatePresence } from 'framer-motion'",
  "import { useQuery } from '@tanstack/react-query'",
  "import express from 'express'",
  "import { db } from '../db/client'",
  "import { eq, desc } from 'drizzle-orm'",
  "const server = express()",
  "app.use(cors({ origin: process.env.ORIGIN }))",
  "const [loading, setLoading] = useState(false)",
  "const [data, setData] = useState<Project[]>([])",
  "router.get('/api/projects', authenticate, async (req, res) => {",
  "  const rows = await db.select().from(projects)",
  "  return res.json({ data: rows, ok: true })",
  "})",
  "export default function Dashboard({ userId }: Props) {",
  "  const { data, isLoading } = useQuery({",
  "    queryKey: ['projects', userId],",
  "    queryFn: () => fetchProjects(userId),",
  "    staleTime: 5 * 60 * 1000,",
  "  })",
  "interface Project {",
  "  id: string; name: string",
  "  stack: string[]; budget: number",
  "  status: 'active' | 'done' | 'paused'",
  "}",
  "const schema = z.object({",
  "  name: z.string().min(1).max(100),",
  "  budget: z.number().min(0),",
  "})",
  "await db.insert(projects).values({ name, userId, createdAt: new Date() })",
  "  .returning({ id: projects.id })",
  "const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' })",
  "const hash = await bcrypt.hash(password, 12)",
  "await redis.setex(`session:${id}`, 3600, JSON.stringify(data))",
  "type ApiResponse<T> = { data: T; ok: boolean; error?: string }",
  "  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}",
  "  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}",
  "  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}",
  "ws.on('message', (data) => handleMessage(JSON.parse(data.toString())))",
  "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)",
  "return () => { ws.close(); clearInterval(heartbeat) }",
  "export const users = pgTable('users', {",
  "  id: text('id').primaryKey().$defaultFn(() => createId()),",
  "  email: text('email').notNull().unique(),",
  "  role: text('role').notNull().default('client'),",
  "})",
  "$ pnpm run build",
  "✓ TypeScript — 0 errors, 0 warnings",
  "✓ Bundle: 87 KB gzip — built in 1.24s",
  "$ pnpm run deploy",
  "▸ Pushing to Vercel edge network...",
  "▸ Warming 23 CDN regions...",
  "✓ Live → kodeflow.dev",
  "$ git push origin main --force",
  "→ GitHub Actions triggered",
  "→ SSH: root@62.171.167.115 — deploy.sh",
  "→ PM2 restarted — uptime 99.9%",
  "const cleanup = () => { ws.close(); clearInterval(ping) }",
  "  .where(eq(projects.userId, req.user!.id))",
  "  .orderBy(desc(projects.createdAt)).limit(50)",
  "const middleware = [authenticate, rateLimit, validateBody(schema)]",
];

// ─── Tokenizer ──────────────────────────────────────────────────────────────

const KW = new Set([
  "import","export","from","default","const","let","var","function","return",
  "if","else","async","await","class","interface","type","new","this",
  "true","false","null","undefined","void","typeof","extends","for","of","in",
]);

type Seg = { text: string; color: string };

function tokenize(line: string): Seg[] {
  // Shell/terminal lines
  if (line.startsWith("$ "))   return [{ text: line, color: "#f472b6" }];
  if (line.startsWith("✓ "))   return [{ text: line, color: "#4ade80" }];
  if (line.startsWith("▸ "))   return [{ text: line, color: "#94a3b8" }];
  if (line.startsWith("→ "))   return [{ text: line, color: "#a78bfa" }];
  if (line.startsWith("//"))   return [{ text: line, color: "#3d7a56" }];

  const segs: Seg[] = [];
  const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[\w$]+\b|[^\w\s$"'`]+|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) { segs.push({ text: t, color: "" }); continue; }
    let color: string;
    if ((t[0] === '"' || t[0] === "'" || t[0] === "`") && t.length > 1) {
      color = "#fbbf24";
    } else if (KW.has(t)) {
      color = "#c084fc";
    } else if (/^[A-Z][A-Za-z0-9]*$/.test(t)) {
      color = "#60a5fa";
    } else if (/^\d+$/.test(t)) {
      color = "#f9a8d4";
    } else if (["=>","===","!==","&&","||","??","?.","..."].includes(t)) {
      color = "#67e8f9";
    } else if ("{}" .includes(t) && t.length === 1) {
      color = "#a78bfa";
    } else if (t === "<" || t === ">") {
      color = "#f472b6";
    } else {
      color = "#94a3b8";
    }
    segs.push({ text: t, color });
  }
  return segs;
}

// ─── Stream state ───────────────────────────────────────────────────────────

interface Stream {
  x: number;
  y: number;
  speed: number;
  startLineIdx: number;
  opacity: number;
  numLines: number;
}

export default function CodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // alpha: false so canvas is opaque — we paint the bg ourselves
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const FS = 12;
    const LH = FS * 1.8;
    ctx.font = `${FS}px "JetBrains Mono", monospace`;

    // Pre-tokenize every line
    const tokenized = CODE_LINES.map(l => tokenize(l));

    // Measure avg char width for column layout
    const CW = ctx.measureText("m").width;
    const COL_WIDTH = Math.floor(W / 3.2); // ~3 columns on screen

    function makeStream(xBase: number, initialY?: number): Stream {
      return {
        x: xBase + Math.random() * 30 - 15,
        y: initialY ?? -Math.random() * H, // start within one screen height above
        speed: 0.6 + Math.random() * 0.9,
        startLineIdx: Math.floor(Math.random() * CODE_LINES.length),
        opacity: 0.55 + Math.random() * 0.35, // 0.55–0.90
        numLines: 16 + Math.floor(Math.random() * 14), // 16-29 lines per stream
      };
    }

    // Create streams — multiple per column for density
    const streams: Stream[] = [];
    const numCols = Math.max(3, Math.ceil(W / COL_WIDTH));
    for (let c = 0; c < numCols; c++) {
      const xBase = c * COL_WIDTH;
      // 2 streams per column, offset vertically
      streams.push(makeStream(xBase, -Math.random() * H));
      if (W > 900) {
        streams.push(makeStream(xBase + COL_WIDTH * 0.5, -Math.random() * H * 0.5));
      }
    }

    function drawStream(s: Stream) {
      for (let li = 0; li < s.numLines; li++) {
        const lineY = s.y + li * LH;
        if (lineY < -LH || lineY > H + LH) continue;

        // Fade: bright in middle, fades at top (head) and bottom (tail)
        const normPos = li / s.numLines;
        const headFade = Math.min(1, li / 4);
        const tailFade = Math.min(1, (s.numLines - li) / 5);
        const posAlpha = headFade * tailFade;

        // Leading edge (top of stream) = brightest
        const isHead = li < 2;
        const alpha = isHead
          ? Math.min(1, s.opacity * 1.15)
          : s.opacity * posAlpha;

        if (alpha < 0.04) continue;

        const lineIdx = (s.startLineIdx + li) % CODE_LINES.length;
        const segs = tokenized[lineIdx];

        let xCur = s.x;
        for (const seg of segs) {
          if (!seg.color) {
            xCur += ctx.measureText(seg.text).width;
            continue;
          }
          const color = isHead ? "#ddd6fe" : seg.color;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.fillText(seg.text, xCur, lineY);
          xCur += ctx.measureText(seg.text).width;
        }
      }

      // Scroll
      s.y += s.speed;

      // Reset when stream fully exits bottom
      if (s.y > H + s.numLines * LH + 40) {
        const col = Math.floor(s.x / COL_WIDTH);
        Object.assign(s, makeStream(col * COL_WIDTH, -s.numLines * LH - Math.random() * 200));
      }
    }

    const BG_COLOR = "hsl(258, 35%, 8%)"; // slightly darker than --background

    let raf: number;
    let last = 0;
    const FPS = 1000 / 28;

    let paused = false;
    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
        ctx.font = `${FS}px "JetBrains Mono", monospace`;
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (paused || now - last < FPS) return;
      last = now;

      // Paint background first (opaque canvas)
      ctx.globalAlpha = 1;
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, W, H);

      // Draw all streams
      ctx.font = `${FS}px "JetBrains Mono", monospace`;
      for (const s of streams) drawStream(s);

      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
