import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";

/* ====================================================================
   Kodeflow Admin — premium primitives
   Reusable, dependency-free chart & UI components for the admin panel.
   Pairs with kodeflow-admin-theme.css. See README.md for how to drop
   these into your existing src/pages/admin.tsx (keeps your API wiring).
   ==================================================================== */

// ── Animated ring (KPI corner gauge) ─────────────────────────────────
export function Ring({ value, max, color, size = 38 }: { value: number; max: number; color: string; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)" }} />
    </svg>
  );
}

// ── Donut with center label (progress / collection rate) ─────────────
export function Donut({ pct, color, size = 120, label }: { pct: number; color: string; size?: number; label?: string }) {
  const r = (size - 18) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)", filter: `drop-shadow(0 0 6px ${color}55)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="kfa-serif" style={{ fontSize: 30, lineHeight: 1, color }}>{pct}%</div>
        {label && <div className="kfa-eyebrow" style={{ marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

// ── Smooth area chart (revenue analytics) ────────────────────────────
export function AreaChart({ data, labels, color = "#ff7a18", height = 150 }: { data: number[]; labels: string[]; color?: string; height?: number }) {
  const W = 560, H = height, pad = 8;
  const max = Math.max(...data) * 1.15, min = 0;
  const xs = (i: number) => pad + (i * (W - pad * 2)) / (data.length - 1);
  const ys = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const pts = data.map((v, i) => [xs(i), ys(v)] as [number, number]);
  let dPath = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    dPath += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  const area = `${dPath} L ${pts[pts.length - 1][0]},${H - pad} L ${pts[0][0]},${H - pad} Z`;
  const [hover, setHover] = useState<number | null>(null);
  const gid = useMemo(() => "kfaFill" + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} width="100%" style={{ display: "block", overflow: "visible" }} onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g, i) => (
        <line key={i} x1={pad} x2={W - pad} y1={pad + g * (H - pad * 2)} y2={pad + g * (H - pad * 2)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={dPath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="1400" strokeDashoffset="1400" style={{ animation: "kfaDraw 1.6s cubic-bezier(.16,1,.3,1) forwards", filter: `drop-shadow(0 4px 10px ${color}50)` }} />
      {pts.map((p, i) => (
        <g key={i}>
          <rect x={p[0] - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
          <circle cx={p[0]} cy={p[1]} r={hover === i ? 5 : 3} fill={color} stroke="#0a0908" strokeWidth="2" style={{ transition: "r .15s" }} />
          <text x={p[0]} y={H + 16} textAnchor="middle" className="kfa-mono" style={{ fontSize: 9, fill: "var(--kfa-ink-faint)" }}>{labels[i]}</text>
        </g>
      ))}
      {hover != null && (
        <g>
          <line x1={pts[hover][0]} x2={pts[hover][0]} y1={pad} y2={H - pad} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <text x={Math.min(Math.max(pts[hover][0], 28), W - 28)} y={pts[hover][1] - 12} textAnchor="middle" className="kfa-mono" style={{ fontSize: 11, fill: "var(--kfa-ink)", fontWeight: 600 }}>€{data[hover]}k</text>
        </g>
      )}
    </svg>
  );
}

// ── Sparkline (KPI mini-trend) ───────────────────────────────────────
export function Sparkline({ data, color, width = 58, height = 26 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data);
  const xs = (i: number) => (i * width) / (data.length - 1);
  const ys = (v: number) => height - ((v - min) / (max - min || 1)) * height;
  const d = data.map((v, i) => `${i ? "L" : "M"} ${xs(i)},${ys(v)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

// ── Status badge ─────────────────────────────────────────────────────
export const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:     { label: "Pending",     color: "#f5b942" },
  planning:    { label: "Planning",    color: "#818cf8" },
  in_progress: { label: "In Progress", color: "#3ad17a" },
  review:      { label: "Review",      color: "#f472b6" },
  completed:   { label: "Completed",   color: "#4ade80" },
  cancelled:   { label: "Cancelled",   color: "#f87171" },
};
export function StatusBadge({ status }: { status: string }) {
  const sm = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className="kfa-mono" style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em", padding: "3px 9px", borderRadius: 999, color: sm.color, background: sm.color + "18", border: `1px solid ${sm.color}30` }}>
      {sm.label}
    </span>
  );
}

// ── Command palette (⌘K) ─────────────────────────────────────────────
export type Command = { id: string; label: string; kind: string; sub?: string; run: () => void };
export function CommandPalette({ open, onClose, commands }: { open: boolean; onClose: () => void; commands: Command[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 40); } }, [open]);
  const filtered = useMemo(() => {
    if (!q.trim()) return commands;
    const t = q.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(t) || (c.sub || "").toLowerCase().includes(t));
  }, [q, commands]);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); const c = filtered[sel]; if (c) { c.run(); onClose(); } }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, filtered, sel]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} className="kfa-glass-2" style={{ width: "100%", maxWidth: 560, borderRadius: 18, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: "1px solid var(--kfa-glass-brd-soft)" }}>
          <span style={{ color: "var(--kfa-ink-faint)" }}>⌕</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects, run a command…"
            style={{ flex: 1, background: "transparent", border: 0, outline: "none", color: "var(--kfa-ink)", fontSize: 15 }} />
          <span className="kfa-mono" style={{ fontSize: 9.5, padding: "3px 6px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid var(--kfa-glass-brd-soft)", color: "var(--kfa-ink-faint)" }}>ESC</span>
        </div>
        <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
          {filtered.length === 0 && <div style={{ padding: "28px 0", textAlign: "center", color: "var(--kfa-ink-faint)", fontSize: 13 }}>No results.</div>}
          {filtered.map((c, i) => (
            <button key={c.id} onMouseEnter={() => setSel(i)} onClick={() => { c.run(); onClose(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, border: 0, cursor: "pointer", textAlign: "left", background: sel === i ? "rgba(255,122,24,0.13)" : "transparent" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, color: "var(--kfa-ink)", display: "block" }}>{c.label}</span>
                {c.sub && <span style={{ fontSize: 11, color: "var(--kfa-ink-faint)" }}>{c.sub}</span>}
              </span>
              <span className="kfa-eyebrow" style={{ color: sel === i ? "var(--kfa-orange-bright)" : "var(--kfa-ink-faint)" }}>{c.kind}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CSV export helper ────────────────────────────────────────────────
export function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Glass card shell ─────────────────────────────────────────────────
export function GlassCard({ title, action, children }: { title?: string; action?: { label: string; onClick: () => void }; children: ReactNode }) {
  return (
    <div className="kfa-glass" style={{ borderRadius: 22, overflow: "hidden" }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
          <h3 className="kfa-serif" style={{ fontSize: 19 }}>{title}</h3>
          {action && <button onClick={action.onClick} className="kfa-mono" style={{ fontSize: 10, color: "var(--kfa-orange-bright)", background: "none", border: "none", cursor: "pointer" }}>{action.label} ›</button>}
        </div>
      )}
      <div style={{ padding: title ? "0 14px 14px" : 14 }}>{children}</div>
    </div>
  );
}
