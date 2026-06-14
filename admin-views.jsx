const { useState, useEffect, useRef, useMemo } = React;

// ════════════════════════════════════════════════════════════
//  PROJECTS LIST
// ════════════════════════════════════════════════════════════
function Projects({ projects, openProject, toast }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = projects.filter(p => {
    const ms = p.title.toLowerCase().includes(search.toLowerCase()) || p.client_name.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "all" || p.status === statusFilter;
    return ms && mf;
  });
  return (
    <Pane>
      <Header title="Projects" subtitle={`${filtered.length} project${filtered.length !== 1 ? "s" : ""}`}>
        <PrimaryBtn icon={ICONS.plus} onClick={() => toast("New project form (wired to API)")}>New Project</PrimaryBtn>
      </Header>
      <div style={{ padding: "4px 34px 0" }}>
        {/* filter bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)", display: "flex" }}><Ic d={ICONS.search} size={14} /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or clients…" className="focus-ring"
              style={{ width: "100%", height: 40, padding: "0 14px 0 36px", borderRadius: 12, background: "var(--glass-bg)", border: "1px solid var(--glass-brd-soft)", color: "var(--ink)", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {["all", ...Object.keys(STATUS_META)].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ height: 32, padding: "0 12px", borderRadius: 999, cursor: "pointer", fontSize: 11.5, fontWeight: 500, border: "1px solid", borderColor: statusFilter === s ? (s === "all" ? "rgba(255,122,24,0.4)" : STATUS_META[s].color + "40") : "var(--glass-brd-soft)", background: statusFilter === s ? (s === "all" ? "rgba(255,122,24,0.13)" : STATUS_META[s].color + "16") : "transparent", color: statusFilter === s ? (s === "all" ? "var(--orange-bright)" : STATUS_META[s].color) : "var(--ink-mute)", transition: "all .18s" }}>
                {s === "all" ? "All" : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {filtered.map((p, i) => {
            const sm = STATUS_META[p.status];
            return (
              <div key={p.id} className="glass" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 18, animation: `fadeUp .4s cubic-bezier(.16,1,.3,1) ${i * 0.04}s both`, transition: "border-color .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,122,24,0.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--glass-brd-soft)"}>
                <div style={{ width: 3, alignSelf: "stretch", borderRadius: 999, background: `linear-gradient(to bottom, ${sm.color}, transparent)`, flexShrink: 0 }}></div>
                <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => openProject(p)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-faint)", flexShrink: 0 }}>· {p.client_name}</span>
                    <span className="mono" style={{ fontSize: 9, color: "var(--ink-faint)", padding: "2px 7px", borderRadius: 999, border: "1px solid var(--glass-brd-soft)", flexShrink: 0 }}>{p.type}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 130 }}>
                      <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: p.progress + "%", background: `linear-gradient(90deg, ${sm.color}, ${sm.color}aa)`, borderRadius: 999 }}></div>
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{p.progress}%</span>
                  </div>
                </div>
                <StatusBadge status={p.status} />
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <IconBtn icon={ICONS.eye} title="View" onClick={() => openProject(p)} />
                  <IconBtn icon={ICONS.edit} title="Edit" onClick={() => toast("Edit project")} />
                  <IconBtn icon={ICONS.trash} title="Delete" danger onClick={() => toast("Project deleted", "err")} />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-faint)", fontSize: 13 }}>No projects found.</div>}
        </div>
      </div>
    </Pane>
  );
}

// ════════════════════════════════════════════════════════════
//  PROJECT DETAIL
// ════════════════════════════════════════════════════════════
function ProjectDetail({ project, onBack, toast }) {
  const [updateMsg, setUpdateMsg] = useState("");
  const [updateType, setUpdateType] = useState("update");
  const [updates, setUpdates] = useState(project.updates || []);
  const sm = STATUS_META[project.status];
  const send = () => {
    if (!updateMsg.trim()) return;
    setUpdates(u => [{ id: Date.now(), type: updateType, message: updateMsg, author_name: "Kode", created_at: new Date().toISOString() }, ...u]);
    setUpdateMsg(""); toast("Update sent to client");
  };
  return (
    <Pane>
      <Header title={project.title} subtitle={`Client: ${project.client_name}`}>
        <GhostBtn icon={ICONS.arrowLeft} onClick={onBack}>Back</GhostBtn>
        <GhostBtn icon={ICONS.edit} onClick={() => toast("Edit project")}>Edit</GhostBtn>
      </Header>
      <div style={{ padding: "4px 34px 0", display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16 }} className="detail-grid">
        {/* left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* progress hero */}
          <div className="glass" style={{ borderRadius: 22, padding: 22, display: "flex", alignItems: "center", gap: 24 }}>
            <Donut pct={project.progress} color={sm.color} label="complete" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <StatusBadge status={project.status} />
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Priority: {project.priority}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[{ l: "Budget", v: project.budget }, { l: "Deadline", v: fmtDate(project.deadline) }, { l: "Type", v: project.type }, { l: "Invoices", v: (project.invoices || []).length }].map(x => (
                  <div key={x.l} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.025)" }}>
                    <div className="eyebrow">{x.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* updates */}
          <GlassCard title={`Updates (${updates.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 4, marginBottom: 14 }}>
              {updates.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink-faint)", fontSize: 12 }}>No updates yet.</div>}
              {updates.map(u => {
                const c = TYPE_COLOR[u.type] || "#818cf8";
                return (
                  <div key={u.id} style={{ display: "flex", gap: 11, padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-brd-soft)" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 6, flexShrink: 0, background: c, boxShadow: `0 0 7px ${c}` }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span className="mono" style={{ fontSize: 8.5, fontWeight: 600, textTransform: "uppercase", padding: "2px 6px", borderRadius: 5, color: c, background: c + "18", border: `1px solid ${c}30` }}>{u.type}</span>
                        <span style={{ fontSize: 9.5, color: "var(--ink-faint)", whiteSpace: "nowrap" }}>{fmtDate(u.created_at, true)}</span>
                        <span style={{ fontSize: 9.5, color: "var(--ink-faint)", marginLeft: "auto" }}>by {u.author_name}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{u.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: "1px solid var(--glass-brd-soft)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["update", "milestone", "note", "alert"].map(t => (
                  <button key={t} onClick={() => setUpdateType(t)} style={{ padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", border: "1px solid", borderColor: updateType === t ? TYPE_COLOR[t] + "40" : "transparent", background: updateType === t ? TYPE_COLOR[t] + "18" : "transparent", color: updateType === t ? TYPE_COLOR[t] : "var(--ink-faint)", transition: "all .18s" }}>{t}</button>
                ))}
              </div>
              <textarea value={updateMsg} onChange={e => setUpdateMsg(e.target.value)} placeholder="Write an update for the client…" rows={2} className="focus-ring"
                style={{ width: "100%", padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-brd-soft)", color: "var(--ink)", fontSize: 13, resize: "none", outline: "none" }}></textarea>
              <div><PrimaryBtn icon={ICONS.send} onClick={send}>Send Update</PrimaryBtn></div>
            </div>
          </GlassCard>
        </div>

        {/* right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard title="Client">
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 6px 12px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, var(--orange), var(--orange-deep))", flexShrink: 0 }}>{project.client_name[0]}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.client_name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{project.client_company}</div>
              </div>
            </div>
            <InfoRow label="Email" value={project.client_email} />
          </GlassCard>

          <GlassCard title="Links">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {project.live_url ? (
                <a href={project.live_url} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 12, textDecoration: "none", fontSize: 12.5, color: "var(--orange-bright)", background: "rgba(255,122,24,0.08)", border: "1px solid rgba(255,122,24,0.2)" }}><Ic d={ICONS.ext} size={14} />Live Site</a>
              ) : <div style={{ fontSize: 12, color: "var(--ink-faint)", padding: "6px" }}>No live URL yet.</div>}
              {project.repo_url && <a href={project.repo_url} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 12, textDecoration: "none", fontSize: 12.5, color: "var(--ink-soft)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-brd-soft)" }}><Ic d={ICONS.github} size={14} />Repository</a>}
            </div>
          </GlassCard>

          <GlassCard title="Invoices">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(project.invoices || []).length === 0 && <div style={{ textAlign: "center", padding: "14px 0", color: "var(--ink-faint)", fontSize: 12 }}>No invoices yet.</div>}
              {(project.invoices || []).map(inv => {
                const ic = inv.status === "paid" ? "var(--green)" : inv.status === "overdue" ? "var(--red)" : inv.status === "cancelled" ? "var(--ink-faint)" : "var(--yellow)";
                return (
                  <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 13, background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-brd-soft)" }}>
                    <div style={{ flex: 1 }}>
                      <div className="serif" style={{ fontSize: 18 }}>{money(inv.amount)}</div>
                      {inv.due_date && <div style={{ fontSize: 9.5, color: "var(--ink-faint)" }}>Due {fmtDate(inv.due_date)}</div>}
                    </div>
                    <span className="mono" style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", padding: "3px 9px", borderRadius: 999, color: ic, background: ic + "18", border: `1px solid ${ic}30` }}>{inv.status}</span>
                  </div>
                );
              })}
              <button onClick={() => toast("Add invoice")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, cursor: "pointer", fontSize: 12, color: "var(--ink-faint)", background: "transparent", border: "1px dashed var(--glass-brd-soft)", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--orange-bright)"; e.currentTarget.style.borderColor = "rgba(255,122,24,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-faint)"; e.currentTarget.style.borderColor = "var(--glass-brd-soft)"; }}><Ic d={ICONS.plus} size={12} /> Add Invoice</button>
            </div>
          </GlassCard>
        </div>
      </div>
    </Pane>
  );
}

// ════════════════════════════════════════════════════════════
//  INVOICES
// ════════════════════════════════════════════════════════════
function Invoices({ invoices, stats, toast }) {
  const cards = [
    { label: "Total Invoiced", value: stats.totalInvoiced, color: "#ff7a18", icon: ICONS.bar, sub: "issued" },
    { label: "Collected", value: stats.totalPaid, color: "#3ad17a", icon: ICONS.check, sub: "cleared" },
    { label: "Outstanding", value: stats.totalPending, color: "#f5b942", icon: ICONS.clock, sub: "pending" },
  ];
  return (
    <Pane>
      <Header title="Invoices" subtitle={`${invoices.length} total invoice${invoices.length !== 1 ? "s" : ""}`}>
        <GhostBtn icon={ICONS.download} onClick={() => { exportCSV("invoices.csv", ["Project", "Client", "Amount", "Due Date", "Status"], invoices.map(i => [i.project_title, i.client_name, i.amount, i.due_date || "", i.status])); toast("Invoices exported"); }}>Export CSV</GhostBtn>
      </Header>
      <div style={{ padding: "4px 34px 0", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="rev-grid">
          {cards.map((r, i) => (
            <div key={i} className="glass" style={{ position: "relative", overflow: "hidden", borderRadius: 20, padding: 20, animation: `fadeUp .5s cubic-bezier(.16,1,.3,1) ${i * 0.06}s both` }}>
              <div style={{ position: "absolute", top: -28, right: -28, width: 90, height: 90, borderRadius: "50%", filter: "blur(34px)", opacity: 0.28, background: r.color }}></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: r.color, background: r.color + "14", border: `1px solid ${r.color}25` }}><Ic d={r.icon} size={16} /></div>
                <span className="eyebrow">{r.sub}</span>
              </div>
              <div className="serif" style={{ fontSize: 36, lineHeight: 1, color: r.color }}>{money(r.value)}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 5, fontWeight: 500 }}>{r.label}</div>
            </div>
          ))}
        </div>

        <div className="glass" style={{ borderRadius: 20, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--glass-brd-soft)" }}>
            {["Project", "Client", "Amount", "Due Date", "Status"].map(h => <div key={h} className="eyebrow">{h}</div>)}
          </div>
          {invoices.map((inv, i) => {
            const ic = inv.status === "paid" ? "var(--green)" : inv.status === "overdue" ? "var(--red)" : inv.status === "cancelled" ? "var(--ink-faint)" : "var(--yellow)";
            return (
              <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr", gap: 14, padding: "14px 20px", alignItems: "center", borderBottom: i < invoices.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", animation: `fadeIn .4s ease ${i * 0.03}s both` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                  <span style={{ color: "var(--ink-faint)", display: "flex", flexShrink: 0 }}><Ic d={ICONS.file} size={13} /></span>
                  <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.project_title}</span>
                </div>
                <span style={{ fontSize: 12.5, color: "var(--ink-mute)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.client_name}</span>
                <span className="serif" style={{ fontSize: 18 }}>{money(inv.amount)}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{fmtDate(inv.due_date)}</span>
                <span className="mono" style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", padding: "3px 9px", borderRadius: 999, color: ic, background: ic + "18", border: `1px solid ${ic}30`, justifySelf: "start" }}>{inv.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Pane>
  );
}

// ════════════════════════════════════════════════════════════
//  CLIENTS
// ════════════════════════════════════════════════════════════
function Clients({ users, projects, toast }) {
  const colors = ["#ff7a18", "#818cf8", "#f472b6", "#3ad17a", "#f5b942"];
  return (
    <Pane>
      <Header title="Clients" subtitle={`${users.length} registered client${users.length !== 1 ? "s" : ""}`}>
        <GhostBtn icon={ICONS.download} onClick={() => { exportCSV("clients.csv", ["Name", "Email", "Company", "Phone", "Projects"], users.map(u => [u.name, u.email, u.company, u.phone, u.project_count])); toast("Clients exported"); }}>Export CSV</GhostBtn>
      </Header>
      <div style={{ padding: "4px 34px 0", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="rev-grid">
        {users.map((u, i) => {
          const color = colors[u.id % colors.length];
          const active = projects.filter(p => p.client_id === u.id && p.status === "in_progress").length;
          return (
            <div key={u.id} className="glass" style={{ borderRadius: 20, padding: 20, animation: `fadeUp .45s cubic-bezier(.16,1,.3,1) ${i * 0.05}s both`, transition: "border-color .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color + "40"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--glass-brd-soft)"}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, color: "#fff", flexShrink: 0, background: `linear-gradient(135deg, ${color}, ${color}99)`, boxShadow: `0 6px 16px -4px ${color}50` }}>{u.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{u.company}</div>
                </div>
                <IconBtn icon={ICONS.chevR} onClick={() => toast(`Open ${u.name}`)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-mute)" }}><span style={{ color: "var(--ink-faint)", display: "flex" }}><Ic d={ICONS.mail} size={13} /></span>{u.email}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-mute)" }}><span style={{ color: "var(--ink-faint)", display: "flex" }}><Ic d={ICONS.phone} size={13} /></span>{u.phone}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, background: "rgba(255,255,255,0.025)" }}>
                  <div className="serif" style={{ fontSize: 22, color }}>{u.project_count}</div>
                  <div className="eyebrow">projects</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, background: "rgba(255,255,255,0.025)" }}>
                  <div className="serif" style={{ fontSize: 22, color: "var(--green)" }}>{active}</div>
                  <div className="eyebrow">active</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Pane>
  );
}

// ════════════════════════════════════════════════════════════
//  MESSAGES (lightweight premium inbox)
// ════════════════════════════════════════════════════════════
function Messages({ toast }) {
  const threads = [
    { id: 1, name: "Andrei Marin", company: "Atlas", last: "Can we add a CSV export to the analytics view?", time: "2h", unread: true, color: "#ff7a18" },
    { id: 2, name: "Elena Pop", company: "BrightCart", last: "Checkout looks amazing 🙌 shipping next week?", time: "5h", unread: true, color: "#818cf8" },
    { id: 3, name: "Mihai Vlad", company: "Northwind", last: "Approved the architecture spec, let's go.", time: "1d", unread: true, color: "#f472b6" },
    { id: 4, name: "Raluca Toma", company: "Lumen", last: "Thank you for the handover docs!", time: "3d", unread: false, color: "#3ad17a" },
  ];
  const [sel, setSel] = useState(threads[0]);
  return (
    <Pane>
      <Header title="Messages" subtitle="Client conversations" />
      <div style={{ padding: "4px 34px 0", display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, height: "calc(100vh - 130px)" }} className="msg-grid">
        <div className="glass" style={{ borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {threads.map(t => (
            <button key={t.id} onClick={() => setSel(t)} style={{ display: "flex", gap: 12, padding: 16, cursor: "pointer", textAlign: "left", border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", background: sel.id === t.id ? "rgba(255,122,24,0.08)" : "transparent", transition: "background .15s" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0, background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>{t.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
                  <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>{t.time}</span>
                </div>
                <div style={{ fontSize: 11.5, color: t.unread ? "var(--ink-soft)" : "var(--ink-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{t.last}</div>
              </div>
              {t.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--orange)", marginTop: 6, flexShrink: 0 }}></span>}
            </button>
          ))}
        </div>
        <div className="glass" style={{ borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--glass-brd-soft)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${sel.color}, ${sel.color}99)` }}>{sel.name[0]}</div>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{sel.name}</div><div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{sel.company}</div></div>
          </div>
          <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12, justifyContent: "flex-end" }}>
            <div style={{ alignSelf: "flex-start", maxWidth: "70%", padding: "11px 15px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.04)", fontSize: 13, color: "var(--ink-soft)" }}>{sel.last}</div>
            <div style={{ alignSelf: "flex-end", maxWidth: "70%", padding: "11px 15px", borderRadius: "16px 16px 4px 16px", background: "linear-gradient(100deg, var(--orange), var(--orange-deep))", fontSize: 13, color: "#fff" }}>On it — I'll have an update for you shortly. 🚀</div>
          </div>
          <div style={{ padding: 16, borderTop: "1px solid var(--glass-brd-soft)", display: "flex", gap: 10 }}>
            <input placeholder="Type a reply…" className="focus-ring" style={{ flex: 1, height: 40, padding: "0 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-brd-soft)", color: "var(--ink)", fontSize: 13, outline: "none" }} />
            <PrimaryBtn icon={ICONS.send} onClick={() => toast("Reply sent")}>Send</PrimaryBtn>
          </div>
        </div>
      </div>
    </Pane>
  );
}

// ════════════════════════════════════════════════════════════
//  APP ROOT
// ════════════════════════════════════════════════════════════
function AdminApp() {
  const [view, setView] = useState("overview");
  const [selected, setSelected] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const toast = useToast();

  const openProject = (p) => { setSelected(p); setView("project_detail"); };
  const goView = (v) => { setSelected(null); setView(v); };

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen(o => !o); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const pendingInvoices = ALL_INVOICES.filter(i => i.status === "pending").length;

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <Sidebar view={view} setView={goView} onOpenCmd={() => setCmdOpen(true)} pendingInvoices={pendingInvoices} />
      <main style={{ marginLeft: 244, minHeight: "100vh" }}>
        {view === "overview" && <Overview stats={MOCK_STATS} projects={MOCK_PROJECTS} activity={MOCK_ACTIVITY} setView={goView} openProject={openProject} />}
        {view === "projects" && <Projects projects={MOCK_PROJECTS} openProject={openProject} toast={toast} />}
        {view === "project_detail" && selected && <ProjectDetail project={selected} onBack={() => goView("projects")} toast={toast} />}
        {view === "invoices" && <Invoices invoices={ALL_INVOICES} stats={MOCK_STATS} toast={toast} />}
        {view === "clients" && <Clients users={MOCK_USERS} projects={MOCK_PROJECTS} toast={toast} />}
        {view === "messages" && <Messages toast={toast} />}
      </main>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} setView={goView} openProject={openProject} />
      <style>{`
        @media (max-width: 1100px){
          .kpi-grid{ grid-template-columns: 1fr 1fr !important; }
          .rev-grid{ grid-template-columns: 1fr !important; }
          .detail-grid{ grid-template-columns: 1fr !important; }
          .msg-grid{ grid-template-columns: 1fr !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
}

function Root() {
  return <ToastProvider><AdminApp /></ToastProvider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);

Object.assign(window, { Projects, ProjectDetail, Invoices, Clients, Messages, AdminApp });
