import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─── Code snippets that get "typed" live ──────────────────────────────────

const CODE_SNIPPETS = [
  {
    file: "api.ts",
    lang: "typescript",
    lines: [
      { t: "keyword", v: "const " },{ t: "fn", v: "buildApp" },{ t: "plain", v: " = " },{ t: "keyword", v: "async" },{ t: "plain", v: "() => {" },
    ],
    block: [
      [{ t: "indent", v: "  " },{ t: "keyword", v: "const " },{ t: "plain", v: "server = " },{ t: "fn", v: "express" },{ t: "plain", v: "()" }],
      [{ t: "indent", v: "  " },{ t: "keyword", v: "const " },{ t: "plain", v: "db = " },{ t: "keyword", v: "await " },{ t: "fn", v: "connectDB" },{ t: "plain", v: "()" }],
      [{ t: "indent", v: "  " },{ t: "plain", v: "server." },{ t: "fn", v: "use" },{ t: "plain", v: "(" },{ t: "string", v: "'/api'" },{ t: "plain", v: ", router)" }],
      [{ t: "indent", v: "  " },{ t: "keyword", v: "await " },{ t: "plain", v: "server." },{ t: "fn", v: "listen" },{ t: "plain", v: "(" },{ t: "number", v: "PORT" },{ t: "plain", v: ")" }],
      [{ t: "comment", v: "  // ✓ server running on :5000" }],
      [{ t: "plain", v: "}" }],
    ],
  },
  {
    file: "Dashboard.tsx",
    lang: "tsx",
    lines: [
      { t: "keyword", v: "export default function " },{ t: "type", v: "Dashboard" },{ t: "plain", v: "() {" },
    ],
    block: [
      [{ t: "indent", v: "  " },{ t: "keyword", v: "const " },{ t: "plain", v: "[" },{ t: "plain", v: "data" },{ t: "plain", v: ", " },{ t: "plain", v: "isLoading" },{ t: "plain", v: "] = " },{ t: "fn", v: "useQuery" },{ t: "plain", v: "({" }],
      [{ t: "indent", v: "    " },{ t: "plain", v: "queryKey: [" },{ t: "string", v: "'metrics'" },{ t: "plain", v: "]," }],
      [{ t: "indent", v: "    " },{ t: "plain", v: "queryFn: " },{ t: "fn", v: "fetchMetrics" }],
      [{ t: "indent", v: "  " },{ t: "plain", v: "})" }],
      [{ t: "indent", v: "  " },{ t: "keyword", v: "return " },{ t: "type", v: "<MetricsGrid" },{ t: "plain", v: " data={data} />" }],
      [{ t: "plain", v: "}" }],
    ],
  },
];

const TERMINAL_OUTPUT = [
  { delay: 0,    color: "#94a3b8", text: "$ pnpm run build" },
  { delay: 600,  color: "#64748b", text: "  ▸ Compiling TypeScript..." },
  { delay: 1400, color: "#64748b", text: "  ▸ Bundling 47 modules..." },
  { delay: 2200, color: "#22c55e", text: "  ✓ Built in 1.24s — 0 errors" },
  { delay: 2800, color: "#94a3b8", text: "$ pnpm run deploy" },
  { delay: 3600, color: "#64748b", text: "  ▸ Pushing to Vercel edge..." },
  { delay: 4400, color: "#64748b", text: "  ▸ Warming 23 CDN regions..." },
  { delay: 5000, color: "#c084fc", text: "  🚀 Live → kodeflow.dev" },
  { delay: 5600, color: "#60a5fa", text: "  ↳ Response: 61ms · 99.9% uptime" },
];

type Token = { t: string; v: string };

function tokenColor(type: string): string {
  switch (type) {
    case "keyword": return "#c084fc";
    case "fn":      return "#60a5fa";
    case "type":    return "#34d399";
    case "string":  return "#fbbf24";
    case "number":  return "#f9a8d4";
    case "comment": return "#4a7c59";
    case "indent":  return "transparent";
    default:        return "#e2e8f0";
  }
}

function CodeLine({ tokens }: { tokens: Token[] }) {
  return (
    <span>
      {tokens.map((tok, i) => (
        <span key={i} style={{ color: tokenColor(tok.t), opacity: tok.t === "indent" ? 0 : 1 }}>
          {tok.v}
        </span>
      ))}
    </span>
  );
}

// ─── Typing animation hook ─────────────────────────────────────────────────

function useTypingCycle(snippetIndex: number) {
  const snippet = CODE_SNIPPETS[snippetIndex % CODE_SNIPPETS.length];
  const [visibleBlock, setVisibleBlock] = useState<number[]>([]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setVisibleBlock([]);
    let timers: ReturnType<typeof setTimeout>[] = [];
    snippet.block.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleBlock(p => [...p, i]), 500 + i * 420));
    });
    const reset = setTimeout(() => {
      setVisibleBlock([]);
      setKey(k => k + 1);
    }, 500 + snippet.block.length * 420 + 2800);
    timers.push(reset);
    return () => timers.forEach(clearTimeout);
  }, [key, snippetIndex]);

  return { snippet, visibleBlock };
}

// ─── Terminal animation ────────────────────────────────────────────────────

function Terminal() {
  const [lines, setLines] = useState<number[]>([]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLines([]);
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_OUTPUT.forEach((l, i) => {
      timers.push(setTimeout(() => setLines(p => [...p, i]), l.delay));
    });
    const reset = setTimeout(() => {
      setLines([]);
      setKey(k => k + 1);
    }, 9000);
    timers.push(reset);
    return () => timers.forEach(clearTimeout);
  }, [key]);

  return (
    <div className="font-mono text-[11px] leading-[1.7] space-y-px">
      {TERMINAL_OUTPUT.map((l, i) =>
        lines.includes(i) ? (
          <motion.div
            key={`${key}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            style={{ color: l.color }}
          >
            {l.text}
          </motion.div>
        ) : null
      )}
      <motion.span
        className="inline-block w-1.5 h-[13px] align-middle ml-0.5"
        style={{ background: "#c084fc" }}
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.85, repeat: Infinity }}
      />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function HeroDevStation() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 30 });
  const rotY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 30 });

  const [snippetIdx, setSnippetIdx] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const { snippet, visibleBlock } = useTypingCycle(snippetIdx);

  const tabs = CODE_SNIPPETS.map(s => s.file);

  useEffect(() => {
    const iv = setInterval(() => {
      setSnippetIdx(i => {
        const next = (i + 1) % CODE_SNIPPETS.length;
        setActiveTab(next);
        return next;
      });
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <div
      ref={ref}
      className="relative w-full flex items-center justify-center"
      style={{ perspective: "1000px" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 75% 65% at 50% 50%, rgba(184,80,255,0.18) 0%, transparent 70%)" }} />

      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-[530px]"
      >
        {/* ── Main IDE window ── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(6, 3, 18, 0.92)",
            border: "1px solid rgba(184,80,255,0.25)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 30px 80px rgba(0,0,0,0.7), 0 0 80px rgba(184,80,255,0.12)",
          }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-0 border-b border-white/[0.05]"
            style={{ background: "rgba(10, 6, 28, 0.95)" }}>
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-r border-white/[0.04]">
              {["#ff5f57","#ffbd2e","#28c840"].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.85 }} />
              ))}
            </div>
            {/* Tabs */}
            <div className="flex items-end h-full overflow-hidden">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(i); setSnippetIdx(i); }}
                  className="relative px-4 py-2.5 text-[11px] font-mono transition-all duration-200 whitespace-nowrap"
                  style={{
                    color: activeTab === i ? "#e2e8f0" : "#475569",
                    background: activeTab === i ? "rgba(184,80,255,0.08)" : "transparent",
                    borderRight: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {activeTab === i && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-px"
                      style={{ background: "linear-gradient(90deg, #b855ff, #f050c8)" }}
                    />
                  )}
                  <span style={{ color: activeTab === i ? "#c084fc" : "#334155" }} className="mr-1">
                    {snippet.lang === "tsx" || tab.endsWith(".tsx") ? "⚛" : "◈"}
                  </span>
                  {tab}
                  {activeTab === i && (
                    <motion.span
                      className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </button>
              ))}
            </div>
            {/* Right side status */}
            <div className="ml-auto px-4 flex items-center gap-2">
              <motion.div
                className="flex items-center gap-1.5 text-[10px] font-mono"
                style={{ color: "#22c55e" }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                TypeScript
              </motion.div>
            </div>
          </div>

          {/* Editor body */}
          <div className="relative" style={{ minHeight: "220px" }}>
            {/* Line numbers gutter */}
            <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-white/[0.04]"
              style={{ background: "rgba(8,4,24,0.5)" }} />

            <div className="pl-12 pr-5 py-4 font-mono text-[12px] leading-[1.75]">
              {/* Static first line */}
              <div className="flex items-start gap-0">
                <span className="absolute left-0 w-10 text-center text-[10px] text-slate-600 select-none"
                  style={{ paddingTop: "1px" }}>1</span>
                <CodeLine tokens={snippet.lines} />
              </div>

              {/* Animated block lines */}
              {snippet.block.map((tokens, i) => (
                <motion.div
                  key={`${snippetIdx}-${i}`}
                  className="relative flex items-start"
                  initial={{ opacity: 0, x: -8 }}
                  animate={visibleBlock.includes(i) ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className="absolute left-[-40px] w-10 text-center text-[10px] text-slate-600 select-none"
                    style={{ paddingTop: "1px" }}
                  >
                    {i + 2}
                  </span>
                  <CodeLine tokens={tokens} />
                </motion.div>
              ))}

              {/* Cursor */}
              <motion.span
                className="inline-block w-[2px] h-[14px] align-middle ml-0.5 rounded-sm"
                style={{ background: "#c084fc" }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Terminal panel */}
          <div
            className="px-4 py-3 relative overflow-hidden"
            style={{
              background: "rgba(3, 1, 12, 0.9)",
              minHeight: "160px",
            }}
          >
            {/* Panel header */}
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-white/[0.05]">
              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Terminal</span>
              <motion.div
                className="flex items-center gap-1 text-[10px] font-mono ml-auto"
                style={{ color: "#22c55e" }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                LIVE
              </motion.div>
            </div>
            <Terminal />
          </div>

          {/* Status bar */}
          <div
            className="flex items-center px-4 py-1.5 gap-4 border-t border-white/[0.04]"
            style={{ background: "rgba(184,80,255,0.07)" }}
          >
            <span className="text-[10px] font-mono text-purple-400/70">⎇ main</span>
            <span className="text-[10px] font-mono text-slate-500">Ln 7, Col 24</span>
            <span className="text-[10px] font-mono text-slate-500 ml-auto">UTF-8</span>
            <span className="text-[10px] font-mono text-green-400/70">✓ 0 errors</span>
          </div>
        </div>

        {/* ── Floating metric cards ── */}
        {[
          { label: "Build time", value: "1.24s", icon: "⚡", x: -72, y: -28, color: "#fbbf24" },
          { label: "Bundle size", value: "87 KB",  icon: "📦", x: -68, y: 110, color: "#34d399" },
          { label: "Lighthouse",  value: "99/100", icon: "🏆", x: 490, y: 20,  color: "#c084fc" },
          { label: "Response",    value: "61 ms",  icon: "🚀", x: 488, y: 140, color: "#60a5fa" },
        ].map(({ label, value, icon, x, y, color }, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap"
            style={{
              ...(x < 0 ? { left: x } : { right: -80 }),
              top: `calc(30% + ${y}px)`,
              background: "rgba(8,4,24,0.92)",
              border: `1px solid ${color}28`,
              boxShadow: `0 0 20px ${color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
              backdropFilter: "blur(12px)",
            }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3 + i * 0.6, delay: i * 0.35, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>{icon}</span>
            <div>
              <div style={{ color: "#64748b", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
              <div style={{ color }}>{value}</div>
            </div>
          </motion.div>
        ))}

        {/* ── Git activity strip ── */}
        <motion.div
          className="mt-4 rounded-xl px-4 py-3 flex items-center gap-4"
          style={{
            background: "rgba(6,3,18,0.85)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="text-purple-400">◈</span>
            <span className="text-slate-500">git commit</span>
            <span className="text-amber-400/80">"feat: deploy pipeline v2"</span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-[10px] font-mono">
            <span className="text-green-400">+247</span>
            <span className="text-red-400">-12</span>
            <motion.div
              className="flex items-center gap-1 text-slate-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
              pushing...
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
