import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, authFetch } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  Layers, Clock, CheckCircle2, AlertCircle, Zap, LogOut, ChevronRight,
  TrendingUp, MessageSquare, ExternalLink, Github, Calendar, DollarSign,
  ArrowLeft, Send, Star, Code2, Rocket, Receipt, Bell, Sparkles, Shield,
  BarChart3, Activity, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CodeBackground from "@/components/CodeBackground";

const STATUS_META: Record<string, { label: string; color: string; bg: string; glow: string; icon: React.ReactNode }> = {
  pending:     { label: "Pending Review",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  glow: "rgba(245,158,11,0.2)",  icon: <Clock size={11} /> },
  planning:    { label: "In Planning",     color: "#818cf8", bg: "rgba(129,140,248,0.08)", glow: "rgba(129,140,248,0.2)", icon: <AlertCircle size={11} /> },
  in_progress: { label: "In Progress",     color: "#34d399", bg: "rgba(52,211,153,0.08)",  glow: "rgba(52,211,153,0.2)",  icon: <Zap size={11} /> },
  review:      { label: "Under Review",    color: "#f472b6", bg: "rgba(244,114,182,0.08)", glow: "rgba(244,114,182,0.2)", icon: <Star size={11} /> },
  completed:   { label: "Completed",       color: "#4ade80", bg: "rgba(74,222,128,0.08)",  glow: "rgba(74,222,128,0.2)",  icon: <CheckCircle2 size={11} /> },
  cancelled:   { label: "Cancelled",       color: "#f87171", bg: "rgba(248,113,113,0.08)", glow: "rgba(248,113,113,0.2)", icon: <AlertCircle size={11} /> },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "#6b7280" },
  normal: { label: "Normal", color: "#818cf8" },
  high:   { label: "High",   color: "#f59e0b" },
  urgent: { label: "Urgent", color: "#f87171" },
};

type Tab = "projects" | "messages" | "invoices";

export default function Dashboard() {
  const { user, token, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [allUpdates, setAllUpdates] = useState<any[]>([]);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) { setLocation("/login"); return; }
    if (user?.role === "admin") { setLocation("/admin"); return; }
  }, [user, loading]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      authFetch("/api/projects", token).catch(() => []),
      authFetch("/api/updates", token).catch(() => []),
      authFetch("/api/invoices", token).catch(() => []),
    ]).then(([p, u, inv]) => {
      setProjects(p);
      setAllUpdates(u);
      setAllInvoices(inv);
    }).finally(() => setFetching(false));
  }, [token]);

  const loadProject = async (id: number) => {
    try {
      const data = await authFetch(`/api/projects/${id}`, token);
      setSelected(data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selected) return;
    setSending(true);
    try {
      await authFetch(`/api/projects/${selected.id}/updates`, token, {
        method: "POST",
        body: JSON.stringify({ message, type: "note" }),
      });
      await loadProject(selected.id);
      const u = await authFetch("/api/updates", token).catch(() => []);
      setAllUpdates(u);
      setMessage("");
    } catch { } finally { setSending(false); }
  };

  if (loading || fetching) return <LoadingScreen />;

  const totalInvoiced = allInvoices.reduce((s: number, i: any) => s + Number(i.amount), 0);
  const totalPaid = allInvoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.amount), 0);
  const pendingInvoices = allInvoices.filter((i: any) => i.status === "pending").length;
  const adminUpdates = allUpdates.filter((u: any) => u.author_role === "admin").length;

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "projects",  label: "My Projects", icon: <Layers size={14} /> },
    { id: "messages",  label: "Messages",    icon: <MessageSquare size={14} />, badge: adminUpdates || undefined },
    { id: "invoices",  label: "Invoices",    icon: <CreditCard size={14} />, badge: pendingInvoices || undefined },
  ];

  return (
    <div className="min-h-screen bg-[#060410] text-foreground relative overflow-hidden">
      <CodeBackground />
      {/* Background layers */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(184,85,255,0.12),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_80%,rgba(240,80,200,0.06),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(184,85,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(184,85,255,0.012)_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 z-30 flex flex-col">
        <div className="absolute inset-0 bg-[#0a0618]/90 backdrop-blur-2xl border-r border-white/[0.04]" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

        <div className="relative flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 pt-6 pb-5">
            <a href="/" className="flex items-center gap-2.5 group mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#b855ff] to-[#f050c8] flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                <Sparkles size={13} className="text-white" />
              </div>
              <span className="font-black text-sm tracking-tight">
                <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">py</span>
                <span className="text-white">Kode</span>
              </span>
            </a>

            {/* User card */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center text-sm font-black text-white shadow-md shadow-primary/30">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0618]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-white/90">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground/50 truncate">{user?.company || user?.email}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">CLIENT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5">
            <p className="px-3 mb-2 text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/30">Navigation</p>
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setTab(item.id); setSelected(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 relative group ${
                  tab === item.id && !selected
                    ? "text-white"
                    : "text-muted-foreground/60 hover:text-white/80 hover:bg-white/[0.03]"
                }`}>
                {tab === item.id && !selected && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-fuchsia-500/10 border border-primary/20" />
                )}
                <span className={`relative z-10 ${tab === item.id && !selected ? "text-primary" : ""}`}>{item.icon}</span>
                <span className="relative z-10 flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="relative z-10 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-primary text-white min-w-[18px] text-center">{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-5 space-y-1">
            <div className="mx-2 mb-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div className="px-3 py-2.5 rounded-xl bg-gradient-to-br from-primary/8 to-fuchsia-500/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={10} className="text-primary" />
                <p className="text-[9px] font-bold text-primary uppercase tracking-wider">Secure Portal</p>
              </div>
              <p className="text-[10px] text-muted-foreground/50">Your data is encrypted end-to-end</p>
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200">
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 relative z-10 min-h-screen">
        <AnimatePresence mode="wait">

          {selected ? (
            <ProjectDetail key="detail" project={selected} onBack={() => setSelected(null)}
              message={message} setMessage={setMessage} onSend={sendMessage} sending={sending} />

          ) : tab === "projects" ? (

            <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {/* Header */}
              <div className="px-8 py-5 border-b border-white/[0.04] bg-[#060410]/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-black tracking-tight">My Projects</h1>
                    <p className="text-xs text-muted-foreground/50 mt-0.5">Real-time progress tracking & milestones</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Activity size={10} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-8 pt-6 pb-4 grid grid-cols-3 gap-4">
                {[
                  { label: "Total Projects",  value: projects.length,                                              icon: <Layers size={15} />,      color: "#b855ff", sub: "all time" },
                  { label: "In Progress",     value: projects.filter(p => p.status === "in_progress").length,     icon: <Zap size={15} />,         color: "#34d399", sub: "active now" },
                  { label: "Completed",       value: projects.filter(p => p.status === "completed").length,       icon: <CheckCircle2 size={15} />, color: "#4ade80", sub: "delivered" },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="relative overflow-hidden p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] group hover:border-white/[0.08] transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 80% 20%, ${s.color}08, transparent 60%)` }} />
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                        {s.icon}
                      </div>
                      <span className="text-[10px] text-muted-foreground/30 font-medium">{s.sub}</span>
                    </div>
                    <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Projects */}
              <div className="px-8 pb-10">
                {projects.length === 0 ? <EmptyState /> : (
                  <div className="space-y-3">
                    {projects.map((p, i) => {
                      const sm = STATUS_META[p.status] || STATUS_META.pending;
                      const pm = PRIORITY_META[p.priority] || PRIORITY_META.normal;
                      return (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                          onClick={() => loadProject(p.id)}
                          className="group relative overflow-hidden p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:border-primary/25 cursor-pointer transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/[0.03] group-hover:to-fuchsia-500/[0.03] transition-all duration-500" />
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl transition-all duration-300" style={{ background: `linear-gradient(to bottom, ${sm.color}, transparent)`, opacity: 0.6 }} />

                          <div className="relative flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] font-black tracking-[0.12em] uppercase text-muted-foreground/30">{p.type}</span>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ background: pm.color + "12", color: pm.color, borderColor: pm.color + "30" }}>{pm.label}</span>
                              </div>
                              <h3 className="text-base font-bold group-hover:text-primary/90 transition-colors truncate">{p.title}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 border"
                              style={{ background: sm.bg, color: sm.color, borderColor: sm.color + "25" }}>
                              {sm.icon} <span className="ml-1">{sm.label}</span>
                            </div>
                          </div>

                          <div className="relative mb-4">
                            <div className="flex justify-between text-[10px] text-muted-foreground/50 mb-1.5 font-medium">
                              <span>Progress</span>
                              <span className="font-bold" style={{ color: sm.color }}>{p.progress}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                              <motion.div className="h-full rounded-full"
                                style={{ background: `linear-gradient(to right, ${sm.color}cc, ${sm.color})` }}
                                initial={{ width: 0 }} animate={{ width: `${p.progress}%` }}
                                transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: "easeOut" }} />
                            </div>
                          </div>

                          <div className="relative flex items-center justify-between">
                            <div className="flex flex-wrap gap-1.5">
                              {(p.tech_stack || []).slice(0, 4).map((t: string) => (
                                <span key={t} className="px-2 py-0.5 rounded-lg text-[9px] font-medium border border-white/[0.06] text-muted-foreground/50 bg-white/[0.02]">{t}</span>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              View Details <ChevronRight size={13} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

          ) : tab === "messages" ? (

            <motion.div key="messages" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="px-8 py-5 border-b border-white/[0.04] bg-[#060410]/80 backdrop-blur-xl sticky top-0 z-20">
                <h1 className="text-xl font-black tracking-tight">Messages</h1>
                <p className="text-xs text-muted-foreground/50 mt-0.5">Project updates and notes from your developer</p>
              </div>

              <div className="px-8 py-6 space-y-3 max-w-3xl">
                {allUpdates.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
                    <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4">
                      <Bell size={22} className="text-primary/60" />
                    </div>
                    <h3 className="text-base font-bold mb-1.5">No messages yet</h3>
                    <p className="text-muted-foreground/50 text-xs">Updates from your developer will appear here.</p>
                  </motion.div>
                )}
                {allUpdates.map((u: any, i: number) => {
                  const typeColor = ({ update: "#818cf8", milestone: "#34d399", note: "#f472b6", alert: "#f59e0b" } as any)[u.type] || "#818cf8";
                  const isAdmin = u.author_role === "admin";
                  return (
                    <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex gap-3.5 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.018] hover:bg-white/[0.025] transition-colors">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-shrink-0 shadow-lg"
                        style={{ background: isAdmin ? "linear-gradient(135deg,#b855ff,#f050c8)" : "#1e293b", boxShadow: isAdmin ? "0 4px 12px rgba(184,85,255,0.3)" : "none" }}>
                        {isAdmin ? "K" : u.author_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[11px] font-bold">{isAdmin ? "pyKode Dev" : u.author_name}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border"
                            style={{ background: typeColor + "15", color: typeColor, borderColor: typeColor + "25" }}>{u.type}</span>
                          {u.project_title && <span className="text-[10px] text-muted-foreground/40 font-medium">#{u.project_title}</span>}
                          <span className="text-[10px] text-muted-foreground/30 ml-auto">
                            {new Date(u.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/70 leading-relaxed">{u.message}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

          ) : (

            <motion.div key="invoices" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="px-8 py-5 border-b border-white/[0.04] bg-[#060410]/80 backdrop-blur-xl sticky top-0 z-20">
                <h1 className="text-xl font-black tracking-tight">Invoices</h1>
                <p className="text-xs text-muted-foreground/50 mt-0.5">Billing history and payment status</p>
              </div>

              <div className="px-8 py-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Invoiced", value: `$${totalInvoiced.toFixed(2)}`,    icon: <BarChart3 size={15} />,    color: "#b855ff", sub: "all invoices" },
                    { label: "Total Paid",     value: `$${totalPaid.toFixed(2)}`,        icon: <CheckCircle2 size={15} />, color: "#34d399", sub: "cleared" },
                    { label: "Pending",        value: `${pendingInvoices}`,              icon: <Clock size={15} />,        color: "#f59e0b", sub: `invoice${pendingInvoices !== 1 ? "s" : ""} due` },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="relative overflow-hidden p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15`, color: s.color }}>
                          {s.icon}
                        </div>
                        <span className="text-[10px] text-muted-foreground/30">{s.sub}</span>
                      </div>
                      <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                {allInvoices.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4">
                      <Receipt size={22} className="text-primary/60" />
                    </div>
                    <h3 className="text-base font-bold mb-1.5">No invoices yet</h3>
                    <p className="text-muted-foreground/50 text-xs">Your invoices will appear here once created.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.04] grid grid-cols-4 gap-4 bg-white/[0.02]">
                      {["Project", "Amount", "Due Date", "Status"].map(h => (
                        <p key={h} className="text-[9px] font-black tracking-[0.12em] uppercase text-muted-foreground/30">{h}</p>
                      ))}
                    </div>
                    {allInvoices.map((inv: any, i: number) => (
                      <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className={`grid grid-cols-4 gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors ${i < allInvoices.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                        <p className="text-xs font-semibold truncate">{inv.project_title}</p>
                        <p className="text-sm font-black">${Number(inv.amount).toFixed(2)}</p>
                        <p className="text-[11px] text-muted-foreground/50">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black w-fit border ${
                          inv.status === "paid"      ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          inv.status === "overdue"   ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          inv.status === "cancelled" ? "bg-gray-500/10 text-gray-400 border-gray-500/20" :
                                                       "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ProjectDetail({ project: p, onBack, message, setMessage, onSend, sending }: any) {
  const sm = STATUS_META[p.status] || STATUS_META.pending;
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
      <div className="px-8 py-4 border-b border-white/[0.04] bg-[#060410]/80 backdrop-blur-xl sticky top-0 z-20 flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors font-medium">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="w-px h-4 bg-white/[0.07]" />
        <h1 className="font-bold text-sm truncate flex-1">{p.title}</h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 border"
          style={{ background: sm.bg, color: sm.color, borderColor: sm.color + "25" }}>
          {sm.icon} <span className="ml-1">{sm.label}</span>
        </div>
      </div>

      <div className="px-8 py-6 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          <GlassCard title="Project Overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Type",     value: p.type || "—",   icon: <Code2 size={11} /> },
                { label: "Budget",   value: p.budget ? `$${p.budget}` : "—", icon: <DollarSign size={11} /> },
                { label: "Deadline", value: p.deadline ? new Date(p.deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—", icon: <Calendar size={11} /> },
                { label: "Progress", value: `${p.progress}%`, icon: <TrendingUp size={11} /> },
              ].map((d, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-1 text-muted-foreground/40 text-[9px] uppercase tracking-wider mb-1.5 font-bold">{d.icon}{d.label}</div>
                  <p className="font-black text-sm">{d.value}</p>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-[10px] mb-1.5 font-medium">
                <span className="text-muted-foreground/50">Overall Progress</span>
                <span className="font-black" style={{ color: sm.color }}>{p.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(to right, #b855ff, #f050c8)` }}
                  initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 1.4, ease: "easeOut" }} />
              </div>
            </div>
            {p.description && <p className="text-xs text-muted-foreground/60 leading-relaxed">{p.description}</p>}
            {p.tech_stack?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {p.tech_stack.map((t: string) => (
                  <span key={t} className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/[0.07] text-muted-foreground/60 bg-white/[0.02]">{t}</span>
                ))}
              </div>
            )}
          </GlassCard>

          {(p.live_url || p.repo_url) && (
            <GlassCard title="Project Links">
              <div className="flex flex-wrap gap-2">
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noopener"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/18 transition-all">
                    <ExternalLink size={11} /> Live Site
                  </a>
                )}
                {p.repo_url && (
                  <a href={p.repo_url} target="_blank" rel="noopener"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-bold hover:border-white/[0.15] transition-all">
                    <Github size={11} /> Repository
                  </a>
                )}
              </div>
            </GlassCard>
          )}

          <GlassCard title={`Updates & Milestones (${p.updates?.length || 0})`}>
            {p.updates?.length === 0 && (
              <p className="text-xs text-muted-foreground/40 py-6 text-center">No updates yet.</p>
            )}
            <div className="space-y-2.5 mb-5">
              {(p.updates || []).map((u: any, i: number) => {
                const typeColor = ({ update: "#818cf8", milestone: "#34d399", note: "#f472b6", alert: "#f59e0b" } as any)[u.type] || "#818cf8";
                return (
                  <motion.div key={u.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex gap-3 p-3.5 rounded-xl bg-white/[0.018] border border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: typeColor, boxShadow: `0 0 8px ${typeColor}` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border" style={{ background: typeColor + "15", color: typeColor, borderColor: typeColor + "25" }}>{u.type}</span>
                          <span className="text-[10px] text-muted-foreground/40">{u.author_name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/30 flex-shrink-0">
                          {new Date(u.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/65 leading-relaxed">{u.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="border-t border-white/[0.04] pt-4">
              <p className="text-[9px] text-muted-foreground/40 mb-2 font-black uppercase tracking-[0.12em]">Leave a note</p>
              <Textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Ask a question or leave a note for the developer..."
                className="bg-white/[0.02] border-white/[0.06] focus:border-primary/30 resize-none text-xs" rows={3} />
              <Button onClick={onSend} disabled={sending || !message.trim()} size="sm"
                className="mt-2 bg-gradient-to-r from-primary to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                {sending ? "Sending..." : <><Send size={11} className="mr-1.5" />Send Note</>}
              </Button>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard title="Invoices">
            {p.invoices?.length === 0 && <p className="text-xs text-muted-foreground/40 py-2 text-center">No invoices yet.</p>}
            <div className="space-y-2">
              {(p.invoices || []).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.018] border border-white/[0.04]">
                  <div>
                    <p className="text-sm font-black">${Number(inv.amount).toFixed(2)}</p>
                    {inv.due_date && <p className="text-[10px] text-muted-foreground/40">Due {new Date(inv.due_date).toLocaleDateString()}</p>}
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${
                    inv.status === "paid" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    inv.status === "overdue" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                    {inv.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {p.notes && (
            <GlassCard title="Developer Notes">
              <p className="text-xs text-muted-foreground/65 leading-relaxed">{p.notes}</p>
            </GlassCard>
          )}

          <GlassCard title="Need Help?">
            <p className="text-[11px] text-muted-foreground/50 mb-3 leading-relaxed">Got a question? I respond within 2 hours.</p>
            <a href="/#contact">
              <Button size="sm" variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/8 text-xs font-bold">
                <MessageSquare size={11} className="mr-1.5" /> Contact Developer
              </Button>
            </a>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}

function GlassCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] overflow-hidden backdrop-blur-sm">
      <div className="px-5 py-3 border-b border-white/[0.04] bg-white/[0.015]">
        <h3 className="text-[9px] font-black tracking-[0.12em] uppercase text-muted-foreground/40">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
      <div className="w-20 h-20 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-5">
        <Rocket size={28} className="text-primary/60" />
      </div>
      <h3 className="text-lg font-bold mb-2">No projects yet</h3>
      <p className="text-muted-foreground/50 text-xs max-w-xs mx-auto">Your projects will appear here once your developer assigns them to your account.</p>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#060410] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center animate-pulse shadow-lg shadow-primary/30">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
