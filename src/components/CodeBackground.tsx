import { useEffect, useRef } from "react";

const CODE_LINES = [
  "import { useState, useEffect } from 'react'",
  "import { motion, AnimatePresence } from 'framer-motion'",
  "import { useQuery } from '@tanstack/react-query'",
  "import express from 'express'",
  "import { db } from '../db/client'",
  "import { eq, desc } from 'drizzle-orm'",
  "const server = express()",
  "app.use(cors({ origin: process.env.ORIGIN }))",
  "const [data, setData] = useState<Project[]>([])",
  "router.get('/api/projects', authenticate, async (req, res) => {",
  "  const rows = await db.select().from(projects)",
  "  .where(eq(projects.userId, req.user!.id))",
  "  .orderBy(desc(projects.createdAt)).limit(50)",
  "  return res.json({ data: rows, ok: true })",
  "})",
  "export default function Dashboard({ userId }: Props) {",
  "  const { data, isLoading } = useQuery({",
  "    queryKey: ['projects', userId],",
  "    queryFn: () => fetchProjects(userId),",
  "  })",
  "interface Project {",
  "  id: string; name: string",
  "  stack: string[]; budget: number",
  "  status: 'active' | 'done' | 'paused'",
  "}",
  "const token = jwt.sign({ id: user.id }, SECRET)",
  "const hash = await bcrypt.hash(password, 12)",
  "await redis.setex(`session:${id}`, 3600, JSON.stringify(data))",
  "type ApiResponse<T> = { data: T; ok: boolean }",
  "  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}",
  "  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}",
  "ws.on('message', (d) => handleMessage(JSON.parse(d.toString())))",
  "return () => { ws.close(); clearInterval(heartbeat) }",
  "export const users = pgTable('users', {",
  "  id: text('id').primaryKey().$defaultFn(() => createId()),",
  "  email: text('email').notNull().unique(),",
  "})",
  "$ pnpm run build",
  "✓ TypeScript — 0 errors",
  "✓ Bundle: 87 KB gzip — built in 1.24s",
  "$ pnpm run deploy",
  "✓ Deployed to kodeflow.dev",
  "→ GitHub Actions triggered",
  "→ PM2 restarted — uptime 99.9%",
  "const stripe = new Stripe(process.env.STRIPE_KEY!)",
  "  .returning({ id: projects.id, name: projects.name })",
];

const KW = new Set([
  "import","export","from","default","const","let","var","function","return",
  "if","else","async","await","class","interface","type","new","this",
  "true","false","null","undefined","void","typeof","extends","for","of","in",
]);

type Seg = { text: string; color: string };

function tokenize(line: string): Seg[] {
  if (line.startsWith("$ "))   return [{ text: line, color: "#f472b6" }];
  if (line.startsWith("✓ "))   return [{ text: line, color: "#4ade80" }];
  if (line.startsWith("→ "))   return [{ text: line, color: "#a78bfa" }];
  if (line.startsWith("//"))   return [{ text: line, color: "#3d7a56" }];

  const segs: Seg[] = [];
  const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[\w$]+\b|[^\w\s$"'`]+|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) { segs.push({ text: t, color: "" }); continue; }
    let color: string;
    if ((t[0] === '"' || t[0] === "'" || t[0] === "`") && t.length > 1)
      color = "#fbbf24";
    else if (KW.has(t))
      color = "#c084fc";
    else if (/^[A-Z][A-Za-z0-9]*$/.test(t))
      color = "#60a5fa";
    else if (/^\d+$/.test(t))
      color = "#f9a8d4";
    else if (["=>","===","!==","&&","||","??","?."].includes(t))
      color = "#67e8f9";
    else if ("{}" .includes(t) && t.length === 1)
      color = "#a78bfa";
    else
      color = "#94a3b8";
    segs.push({ text: t, color });
  }
  return segs;
}

interface Stream { x: number; y: number; speed: number; startLine: number; opacity: number; lines: number; }

export default function CodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");   // alpha: true — transparent canvas
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const FS = 13;
    const LH = FS * 1.85;
    ctx.font = `${FS}px "JetBrains Mono", monospace`;

    const tokenized = CODE_LINES.map(l => tokenize(l));

    const COL_W = Math.floor(W / 3);

    function makeStream(col: number, yStart?: number): Stream {
      return {
        x: col * COL_W + 12 + Math.random() * 20,
        y: yStart ?? (Math.random() * H),   // start ON screen by default
        speed: 0.7 + Math.random() * 0.8,
        startLine: Math.floor(Math.random() * CODE_LINES.length),
        opacity: 0.75 + Math.random() * 0.22,  // 0.75–0.97
        lines: 18 + Math.floor(Math.random() * 10),
      };
    }

    const numCols = Math.max(3, Math.ceil(W / COL_W));
    const streams: Stream[] = [];
    for (let c = 0; c < numCols; c++) {
      streams.push(makeStream(c, Math.random() * H));           // immediately visible
      if (W > 800) streams.push(makeStream(c, -Math.random() * H * 0.4)); // 2nd per col
    }

    function drawStream(s: Stream) {
      ctx.font = `${FS}px "JetBrains Mono", monospace`;
      for (let li = 0; li < s.lines; li++) {
        const lineY = s.y + li * LH;
        if (lineY < -LH || lineY > H + LH) continue;

        const head = Math.min(1, li / 3);
        const tail = Math.min(1, (s.lines - li) / 4);
        const alpha = s.opacity * head * tail;
        if (alpha < 0.06) continue;

        const isHead = li < 2;
        const lineIdx = (s.startLine + li) % CODE_LINES.length;
        const segs = tokenized[lineIdx];

        let xCur = s.x;
        for (const seg of segs) {
          if (!seg.color) { xCur += ctx.measureText(seg.text).width; continue; }
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.fillStyle = isHead ? "#e8d5ff" : seg.color;
          ctx.fillText(seg.text, xCur, lineY);
          xCur += ctx.measureText(seg.text).width;
        }
      }
      s.y += s.speed;
      if (s.y > H + s.lines * LH + 30) {
        const col = Math.floor(s.x / COL_W);
        Object.assign(s, makeStream(col, -s.lines * LH));
      }
    }

    let raf: number;
    let last = 0;
    const FPS = 1000 / 30;
    let paused = false;

    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);
    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; }, 200); };
    window.addEventListener("resize", onResize, { passive: true });

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (paused || now - last < FPS) return;
      last = now;
      ctx.clearRect(0, 0, W, H);   // transparent — body bg shows through
      for (const s of streams) drawStream(s);
      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); clearTimeout(rt); window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none"
      style={{ position: "fixed", inset: 0, zIndex: 1, opacity: 1 }}
    />
  );
}
