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
  "  if (isLoading) return <Spinner />",
  "  return <ProjectList items={data} />",
  "}",
  "interface Project {",
  "  id: string; name: string",
  "  stack: string[]; budget: number",
  "  status: 'active' | 'done' | 'paused'",
  "}",
  "const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' })",
  "const hash = await bcrypt.hash(password, 12)",
  "type ApiResponse<T> = { data: T; ok: boolean; error?: string }",
  "  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}",
  "  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}",
  "export const users = pgTable('users', {",
  "  id: text('id').primaryKey().$defaultFn(() => createId()),",
  "  email: text('email').notNull().unique(),",
  "  createdAt: timestamp('created_at').defaultNow(),",
  "})",
  "const stripe = new Stripe(process.env.STRIPE_KEY!)",
  "async function authenticate(req: Request, res: Response, next: NextFunction) {",
  "  const bearer = req.headers.authorization?.split(' ')[1]",
  "  if (!bearer) return res.status(401).json({ error: 'Unauthorized' })",
  "  req.user = jwt.verify(bearer, SECRET) as JWTPayload",
  "  next()",
  "}",
  "const schema = z.object({",
  "  email: z.string().email(),",
  "  password: z.string().min(8).max(128),",
  "})",
  "await redis.setex(`session:${id}`, 3600, JSON.stringify(payload))",
  "ws.on('message', (raw) => handleMessage(JSON.parse(raw.toString())))",
  "return () => { ws.close(); clearInterval(heartbeat) }",
  "const { data: projects } = useSuspenseQuery({ queryKey: ['projects'] })",
  "  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}",
  "export async function POST(req: Request) {",
  "  const body = await req.json()",
  "  const parsed = schema.safeParse(body)",
  "  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 })",
  "  return Response.json({ ok: true })",
  "}",
];

const KW = new Set([
  "import","export","from","default","const","let","var","function","return",
  "if","else","async","await","class","interface","type","new","this",
  "true","false","null","undefined","void","typeof","extends","for","of","in",
]);

type Seg = { text: string; color: string };

function tokenize(line: string): Seg[] {
  if (line.startsWith("$ "))  return [{ text: line, color: "#f472b6" }];
  if (line.startsWith("✓ "))  return [{ text: line, color: "#4ade80" }];
  if (line.startsWith("→ "))  return [{ text: line, color: "#a78bfa" }];
  if (line.startsWith("//") || line.trimStart().startsWith("//"))
    return [{ text: line, color: "#4a7c59" }];

  const segs: Seg[] = [];
  const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[\w$]+\b|[^\w\s$"'`]+|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) { segs.push({ text: t, color: "" }); continue; }
    let color: string;
    if ((t[0] === '"' || t[0] === "'" || t[0] === "`") && t.length > 1) color = "#fbbf24";
    else if (KW.has(t))                               color = "#c084fc";
    else if (/^[A-Z][A-Za-z0-9]*$/.test(t))          color = "#60a5fa";
    else if (/^\d+$/.test(t))                         color = "#f9a8d4";
    else if (["=>","===","!==","&&","||","??","?."].includes(t)) color = "#67e8f9";
    else if ("{}".includes(t) && t.length === 1)      color = "#a78bfa";
    else                                               color = "#94a3b8";
    segs.push({ text: t, color });
  }
  return segs;
}

interface CompletedLine { text: string; segs: Seg[] }

interface Session {
  x: number;
  y: number;
  completedLines: CompletedLine[];
  typed: string;
  targetLineIdx: number;
  nextCharAt: number;
  nextCursorAt: number;
  cursorOn: boolean;
  state: "typing" | "line_pause" | "block_pause";
  stateUntil: number;
  opacity: number;
  maxLines: number;
  charDelay: () => number;
}

function randBetween(a: number, b: number) { return a + Math.random() * (b - a); }

function makeSession(index: number, total: number, W: number, H: number, now: number): Session {
  const cols = total <= 2 ? 2 : total <= 3 ? 3 : 4;
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const cellW = W / cols;
  const cellH = H / rows;
  const x = col * cellW + cellW * 0.1 + Math.random() * cellW * 0.3;
  const y = row * cellH + cellH * 0.15 + Math.random() * cellH * 0.25;
  const startLine = Math.floor(Math.random() * CODE_LINES.length);

  return {
    x,
    y,
    completedLines: [],
    typed: "",
    targetLineIdx: startLine,
    nextCharAt: now + index * 200 + Math.random() * 150,
    nextCursorAt: now + 530,
    cursorOn: true,
    state: "typing",
    stateUntil: 0,
    opacity: randBetween(0.38, 0.55),
    maxLines: Math.floor(randBetween(6, 10)),
    charDelay: () => {
      const r = Math.random();
      if (r < 0.08) return randBetween(180, 380); // thinking pause
      if (r < 0.18) return randBetween(90, 160);  // slightly slower
      return randBetween(28, 75);                  // normal typing
    },
  };
}

export default function CodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const FS = 13;
    const LH = FS * 2;
    const CURSOR = "|";
    const isMobile = window.innerWidth < 640;
    const numSessions = isMobile ? 2 : window.innerWidth < 1024 ? 3 : 5;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    ctx.font = `${FS}px "JetBrains Mono", monospace`;

    const tokenized = CODE_LINES.map(tokenize);
    let sessions: Session[] = [];
    const now = performance.now();
    for (let i = 0; i < numSessions; i++) {
      sessions.push(makeSession(i, numSessions, W, H, now));
    }

    function drawSegs(segs: Seg[], x: number, y: number, alpha: number, maxW: number, glow = false) {
      let xCur = x;
      for (const seg of segs) {
        if (!seg.color) {
          xCur += ctx.measureText(seg.text).width;
          if (xCur > x + maxW) break;
          continue;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = seg.color;
        if (glow) {
          ctx.shadowColor = seg.color;
          ctx.shadowBlur = 8;
        }
        const w = ctx.measureText(seg.text).width;
        if (xCur + w > x + maxW) break;
        ctx.fillText(seg.text, xCur, y);
        xCur += w;
      }
      if (glow) ctx.shadowBlur = 0;
    }

    function drawSession(s: Session, now: number) {
      const maxLineWidth = Math.min(W - s.x - 20, 420);

      ctx.font = `${FS}px "JetBrains Mono", monospace`;

      const totalLines = s.completedLines.length;

      s.completedLines.forEach((line, i) => {
        const lineY = s.y + i * LH;
        if (lineY < 0 || lineY > H) return;
        const age = totalLines - i;
        const fadeRatio = age > s.maxLines - 2
          ? Math.max(0, 1 - (age - (s.maxLines - 2)) / 2)
          : 1;
        const alpha = s.opacity * fadeRatio;
        if (alpha < 0.02) return;
        const isRecent = age <= 2;
        drawSegs(line.segs, s.x, lineY, alpha, maxLineWidth, isRecent);
      });

      const currentY = s.y + s.completedLines.length * LH;
      if (currentY > 0 && currentY < H && s.typed.length > 0) {
        const partialSegs = tokenize(s.typed);
        drawSegs(partialSegs, s.x, currentY, s.opacity, maxLineWidth, true);

        if (s.state === "typing" && s.cursorOn) {
          const typedWidth = ctx.measureText(s.typed).width;
          ctx.globalAlpha = s.opacity;
          ctx.shadowColor = "#c084fc";
          ctx.shadowBlur = 12;
          ctx.fillStyle = "#c084fc";
          ctx.fillText(CURSOR, s.x + typedWidth, currentY);
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
    }

    function updateSession(s: Session, now: number) {
      if (now >= s.nextCursorAt) {
        s.cursorOn = !s.cursorOn;
        s.nextCursorAt = now + 530;
      }

      if (s.state === "line_pause") {
        if (now >= s.stateUntil) {
          s.completedLines.push({
            text: s.typed,
            segs: tokenize(s.typed),
          });

          if (s.completedLines.length > s.maxLines + 2) {
            s.completedLines.shift();
            s.y -= LH;
          }

          s.typed = "";
          s.targetLineIdx = (s.targetLineIdx + 1) % CODE_LINES.length;
          s.state = "typing";
          s.nextCharAt = now + randBetween(60, 180);
        }
        return;
      }

      if (s.state === "block_pause") {
        if (now >= s.stateUntil) {
          s.completedLines = [];
          s.typed = "";
          s.state = "typing";
          s.nextCharAt = now + randBetween(200, 500);
        }
        return;
      }

      if (s.state === "typing") {
        if (now < s.nextCharAt) return;

        const target = CODE_LINES[s.targetLineIdx];
        if (s.typed.length < target.length) {
          s.typed += target[s.typed.length];
          s.nextCharAt = now + s.charDelay();
        } else {
          s.state = "line_pause";
          s.stateUntil = now + randBetween(250, 700);

          const linesInView = s.completedLines.length + 1;
          if (linesInView >= s.maxLines + 2) {
            s.state = "block_pause";
            s.stateUntil = now + randBetween(2000, 4000);
            s.completedLines.push({ text: s.typed, segs: tokenize(s.typed) });
            s.typed = "";
          }
        }
      }
    }

    let raf: number;
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
        const newMobile = W < 640;
        const newCount = newMobile ? 2 : W < 1024 ? 3 : 4;
        const t = performance.now();
        sessions = [];
        for (let i = 0; i < newCount; i++) sessions.push(makeSession(i, newCount, W, H, t));
      }, 250);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (paused) return;
      ctx.clearRect(0, 0, W, H);
      for (const s of sessions) {
        updateSession(s, now);
        drawSession(s, now);
      }
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
      className="pointer-events-none"
      style={{ position: "fixed", inset: 0, zIndex: 1, opacity: 1 }}
    />
  );
}
