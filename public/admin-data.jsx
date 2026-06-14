const { useState, useEffect, useRef, useMemo, createContext, useContext, useCallback } = React;

// ════════════════════════════════════════════════════════════
//  ICONS (inline SVG, stroke-based — matches lucide vibe)
// ════════════════════════════════════════════════════════════
const Ic = ({ d, size = 16, fill = "none", sw = 1.7, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ICONS = {
  overview: "M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z",
  projects: ["M3 7l9-4 9 4-9 4-9-4z", "M3 7v10l9 4 9-4V7", "M12 11v10"],
  messages: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  invoices: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M9 13h6M9 17h4"],
  clients: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  layers: ["M12 2l9 5-9 5-9-5z", "M3 12l9 5 9-5", "M3 17l9 5 9-5"],
  zap: "M13 2L3 14h7l-1 8 10-12h-7z",
  clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"],
  trending: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  check: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"],
  dollar: ["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  card: ["M1 4h22v16H1z", "M1 10h22"],
  plus: "M12 5v14M5 12h14",
  edit: ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"],
  trash: ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  x: "M18 6L6 18M6 6l12 12",
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.35-4.35"],
  arrowLeft: ["M19 12H5", "M12 19l-7-7 7-7"],
  send: ["M22 2L11 13", "M22 2l-7 20-4-9-9-4z"],
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  ext: ["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", "M15 3h6v6", "M10 14L21 3"],
  github: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
  refresh: ["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  chevR: "M9 18l6-6-6-6",
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  bar: ["M12 20V10", "M18 20V4", "M6 20v-4"],
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"],
  command: "M18 3a3 3 0 0 0-3 3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3z",
  sparkle: ["M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"],
  flag: ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", "M4 22v-7"],
  alert: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  note: ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"],
  filter: "M22 3H2l8 9.46V19l4 2v-8.54z",
  calendar: ["M3 4h18v18H3z", "M16 2v4M8 2v4M3 10h18"],
  building: ["M3 21h18", "M5 21V7l8-4v18", "M19 21V11l-6-4", "M9 9v.01M9 12v.01M9 15v.01M9 18v.01"],
  mail: ["M4 4h16v16H4z", "M22 6l-10 7L2 6"],
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
};

// ════════════════════════════════════════════════════════════
//  STATUS / TYPE META
// ════════════════════════════════════════════════════════════
const STATUS_META = {
  pending:     { label: "Pending",     color: "#f5b942" },
  planning:    { label: "Planning",    color: "#818cf8" },
  in_progress: { label: "In Progress", color: "#3ad17a" },
  review:      { label: "Review",      color: "#f472b6" },
  completed:   { label: "Completed",   color: "#4ade80" },
  cancelled:   { label: "Cancelled",   color: "#f87171" },
};
const TYPE_COLOR = { update: "#818cf8", milestone: "#3ad17a", note: "#f472b6", alert: "#f5b942" };

// ════════════════════════════════════════════════════════════
//  MOCK DATA (in the real app this comes from /api/admin/*)
// ════════════════════════════════════════════════════════════
const MOCK_USERS = [
  { id: 1, name: "Andrei Marin", email: "andrei@atlas.io", company: "Atlas", phone: "+40 721 334 110", project_count: 3 },
  { id: 2, name: "Raluca Toma", email: "raluca@lumen.co", company: "Lumen", phone: "+40 744 902 551", project_count: 2 },
  { id: 3, name: "Mihai Vlad", email: "mihai@northwind.dev", company: "Northwind", phone: "+40 730 118 274", project_count: 1 },
  { id: 4, name: "Elena Pop", email: "elena@brightcart.shop", company: "BrightCart", phone: "+40 766 540 988", project_count: 2 },
  { id: 5, name: "Sorin Ilie", email: "sorin@fork.ro", company: "Fork & Co", phone: "+40 712 667 301", project_count: 1 },
];
const MOCK_PROJECTS = [
  { id: 101, title: "Atlas — Fintech Dashboard", client_id: 1, client_name: "Andrei Marin", client_email: "andrei@atlas.io", client_company: "Atlas", status: "in_progress", progress: 72, type: "SaaS", priority: "high", budget: "€5,000", deadline: "2026-07-12", live_url: "https://atlas.app", repo_url: "https://github.com/x", invoices: [{ id: 1, amount: 2500, status: "paid", due_date: "2026-05-20" }, { id: 2, amount: 2500, status: "pending", due_date: "2026-07-15" }], updates: [{ id: 1, type: "milestone", message: "Realtime analytics module shipped to staging.", author_name: "Kode", created_at: "2026-06-08T10:20:00" }, { id: 2, type: "update", message: "Stripe billing integrated, webhooks verified.", author_name: "Kode", created_at: "2026-06-05T14:00:00" }] },
  { id: 102, title: "BrightCart Storefront", client_id: 4, client_name: "Elena Pop", client_email: "elena@brightcart.shop", client_company: "BrightCart", status: "review", progress: 90, type: "E-Commerce", priority: "urgent", budget: "€4,200", deadline: "2026-06-22", live_url: "https://brightcart.shop", repo_url: "", invoices: [{ id: 3, amount: 4200, status: "pending", due_date: "2026-06-25" }], updates: [{ id: 3, type: "update", message: "Checkout flow polished, cart recovery live.", author_name: "Kode", created_at: "2026-06-09T09:00:00" }] },
  { id: 103, title: "Lumen Marketing Site", client_id: 2, client_name: "Raluca Toma", client_email: "raluca@lumen.co", client_company: "Lumen", status: "completed", progress: 100, type: "Landing Page", priority: "normal", budget: "€1,500", deadline: "2026-05-30", live_url: "https://lumen.co", repo_url: "", invoices: [{ id: 4, amount: 1500, status: "paid", due_date: "2026-05-30" }], updates: [{ id: 4, type: "milestone", message: "Launched 🎉 — handover docs delivered.", author_name: "Kode", created_at: "2026-05-30T16:30:00" }] },
  { id: 104, title: "Northwind Admin Tool", client_id: 3, client_name: "Mihai Vlad", client_email: "mihai@northwind.dev", client_company: "Northwind", status: "planning", progress: 18, type: "Web App", priority: "normal", budget: "€3,800", deadline: "2026-08-01", live_url: "", repo_url: "", invoices: [], updates: [{ id: 5, type: "note", message: "Architecture spec approved by client.", author_name: "Kode", created_at: "2026-06-07T11:10:00" }] },
  { id: 105, title: "Fork & Co — Bookings", client_id: 5, client_name: "Sorin Ilie", client_email: "sorin@fork.ro", client_company: "Fork & Co", status: "pending", progress: 5, type: "Web App", priority: "low", budget: "€2,600", deadline: "2026-08-20", live_url: "", repo_url: "", invoices: [{ id: 5, amount: 1300, status: "overdue", due_date: "2026-06-01" }], updates: [] },
  { id: 106, title: "Atlas — Mobile Companion", client_id: 1, client_name: "Andrei Marin", client_email: "andrei@atlas.io", client_company: "Atlas", status: "in_progress", progress: 44, type: "Mobile App", priority: "high", budget: "€6,500", deadline: "2026-09-05", live_url: "", repo_url: "", invoices: [{ id: 6, amount: 3000, status: "paid", due_date: "2026-06-02" }], updates: [{ id: 6, type: "update", message: "Auth + offline sync prototype working.", author_name: "Kode", created_at: "2026-06-06T13:45:00" }] },
];
function buildActivity() {
  const all = [];
  MOCK_PROJECTS.forEach(p => (p.updates || []).forEach(u => all.push({ ...u, project_title: p.title })));
  return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
const MOCK_ACTIVITY = buildActivity();
function computeStats() {
  const allInv = MOCK_PROJECTS.flatMap(p => p.invoices || []);
  const totalInvoiced = allInv.reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = allInv.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = allInv.filter(i => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + Number(i.amount), 0);
  return {
    totalClients: MOCK_USERS.length,
    totalProjects: MOCK_PROJECTS.length,
    activeProjects: MOCK_PROJECTS.filter(p => p.status === "in_progress").length,
    pendingRequests: MOCK_PROJECTS.filter(p => p.status === "pending").length,
    totalInvoiced, totalPaid, totalPending,
  };
}
const MOCK_STATS = computeStats();
const ALL_INVOICES = MOCK_PROJECTS.flatMap(p => (p.invoices || []).map(i => ({ ...i, project_title: p.title, client_name: p.client_name })));
// revenue over last 8 months (mock)
const REVENUE_SERIES = [3.2, 4.1, 3.8, 5.6, 6.9, 5.4, 8.2, 9.6];
const REVENUE_LABELS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

// ════════════════════════════════════════════════════════════
//  SHARED PRIMITIVES
// ════════════════════════════════════════════════════════════
function StatusBadge({ status }) {
  const sm = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className="mono" style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em", padding: "3px 9px", borderRadius: 999, color: sm.color, background: sm.color + "18", border: `1px solid ${sm.color}30` }}>
      {sm.label}
    </span>
  );
}

function Ring({ value, max, color, size = 38 }) {
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

function Donut({ pct, color, size = 120, label }) {
  const r = (size - 18) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)", filter: `drop-shadow(0 0 6px ${color}55)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="serif" style={{ fontSize: 30, lineHeight: 1, color }}>{pct}%</div>
        {label && <div className="eyebrow" style={{ marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

// Smooth area chart (premium analytics)
function AreaChart({ data, labels, color = "#ff7a18", height = 150 }) {
  const W = 560, H = height, pad = 8;
  const max = Math.max(...data) * 1.15, min = 0;
  const xs = (i) => pad + (i * (W - pad * 2)) / (data.length - 1);
  const ys = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const pts = data.map((v, i) => [xs(i), ys(v)]);
  // smooth path
  let dPath = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    dPath += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  const area = `${dPath} L ${pts[pts.length - 1][0]},${H - pad} L ${pts[0][0]},${H - pad} Z`;
  const [hover, setHover] = useState(null);
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg viewBox={`0 0 ${W} ${H + 22}`} width="100%" style={{ display: "block", overflow: "visible" }}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g, i) => (
          <line key={i} x1={pad} x2={W - pad} y1={pad + g * (H - pad * 2)} y2={pad + g * (H - pad * 2)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#areaFill)" />
        <path d={dPath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="1400" strokeDashoffset="1400" style={{ animation: "drawDash 1.6s cubic-bezier(.16,1,.3,1) forwards", filter: `drop-shadow(0 4px 10px ${color}50)` }} />
        {pts.map((p, i) => (
          <g key={i}>
            <rect x={p[0] - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
            <circle cx={p[0]} cy={p[1]} r={hover === i ? 5 : 3} fill={color} stroke="#0a0908" strokeWidth="2" style={{ transition: "r .15s" }} />
            <text x={p[0]} y={H + 16} textAnchor="middle" className="mono" style={{ fontSize: 9, fill: "var(--ink-faint)" }}>{labels[i]}</text>
          </g>
        ))}
        {hover != null && (
          <g>
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={pad} y2={H - pad} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <text x={Math.min(Math.max(pts[hover][0], 28), W - 28)} y={pts[hover][1] - 12} textAnchor="middle" className="mono" style={{ fontSize: 11, fill: "var(--ink)", fontWeight: 600 }}>€{data[hover]}k</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function Sparkline({ data, color, width = 76, height = 26 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const xs = (i) => (i * width) / (data.length - 1);
  const ys = (v) => height - ((v - min) / (max - min || 1)) * height;
  const d = data.map((v, i) => `${i ? "L" : "M"} ${xs(i)},${ys(v)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

function GlassCard({ title, action, children, pad = true, style }) {
  return (
    <div className="glass" style={{ borderRadius: 22, overflow: "hidden", ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
          <h3 className="serif" style={{ fontSize: 19 }}>{title}</h3>
          {action && (
            <button onClick={action.onClick} className="mono" style={{ fontSize: 10, letterSpacing: "0.06em", color: "var(--orange-bright)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
              {action.label} <Ic d={ICONS.chevR} size={12} />
            </button>
          )}
        </div>
      )}
      <div style={{ padding: pad ? (title ? "0 14px 14px" : 14) : 0 }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 6px", borderRadius: 10 }}>
      <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{label}</span>
      <span style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  TOASTS
// ════════════════════════════════════════════════════════════
const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, kind = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map(t => {
          const c = t.kind === "ok" ? "var(--green)" : t.kind === "err" ? "var(--red)" : "var(--orange-bright)";
          return (
            <div key={t.id} className="glass-2" style={{ borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, minWidth: 220, animation: "popIn .3s cubic-bezier(.16,1,.3,1)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}`, flexShrink: 0 }}></span>
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{t.msg}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

function exportCSV(filename, headers, rows) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function fmtDate(d, withTime) {
  if (!d) return "—";
  const opts = withTime ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "short", year: "numeric" };
  return new Date(d).toLocaleDateString("en-GB", opts);
}
function money(v) { return "€" + Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 0 }); }

Object.assign(window, {
  React, useState, useEffect, useRef, useMemo, useCallback,
  Ic, ICONS, STATUS_META, TYPE_COLOR,
  MOCK_USERS, MOCK_PROJECTS, MOCK_ACTIVITY, MOCK_STATS, ALL_INVOICES, REVENUE_SERIES, REVENUE_LABELS,
  StatusBadge, Ring, Donut, AreaChart, Sparkline, GlassCard, InfoRow,
  ToastProvider, useToast, exportCSV, fmtDate, money,
});
