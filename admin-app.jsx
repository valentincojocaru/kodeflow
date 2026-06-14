const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ════════════════════════════════════════════════════════════
//  LAYOUT PRIMITIVES
// ════════════════════════════════════════════════════════════
function Header({ title, subtitle, children }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, padding: "22px 34px 18px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, background: "linear-gradient(to bottom, rgba(10,9,8,0.82), rgba(10,9,8,0.4) 70%, transparent)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
      <div>
        <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.08, letterSpacing: "-0.01em" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 6 }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{children}</div>
    </div>
  );
}
function Pane({ children }) {
  return <div className="fade-up" style={{ paddingBottom: 50 }}>{children}</div>;
}
function PrimaryBtn({ children, onClick, icon }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: 11, border: 0, cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", color: "#1a0d02", background: "linear-gradient(100deg, var(--amber), var(--orange))", boxShadow: "0 8px 24px -8px rgba(255,122,24,0.6)" }}>
      {icon && <Ic d={icon} size={14} sw={2} />}{children}
    </button>
  );
}
function GhostBtn({ children, onClick, icon, danger }) {
  return (
    <button onClick={onClick} className="focus-ring" style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 14px", borderRadius: 11, cursor: "pointer", fontWeight: 500, fontSize: 13, whiteSpace: "nowrap", color: danger ? "var(--red)" : "var(--ink-soft)", background: "var(--glass-bg)", border: "1px solid var(--glass-brd-soft)", transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? "rgba(248,113,113,0.5)" : "rgba(255,122,24,0.4)"; e.currentTarget.style.color = danger ? "var(--red)" : "var(--ink)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--glass-brd-soft)"; e.currentTarget.style.color = danger ? "var(--red)" : "var(--ink-soft)"; }}>
      {icon && <Ic d={icon} size={14} />}{children}
    </button>
  );
}
function IconBtn({ icon, onClick, danger, title }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 32, height: 32, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-faint)", background: "transparent", border: "1px solid transparent", transition: "all .18s" }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.05)"; e.currentTarget.style.color = danger ? "var(--red)" : "var(--ink)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-faint)"; }}>
      <Ic d={icon} size={15} />
    </button>
  );
}

// ════════════════════════════════════════════════════════════
//  SIDEBAR
// ════════════════════════════════════════════════════════════
function Sidebar({ view, setView, onOpenCmd, pendingInvoices }) {
  const items = [
    { id: "overview", label: "Overview", icon: ICONS.overview },
    { id: "projects", label: "Projects", icon: ICONS.projects },
    { id: "messages", label: "Messages", icon: ICONS.messages, badge: 3 },
    { id: "invoices", label: "Invoices", icon: ICONS.invoices, badge: pendingInvoices || undefined },
    { id: "clients", label: "Clients", icon: ICONS.clients },
  ];
  const active = (id) => view === id || (view === "project_detail" && id === "projects");
  return (
    <aside style={{ position: "fixed", left: 0, top: 0, height: "100%", width: 244, zIndex: 30, display: "flex", flexDirection: "column" }}>
      <div className="glass-2" style={{ position: "absolute", inset: 0, borderRadius: 0, borderLeft: 0, borderTop: 0, borderBottom: 0 }}></div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 16px" }}>
          <a href="index.html" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 22 }}>
            <span style={{ width: 34, height: 34, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--amber), var(--orange-deep))", boxShadow: "0 6px 18px -4px rgba(255,122,24,0.6)", color: "#1a0d02" }}>
              <Ic d={ICONS.shield} size={16} sw={2} />
            </span>
            <div>
              <div className="eyebrow" style={{ color: "var(--ink-faint)" }}>Admin Panel</div>
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "var(--ink)" }}>py<span className="grad-orange">Kode</span></div>
            </div>
          </a>

          {/* Admin card */}
          <div className="glass" style={{ borderRadius: 16, padding: 12, display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#1a0d02", background: "linear-gradient(135deg, var(--amber), var(--orange))" }}>K</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--amber)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Kode</div>
              <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>Administrator</div>
            </div>
            <span className="mono" style={{ fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 999, background: "var(--orange-deep)", color: "#fff", flexShrink: 0 }}>ADMIN</span>
          </div>
        </div>

        {/* Command palette trigger */}
        <div style={{ padding: "0 16px 12px" }}>
          <button onClick={onOpenCmd} className="focus-ring" style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, height: 38, padding: "0 12px", borderRadius: 11, cursor: "pointer", background: "var(--glass-bg)", border: "1px solid var(--glass-brd-soft)", color: "var(--ink-faint)", fontSize: 12.5, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,122,24,0.4)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--glass-brd-soft)"}>
            <Ic d={ICONS.search} size={13} />
            <span style={{ flex: 1, textAlign: "left" }}>Quick search…</span>
            <span className="mono" style={{ fontSize: 9.5, padding: "2px 5px", borderRadius: 5, background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-brd-soft)" }}>⌘K</span>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          <div className="eyebrow" style={{ padding: "0 12px 8px" }}>Navigation</div>
          {items.map(it => (
            <button key={it.id} onClick={() => setView(it.id)} style={{ position: "relative", display: "flex", alignItems: "center", gap: 11, height: 40, padding: "0 12px", borderRadius: 11, cursor: "pointer", border: 0, background: active(it.id) ? "linear-gradient(100deg, rgba(255,122,24,0.16), rgba(255,122,24,0.04))" : "transparent", color: active(it.id) ? "var(--ink)" : "var(--ink-mute)", fontSize: 13, fontWeight: 500, textAlign: "left", transition: "all .2s" }}
              onMouseEnter={e => { if (!active(it.id)) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (!active(it.id)) e.currentTarget.style.background = "transparent"; }}>
              {active(it.id) && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 999, background: "var(--orange)" }}></span>}
              <span style={{ color: active(it.id) ? "var(--orange-bright)" : "inherit", display: "flex" }}><Ic d={it.icon} size={15} /></span>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge ? <span className="mono" style={{ fontSize: 9, fontWeight: 600, minWidth: 18, textAlign: "center", padding: "2px 5px", borderRadius: 999, background: "var(--orange)", color: "#1a0d02" }}>{it.badge}</span> : null}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 12px 18px" }}>
          <div style={{ height: 1, margin: "0 8px 10px", background: "linear-gradient(90deg, transparent, var(--glass-brd-soft), transparent)" }}></div>
          {[{ l: "View Site", i: ICONS.ext, href: "index.html" }, { l: "Sign Out", i: ICONS.logout, danger: true }].map(b => (
            <a key={b.l} href={b.href || "#"} style={{ display: "flex", alignItems: "center", gap: 10, height: 38, padding: "0 12px", borderRadius: 11, textDecoration: "none", fontSize: 12.5, color: b.danger ? "var(--ink-mute)" : "var(--ink-mute)", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = b.danger ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.03)"; e.currentTarget.style.color = b.danger ? "var(--red)" : "var(--ink)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-mute)"; }}>
              <Ic d={b.i} size={14} />{b.l}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════
//  COMMAND PALETTE (⌘K) — premium function
// ════════════════════════════════════════════════════════════
function CommandPalette({ open, onClose, setView, openProject }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 40); } }, [open]);

  const commands = useMemo(() => {
    const nav = [
      { id: "n1", label: "Go to Overview", kind: "Navigate", icon: ICONS.overview, run: () => setView("overview") },
      { id: "n2", label: "Go to Projects", kind: "Navigate", icon: ICONS.projects, run: () => setView("projects") },
      { id: "n3", label: "Go to Invoices", kind: "Navigate", icon: ICONS.invoices, run: () => setView("invoices") },
      { id: "n4", label: "Go to Clients", kind: "Navigate", icon: ICONS.clients, run: () => setView("clients") },
      { id: "a1", label: "Export invoices (CSV)", kind: "Action", icon: ICONS.download, run: () => exportCSV("invoices.csv", ["Project", "Client", "Amount", "Status"], ALL_INVOICES.map(i => [i.project_title, i.client_name, i.amount, i.status])) },
    ];
    const projs = MOCK_PROJECTS.map(p => ({ id: "p" + p.id, label: p.title, kind: "Project", icon: ICONS.layers, sub: p.client_name, run: () => openProject(p) }));
    const all = [...nav, ...projs];
    if (!q.trim()) return all;
    const t = q.toLowerCase();
    return all.filter(c => c.label.toLowerCase().includes(t) || (c.sub || "").toLowerCase().includes(t));
  }, [q]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, commands.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); const c = commands[sel]; if (c) { c.run(); onClose(); } }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, commands, sel]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", animation: "fadeIn .15s ease" }}>
      <div onClick={e => e.stopPropagation()} className="glass-2" style={{ width: "100%", maxWidth: 560, borderRadius: 18, overflow: "hidden", animation: "popIn .25s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: "1px solid var(--glass-brd-soft)" }}>
          <Ic d={ICONS.search} size={17} style={{ color: "var(--ink-faint)" }} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects, run a command…"
            style={{ flex: 1, background: "transparent", border: 0, outline: "none", color: "var(--ink)", fontSize: 15 }} />
          <span className="mono" style={{ fontSize: 9.5, padding: "3px 6px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-brd-soft)", color: "var(--ink-faint)" }}>ESC</span>
        </div>
        <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
          {commands.length === 0 && <div style={{ padding: "28px 0", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>No results.</div>}
          {commands.map((c, i) => (
            <button key={c.id} onMouseEnter={() => setSel(i)} onClick={() => { c.run(); onClose(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, border: 0, cursor: "pointer", textAlign: "left", background: sel === i ? "rgba(255,122,24,0.13)" : "transparent", transition: "background .12s" }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: sel === i ? "var(--orange-bright)" : "var(--ink-mute)", background: "rgba(255,255,255,0.04)" }}><Ic d={c.icon} size={14} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, color: "var(--ink)", display: "block" }}>{c.label}</span>
                {c.sub && <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{c.sub}</span>}
              </span>
              <span className="eyebrow" style={{ color: sel === i ? "var(--orange-bright)" : "var(--ink-faint)" }}>{c.kind}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  OVERVIEW
// ════════════════════════════════════════════════════════════
function Overview({ stats, projects, activity, setView, openProject }) {
  const toast = useToast();
  const kpis = [
    { label: "Total Clients", value: stats.totalClients, max: stats.totalClients, icon: ICONS.users, color: "#ff7a18", sub: "registered", spark: [2,3,3,4,4,5] },
    { label: "Total Projects", value: stats.totalProjects, max: stats.totalProjects, icon: ICONS.layers, color: "#818cf8", sub: "all time", spark: [1,2,3,4,5,6] },
    { label: "Active", value: stats.activeProjects, max: stats.totalProjects, icon: ICONS.zap, color: "#3ad17a", sub: "in progress", spark: [1,1,2,1,2,2] },
    { label: "Pending", value: stats.pendingRequests, max: stats.totalProjects, icon: ICONS.clock, color: "#f5b942", sub: "awaiting", spark: [0,1,1,2,1,1] },
  ];
  const revenue = [
    { label: "Total Invoiced", value: stats.totalInvoiced, color: "#ff7a18", icon: ICONS.bar, sub: "issued" },
    { label: "Collected", value: stats.totalPaid, color: "#3ad17a", icon: ICONS.check, sub: "cleared" },
    { label: "Outstanding", value: stats.totalPending, color: "#f5b942", icon: ICONS.clock, sub: "pending" },
  ];
  const collectRate = Math.round((stats.totalPaid / stats.totalInvoiced) * 100);
  return (
    <Pane>
      <Header title="Overview" subtitle="Real-time snapshot of your studio.">
        <GhostBtn icon={ICONS.refresh} onClick={() => toast("Data refreshed")}>Refresh</GhostBtn>
      </Header>
      <div style={{ padding: "4px 34px 0", display: "flex", flexDirection: "column", gap: 22 }}>

        {/* KPIs */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Projects</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="kpi-grid">
            {kpis.map((k, i) => (
              <div key={i} className="glass" style={{ position: "relative", overflow: "hidden", borderRadius: 20, padding: 20, animation: `fadeUp .5s cubic-bezier(.16,1,.3,1) ${i * 0.06}s both` }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 96, height: 96, borderRadius: "50%", filter: "blur(36px)", opacity: 0.3, background: k.color }}></div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, background: k.color + "14", border: `1px solid ${k.color}25` }}><Ic d={k.icon} size={17} /></div>
                  <Ring value={k.value} max={k.max} color={k.color} />
                </div>
                <div className="serif" style={{ fontSize: 40, lineHeight: 1, color: k.color }}>{k.value}</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 6, gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600, whiteSpace: "nowrap" }}>{k.label}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>{k.sub}</div>
                  </div>
                  <Sparkline data={k.spark} color={k.color} width={58} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue analytics — premium chart */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }} className="rev-grid">
          <div className="glass" style={{ borderRadius: 22, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <h3 className="serif" style={{ fontSize: 20 }}>Revenue</h3>
                <p style={{ fontSize: 12, color: "var(--ink-faint)" }}>Last 8 months</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="serif grad-orange" style={{ fontSize: 26, lineHeight: 1, whiteSpace: "nowrap" }}>{money(stats.totalInvoiced)}</div>
                <div style={{ fontSize: 11, color: "var(--green)", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2 }}><Ic d={ICONS.trending} size={12} /> +24% vs prev</div>
              </div>
            </div>
            <AreaChart data={REVENUE_SERIES} labels={REVENUE_LABELS} color="#ff7a18" />
          </div>

          <div className="glass" style={{ borderRadius: 22, padding: "20px 22px", display: "flex", flexDirection: "column" }}>
            <h3 className="serif" style={{ fontSize: 20, marginBottom: 4 }}>Collection rate</h3>
            <p style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 12 }}>Paid vs invoiced</p>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Donut pct={collectRate} color="#3ad17a" label="collected" />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {revenue.map((r, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                  <div className="serif" style={{ fontSize: 17, color: r.color }}>{money(r.value)}</div>
                  <div style={{ fontSize: 9, color: "var(--ink-faint)" }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent projects + activity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="rev-grid">
          <GlassCard title="Recent Projects" action={{ label: "View all", onClick: () => setView("projects") }}>
            <div>
              {projects.slice(0, 5).map(p => {
                const sm = STATUS_META[p.status];
                return (
                  <div key={p.id} onClick={() => openProject(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 12, cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: 3, height: 30, borderRadius: 999, background: `linear-gradient(to bottom, ${sm.color}, transparent)`, flexShrink: 0 }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                      <div style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{p.client_name}</div>
                    </div>
                    <div style={{ width: 54, flexShrink: 0 }}>
                      <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: p.progress + "%", background: sm.color, borderRadius: 999 }}></div>
                      </div>
                      <div className="mono" style={{ fontSize: 9, textAlign: "right", marginTop: 3, color: sm.color }}>{p.progress}%</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard title="Recent Activity">
            <div>
              {activity.slice(0, 6).map((a, i) => {
                const c = TYPE_COLOR[a.type] || "#818cf8";
                return (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 8px", borderRadius: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, background: c, boxShadow: `0 0 7px ${c}` }}></div>
                      {i < activity.slice(0, 6).length - 1 && <div style={{ width: 1, flex: 1, marginTop: 4, background: "var(--glass-brd-soft)" }}></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{a.message}</div>
                      <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 2 }}>
                        <span style={{ color: c, textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.type}</span> · {a.project_title} · {fmtDate(a.created_at, true)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </Pane>
  );
}

Object.assign(window, { Header, Pane, PrimaryBtn, GhostBtn, IconBtn, Sidebar, CommandPalette, Overview });
