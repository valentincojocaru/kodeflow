import { useEffect, useRef } from "react";

// ─── Real code lines to stream ─────────────────────────────────────────────

const CODE_LINES = [
  "const server = express()",
  "app.use(cors({ origin: '*' }))",
  "router.get('/api/projects', authenticate, async (req, res) => {",
  "  const data = await db.select().from(projects)",
  "  return res.json({ data, ok: true })",
  "})",
  "import { useState, useEffect, useCallback } from 'react'",
  "const [loading, setLoading] = useState(false)",
  "const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })",
  "export default function Dashboard({ userId }: Props) {",
  "  return <motion.div animate={{ opacity: 1 }}>",
  "interface Project { id: string; name: string; stack: string[] }",
  "const schema = z.object({ name: z.string().min(1), budget: z.number() })",
  "await db.insert(projects).values({ name, userId, createdAt: new Date() })",
  "const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!)",
  "  .where(eq(projects.userId, req.user!.id))",
  "  .orderBy(desc(projects.createdAt)).limit(50)",
  "export const users = pgTable('users', { id: text('id').primaryKey() })",
  "const res = await fetch('/api/projects', { headers: authHeaders })",
  "useEffect(() => { fetchMetrics().then(setData) }, [userId])",
  "if (!session) redirect('/login')",
  "const hash = await bcrypt.hash(password, 12)",
  "ws.on('message', (data) => handleMessage(JSON.parse(data)))",
  "  .returning({ id: projects.id, name: projects.name })",
  "const stripe = new Stripe(process.env.STRIPE_KEY!)",
  "await redis.setex(`cache:${key}`, 300, JSON.stringify(data))",
  "type ApiResponse<T> = { data: T; ok: boolean; error?: string }",
  "const [selected, setSelected] = useState<string | null>(null)",
  "  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}",
  "export async function POST(req: Request) {",
  "  const body = await req.json()",
  "  const parsed = schema.safeParse(body)",
  "  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })",
  "pnpm run build && pnpm run deploy",
  "✓ TypeScript — 0 errors",
  "✓ Bundle: 87kb gzip — built in 1.24s",
  "✓ Deployed → kodeflow.dev",
  "▸ Warming 23 CDN edge regions...",
  "▸ SSL certificate renewed",
  "▸ PM2 restarted — uptime 99.9%",
  "const cleanup = () => { ws.close(); clearInterval(ping) }",
  "return () => cleanup()",
  "  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]))",
  "  style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}",
  "  className=\"grid grid-cols-3 gap-6 items-center\"",
  "git add . && git commit -m 'feat: stripe integration'",
  "git push origin main --force",
  "→ GitHub Actions triggered",
  "→ SSH: root@62.171.167.115",
  "→ deploy.sh executing...",
  "  const emit = useCallback((ev: string, payload: unknown) => {",
  "    socket.emit(ev, payload)",
  "  }, [socket])",
  "export { router as projectsRouter }",
  "app.listen(PORT, () => console.log(`✓ API ready on :${PORT}`))",
  "const middleware = [authenticate, rateLimit, validateBody(schema)]",
  "  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}",
];

// ─── Token type detection for color ───────────────────────────────────────

const KW = new Set(["const","let","var","function","return","if","else","async","await",
  "import","export","default","class","interface","type","from","new","this",
  "true","false","null","undefined","void","typeof","instanceof","extends"]);

type Segment = { text: string; color: string; width: number };

function tokenizeLine(line: string, ctx: CanvasRenderingContext2D): Segment[] {
  const segments: Segment[] = [];

  // Comments / shell output lines
  if (line.startsWith("//")) {
    const w = ctx.measureText(line).width;
    return [{ text: line, color: "#3d6b4f", width: w }];
  }
  if (line.startsWith("✓") || line.startsWith("▸") || line.startsWith("→")) {
    const color = line.startsWith("✓") ? "#22c55e" : line.startsWith("▸") ? "#94a3b8" : "#a78bfa";
    const w = ctx.measureText(line).width;
    return [{ text: line, color, width: w }];
  }
  if (line.startsWith("git ") || line.startsWith("pnpm ")) {
    const w = ctx.measureText(line).width;
    return [{ text: line, color: "#f472b6" }];
  }

  const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[\w$]+\b|[^\w\s$"'`]+|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) {
      segments.push({ text: t, color: "transparent", width: ctx.measureText(t).width });
      continue;
    }
    let color: string;
    if ((t.startsWith('"') || t.startsWith("'") || t.startsWith("`")) && t.length > 1) {
      color = "#fbbf24";
    } else if (KW.has(t)) {
      color = "#c084fc";
    } else if (/^[A-Z][A-Za-z0-9]*$/.test(t)) {
      color = "#60a5fa";
    } else if (/^\d+$/.test(t)) {
      color = "#f9a8d4";
    } else if (["=>","===","!==","&&","||","??","?.","..."].includes(t)) {
      color = "#67e8f9";
    } else if (t === "{" || t === "}" || t === "(" || t === ")") {
      color = "#a78bfa";
    } else if (t === "<" || t === ">") {
      color = "#f472b6";
    } else {
      color = "#94a3b8";
    }
    segments.push({ text: t, color, width: ctx.measureText(t).width });
  }
  return segments;
}

// ─── Column stream ──────────────────────────────────────────────────────────

interface Stream {
  x: number;
  y: number;
  speed: number;
  lineIndex: number;
  opacity: number;
  lineHeight: number;
  visibleLines: number;   // how many lines show at once
  cachedSegments: Segment[][];
}

export default function CodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const FONT_SIZE = 11.5;
    const LINE_H = FONT_SIZE * 1.72;
    ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Fira Code", monospace`;

    // Pre-cache all tokenized lines
    const allSegments: Segment[][] = CODE_LINES.map(l => tokenizeLine(l, ctx));

    function createStream(xPos: number, opacityOverride?: number): Stream {
      const startLine = Math.floor(Math.random() * CODE_LINES.length);
      const visibleLines = 14 + Math.floor(Math.random() * 12); // 14-25 lines visible
      return {
        x: xPos,
        y: -Math.random() * H * 0.8,
        speed: 0.5 + Math.random() * 1.1,
        lineIndex: startLine,
        opacity: opacityOverride ?? (0.25 + Math.random() * 0.38),
        lineHeight: LINE_H,
        visibleLines,
        cachedSegments: [],
      };
    }

    // Build streams — one per "column" across screen width
    const COL_W = 360;
    const NUM_COLS = Math.max(3, Math.ceil(W / COL_W));
    const streams: Stream[] = [];

    for (let i = 0; i < NUM_COLS; i++) {
      const xBase = i * COL_W + Math.random() * 40 - 20;
      // Stagger start positions so they don't all appear at once
      const s = createStream(xBase, 0.18 + Math.random() * 0.35);
      s.y = -Math.random() * H * 2.5; // deep stagger
      streams.push(s);
    }

    // Helper: draw one stream (scrolling block of lines)
    function drawStream(s: Stream) {
      const totalLineHeight = s.visibleLines * LINE_H;

      // Build line list from CODE_LINES starting at lineIndex
      const numToShow = s.visibleLines;

      for (let li = 0; li < numToShow; li++) {
        const lineDataIndex = (s.lineIndex + li) % CODE_LINES.length;
        const yPos = s.y + li * LINE_H;

        if (yPos < -LINE_H * 2 || yPos > H + LINE_H) continue;

        // Fade alpha: bright in middle, fade at head and tail
        const progress = li / numToShow;
        // Head fade (first few lines)
        const headFade = Math.min(1, li / 3);
        // Tail fade (last few lines)
        const tailFade = Math.min(1, (numToShow - li) / 4);
        const fadeAlpha = headFade * tailFade;

        // Leading line (last in the list = bottom) is brightest
        const isLeading = li === numToShow - 1;
        const lineAlpha = isLeading
          ? Math.min(1, s.opacity * 1.4)
          : s.opacity * fadeAlpha;

        if (lineAlpha < 0.01) continue;

        const segs = allSegments[lineDataIndex];
        let xCursor = s.x;

        for (const seg of segs) {
          if (seg.color === "transparent") {
            xCursor += seg.width;
            continue;
          }
          // Leading line: everything near-white for glow effect
          const color = isLeading ? "#e8e0ff" : seg.color;
          ctx.globalAlpha = Math.min(1, lineAlpha);
          ctx.fillStyle = color;
          ctx.fillText(seg.text, xCursor, yPos);
          xCursor += seg.width;
        }
      }

      // Advance stream
      s.y += s.speed;

      // Reset when fully off screen
      if (s.y + s.visibleLines * LINE_H > H + 120) {
        s.y = -s.visibleLines * LINE_H - Math.random() * H * 0.5;
        s.lineIndex = Math.floor(Math.random() * CODE_LINES.length);
        s.speed = 0.5 + Math.random() * 1.1;
        s.opacity = 0.18 + Math.random() * 0.38;
        s.visibleLines = 14 + Math.floor(Math.random() * 12);
      }
    }

    let rafId: number;
    let lastTime = 0;
    const TARGET_MS = 1000 / 30; // 30fps — smooth and efficient

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
        ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Fira Code", monospace`;
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (paused) return;
      if (now - lastTime < TARGET_MS) return;
      lastTime = now;

      ctx.clearRect(0, 0, W, H);
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Fira Code", monospace`;

      for (const s of streams) {
        drawStream(s);
      }

      ctx.globalAlpha = 1;
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.75 }}
    />
  );
}
