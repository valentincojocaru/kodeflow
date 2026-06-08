import { useEffect, useRef } from "react";

// ─── Real code lines for authentic look ────────────────────────────────────

const CODE_PANELS = [
  [
    "import React, { useState, useEffect } from 'react'",
    "import { motion, AnimatePresence } from 'framer-motion'",
    "import { useQuery } from '@tanstack/react-query'",
    "import { db } from '@/lib/database'",
    "",
    "interface Project {",
    "  id: string",
    "  name: string",
    "  stack: string[]",
    "  budget: number",
    "  deadline: Date",
    "  status: 'active' | 'done' | 'paused'",
    "}",
    "",
    "const Dashboard: React.FC = () => {",
    "  const [selected, setSelected] = useState<string | null>(null)",
    "  const [filter, setFilter] = useState<'all' | 'active'>('all')",
    "",
    "  const { data, isLoading } = useQuery({",
    "    queryKey: ['projects', filter],",
    "    queryFn: () => fetchProjects({ filter }),",
    "    staleTime: 5 * 60 * 1000,",
    "  })",
    "",
    "  useEffect(() => {",
    "    document.title = `KodeFlow — ${data?.length ?? 0} Projects`",
    "  }, [data])",
    "",
    "  const handleSelect = (id: string) => {",
    "    setSelected(prev => prev === id ? null : id)",
    "  }",
    "",
    "  if (isLoading) return <Spinner />",
    "",
    "  return (",
    "    <motion.div",
    "      className=\"grid grid-cols-3 gap-6\"",
    "      initial={{ opacity: 0, y: 20 }}",
    "      animate={{ opacity: 1, y: 0 }}",
    "    >",
    "      <AnimatePresence>",
    "        {data?.map(project => (",
    "          <ProjectCard",
    "            key={project.id}",
    "            project={project}",
    "            isSelected={selected === project.id}",
    "            onClick={() => handleSelect(project.id)}",
    "          />",
    "        ))}",
    "      </AnimatePresence>",
    "    </motion.div>",
    "  )",
    "}",
    "",
    "export default Dashboard",
  ],
  [
    "import express from 'express'",
    "import { db } from '../db/client'",
    "import { authenticate } from '../middleware/auth'",
    "import { z } from 'zod'",
    "import { eq, desc } from 'drizzle-orm'",
    "import { projects, users } from '../db/schema'",
    "",
    "const router = express.Router()",
    "",
    "const createSchema = z.object({",
    "  name: z.string().min(1).max(100),",
    "  description: z.string().optional(),",
    "  stack: z.array(z.string()),",
    "  budget: z.number().min(0),",
    "})",
    "",
    "// GET /api/projects",
    "router.get('/', authenticate, async (req, res) => {",
    "  try {",
    "    const items = await db",
    "      .select()",
    "      .from(projects)",
    "      .where(eq(projects.userId, req.user!.id))",
    "      .orderBy(desc(projects.createdAt))",
    "      .limit(50)",
    "",
    "    return res.json({ data: items, count: items.length })",
    "  } catch (err) {",
    "    console.error('[projects] GET error:', err)",
    "    return res.status(500).json({ error: 'Internal server error' })",
    "  }",
    "})",
    "",
    "// POST /api/projects",
    "router.post('/', authenticate, async (req, res) => {",
    "  const parsed = createSchema.safeParse(req.body)",
    "  if (!parsed.success) {",
    "    return res.status(400).json({ error: parsed.error.flatten() })",
    "  }",
    "",
    "  const { name, description, stack, budget } = parsed.data",
    "",
    "  const [project] = await db",
    "    .insert(projects)",
    "    .values({",
    "      name,",
    "      description: description ?? null,",
    "      stack,",
    "      budget,",
    "      userId: req.user!.id,",
    "      createdAt: new Date(),",
    "    })",
    "    .returning()",
    "",
    "  return res.status(201).json({ data: project })",
    "})",
    "",
    "export default router",
  ],
  [
    "import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core'",
    "import { createId } from '@paralleldrive/cuid2'",
    "",
    "export const users = pgTable('users', {",
    "  id: text('id').primaryKey().$defaultFn(() => createId()),",
    "  email: text('email').notNull().unique(),",
    "  name: text('name').notNull(),",
    "  role: text('role', { enum: ['admin', 'client'] }).notNull().default('client'),",
    "  createdAt: timestamp('created_at').notNull().defaultNow(),",
    "  updatedAt: timestamp('updated_at').notNull().defaultNow(),",
    "})",
    "",
    "export const projects = pgTable('projects', {",
    "  id: text('id').primaryKey().$defaultFn(() => createId()),",
    "  name: text('name').notNull(),",
    "  description: text('description'),",
    "  stack: text('stack').array().notNull().default([]),",
    "  budget: integer('budget').notNull().default(0),",
    "  status: text('status', {",
    "    enum: ['draft', 'active', 'review', 'done'],",
    "  }).notNull().default('draft'),",
    "  userId: text('user_id').notNull().references(() => users.id),",
    "  deadline: timestamp('deadline'),",
    "  createdAt: timestamp('created_at').notNull().defaultNow(),",
    "})",
    "",
    "export const invoices = pgTable('invoices', {",
    "  id: text('id').primaryKey().$defaultFn(() => createId()),",
    "  projectId: text('project_id').notNull().references(() => projects.id),",
    "  amount: integer('amount').notNull(),",
    "  currency: text('currency').notNull().default('USD'),",
    "  paid: boolean('paid').notNull().default(false),",
    "  dueDate: timestamp('due_date').notNull(),",
    "  createdAt: timestamp('created_at').notNull().defaultNow(),",
    "})",
  ],
  [
    "import { type ClassValue, clsx } from 'clsx'",
    "import { twMerge } from 'tailwind-merge'",
    "import { format, formatDistanceToNow } from 'date-fns'",
    "",
    "export function cn(...inputs: ClassValue[]) {",
    "  return twMerge(clsx(inputs))",
    "}",
    "",
    "export function formatDate(date: Date | string): string {",
    "  return format(new Date(date), 'MMM d, yyyy')",
    "}",
    "",
    "export function timeAgo(date: Date | string): string {",
    "  return formatDistanceToNow(new Date(date), { addSuffix: true })",
    "}",
    "",
    "export async function fetchWithAuth<T>(",
    "  url: string,",
    "  options?: RequestInit",
    "): Promise<T> {",
    "  const token = localStorage.getItem('token')",
    "  const res = await fetch(url, {",
    "    ...options,",
    "    headers: {",
    "      'Content-Type': 'application/json',",
    "      ...(token ? { Authorization: `Bearer ${token}` } : {}),",
    "      ...options?.headers,",
    "    },",
    "  })",
    "  if (!res.ok) {",
    "    const err = await res.json().catch(() => ({}))",
    "    throw new Error(err.message ?? `HTTP ${res.status}`)",
    "  }",
    "  return res.json() as Promise<T>",
    "}",
    "",
    "export const STACK_OPTIONS = [",
    "  'React', 'Next.js', 'TypeScript', 'Node.js',",
    "  'PostgreSQL', 'Redis', 'Docker', 'AWS',",
    "  'Stripe', 'Vercel', 'Tailwind', 'Prisma',",
    "] as const",
    "",
    "export type Stack = typeof STACK_OPTIONS[number]",
  ],
  [
    "'use client'",
    "",
    "import { useEffect, useRef, useCallback } from 'react'",
    "import { useRouter } from 'next/navigation'",
    "import { signIn, signOut, useSession } from 'next-auth/react'",
    "",
    "export function useAuth() {",
    "  const { data: session, status } = useSession()",
    "  const router = useRouter()",
    "",
    "  const login = useCallback(async (provider: 'github' | 'google') => {",
    "    await signIn(provider, { callbackUrl: '/dashboard' })",
    "  }, [])",
    "",
    "  const logout = useCallback(async () => {",
    "    await signOut({ redirect: false })",
    "    router.push('/')",
    "  }, [router])",
    "",
    "  return {",
    "    user: session?.user ?? null,",
    "    isLoading: status === 'loading',",
    "    isAuthenticated: status === 'authenticated',",
    "    login,",
    "    logout,",
    "  }",
    "}",
    "",
    "export function useWebSocket(url: string) {",
    "  const wsRef = useRef<WebSocket | null>(null)",
    "",
    "  useEffect(() => {",
    "    const ws = new WebSocket(url)",
    "    wsRef.current = ws",
    "",
    "    ws.onopen = () => console.log('[ws] connected')",
    "    ws.onerror = (e) => console.error('[ws] error', e)",
    "",
    "    return () => {",
    "      ws.close(1000, 'component unmounted')",
    "    }",
    "  }, [url])",
    "",
    "  return wsRef",
    "}",
  ],
];

const FILE_NAMES = [
  "Dashboard.tsx",
  "projects.router.ts",
  "schema.ts",
  "utils.ts",
  "hooks.ts",
];

// ─── Syntax token colors ───────────────────────────────────────────────────

const KEYWORDS = new Set([
  "import","export","from","default","const","let","var","function",
  "return","if","else","try","catch","async","await","new","this",
  "class","interface","type","extends","implements","enum","namespace",
  "true","false","null","undefined","void","never","any","as","in","of",
  "for","while","do","switch","case","break","continue","throw","typeof","instanceof",
  "'use client'",
]);

function tokenizeLine(line: string): Array<{ text: string; color: string }> {
  if (line.trim() === "") return [{ text: " ", color: "transparent" }];

  const tokens: Array<{ text: string; color: string }> = [];

  // Comments
  const commentIdx = line.indexOf("//");
  if (commentIdx !== -1) {
    const before = line.slice(0, commentIdx);
    const comment = line.slice(commentIdx);
    if (before) tokens.push(...tokenizeLine(before));
    tokens.push({ text: comment, color: "#4a7c59" });
    return tokens;
  }

  // Simple tokenizer via regex
  const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[\w$]+\b|[^\w\s$"'`]+|\s+)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const t = match[0];
    let color: string;

    if (/^\s+$/.test(t)) {
      tokens.push({ text: t, color: "transparent" });
      continue;
    }

    if ((t.startsWith('"') && t.endsWith('"')) ||
        (t.startsWith("'") && t.endsWith("'")) ||
        (t.startsWith("`") && t.endsWith("`"))) {
      color = "#e8a87c";
    } else if (KEYWORDS.has(t)) {
      color = "#c084fc";
    } else if (/^[A-Z][A-Za-z0-9]*$/.test(t)) {
      color = "#60a5fa";
    } else if (/^\d+$/.test(t)) {
      color = "#f9a8d4";
    } else if (["=>", "===", "!==", "&&", "||", "??", "?.", "...", ":", "->"].includes(t)) {
      color = "#67e8f9";
    } else if (["{", "}", "(", ")", "[", "]"].includes(t)) {
      color = "#a78bfa";
    } else if (t === "<" || t === ">") {
      color = "#f472b6";
    } else if (t.startsWith(".") && t.length > 1) {
      color = "#34d399";
    } else {
      color = "#cbd5e1";
    }

    tokens.push({ text: t, color });
  }

  return tokens;
}

interface Panel {
  x: number;
  y: number;
  width: number;
  scrollY: number;
  speed: number;
  codeIndex: number;
  opacity: number;
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

    const FONT_SIZE = 12.5;
    const LINE_H = FONT_SIZE * 1.65;
    const CHAR_W = FONT_SIZE * 0.62;
    const PANEL_PAD = 14;
    const PANEL_W = 340;
    const HEADER_H = 28;

    // Pre-tokenize all panels
    const tokenizedPanels = CODE_PANELS.map(lines => lines.map(tokenizeLine));

    // Create panels — distribute across screen
    const panels: Panel[] = [
      { x: 10,  y: 0,   width: PANEL_W, scrollY: 0, speed: 0.35, codeIndex: 0, opacity: 0.38 },
      { x: 380, y: 0,   width: PANEL_W, scrollY: -200, speed: 0.25, codeIndex: 1, opacity: 0.28 },
      { x: W - PANEL_W - 10, y: 0, width: PANEL_W, scrollY: -400, speed: 0.4, codeIndex: 2, opacity: 0.32 },
      { x: Math.max(740, W - PANEL_W * 2 - 30), y: 0, width: PANEL_W, scrollY: -100, speed: 0.22, codeIndex: 3, opacity: 0.22 },
    ];

    // If screen is wide enough, add a 5th panel
    if (W > 1400) {
      panels.push({ x: W / 2 - PANEL_W / 2, y: 0, width: PANEL_W, scrollY: -600, speed: 0.18, codeIndex: 4, opacity: 0.16 });
    }

    let rafId: number;
    let lastTime = 0;
    const TARGET_MS = 1000 / 24; // 24fps — smooth enough, very low CPU

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
        panels[2].x = W - PANEL_W - 10;
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const drawPanel = (p: Panel) => {
      const lines = tokenizedPanels[p.codeIndex];
      const totalContentH = lines.length * LINE_H;

      // Wrap scroll
      if (p.scrollY > totalContentH) p.scrollY = -H;

      ctx.save();
      ctx.globalAlpha = p.opacity;

      // Header bar
      ctx.fillStyle = "rgba(30, 20, 60, 0.55)";
      ctx.fillRect(p.x, 0, p.width, HEADER_H);

      // Dot indicators
      const dotColors = ["#ef4444", "#f59e0b", "#22c55e"];
      dotColors.forEach((c, i) => {
        ctx.beginPath();
        ctx.arc(p.x + PANEL_PAD + i * 14, HEADER_H / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.globalAlpha = p.opacity * 0.7;
        ctx.fill();
      });

      // File name
      ctx.globalAlpha = p.opacity * 0.6;
      ctx.font = `${FONT_SIZE - 0.5}px "JetBrains Mono", monospace`;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(FILE_NAMES[p.codeIndex], p.x + PANEL_PAD + 50, HEADER_H / 2 + 4);

      // Code area clip
      ctx.beginPath();
      ctx.rect(p.x, HEADER_H, p.width, H - HEADER_H);
      ctx.clip();

      // Render lines
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Fira Code", monospace`;
      const startLine = Math.floor(-p.scrollY / LINE_H) - 1;
      const endLine = startLine + Math.ceil((H - HEADER_H) / LINE_H) + 2;

      for (let li = Math.max(0, startLine); li < Math.min(lines.length, endLine); li++) {
        const lineY = HEADER_H + p.scrollY + li * LINE_H + FONT_SIZE;
        if (lineY < HEADER_H - LINE_H || lineY > H + LINE_H) continue;

        // Line number
        ctx.globalAlpha = p.opacity * 0.22;
        ctx.fillStyle = "#64748b";
        ctx.fillText(String(li + 1).padStart(3, " "), p.x + 4, lineY);

        // Tokens
        let xCursor = p.x + PANEL_PAD + CHAR_W * 4;
        const toks = lines[li];
        for (const tok of toks) {
          if (tok.color === "transparent") {
            xCursor += tok.text.length * CHAR_W;
            continue;
          }
          ctx.globalAlpha = p.opacity * 0.88;
          ctx.fillStyle = tok.color;
          ctx.fillText(tok.text, xCursor, lineY);
          xCursor += ctx.measureText(tok.text).width;
        }
      }

      // Fade top & bottom of panel
      const fadeT = ctx.createLinearGradient(p.x, HEADER_H, p.x, HEADER_H + 60);
      fadeT.addColorStop(0, "rgba(7,4,20,0.7)");
      fadeT.addColorStop(1, "transparent");
      ctx.globalAlpha = 1;
      ctx.fillStyle = fadeT;
      ctx.fillRect(p.x, HEADER_H, p.width, 60);

      const fadeB = ctx.createLinearGradient(p.x, H - 80, p.x, H);
      fadeB.addColorStop(0, "transparent");
      fadeB.addColorStop(1, "rgba(7,4,20,0.9)");
      ctx.fillStyle = fadeB;
      ctx.fillRect(p.x, H - 80, p.width, 80);

      ctx.restore();
    };

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (paused) return;
      if (now - lastTime < TARGET_MS) return;
      lastTime = now;

      ctx.clearRect(0, 0, W, H);

      for (const p of panels) {
        p.scrollY += p.speed;
        drawPanel(p);
      }
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
      style={{ opacity: 1 }}
    />
  );
}
