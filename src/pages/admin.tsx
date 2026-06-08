import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, authFetch } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  Users, Layers, TrendingUp, Zap, LogOut, Plus, Edit2, Trash2,
  X, CheckCircle2, Clock, AlertCircle, Star, RefreshCw, Search,
  ArrowLeft, Send, DollarSign, Shield, Calendar, ExternalLink, Github,
  Activity, Receipt, ChevronRight, FileText, Sparkles, BarChart3,
  CreditCard, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CodeBackground from "@/components/CodeBackground";

const STATUS_OPTIONS = ["pending", "planning", "in_progress", "review", "completed", "cancelled"];
const PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"];
const TYPE_OPTIONS = ["Web App", "Landing Page", "E-Commerce", "AI Integration", "SaaS", "Mobile App", "API", "Other"];
const INVOICE_STATUSES = ["pending", "paid", "overdue", "cancelled"];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Pending",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  planning:    { label: "Planning",    color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  in_progress: { label: "In Progress", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  review:      { label: "Review",      color: "#f472b6", bg: "rgba(244,114,182,0.1)" },
  completed:   { label: "Completed",   color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  cancelled:   { label: "Cancelled",   color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

type View = "overview" | "projects" | "users" | "invoices" | "project_detail";

export default function Admin() {
  const { user, token, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<View>("overview");
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [updateMsg, setUpdateMsg] = useState("");
  const [updateType, setUpdateType] = useState("update");
  const [sending, setSending] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ amount: "", status: "pending", dueDate: "" });
  const [savingInvoice, setSavingInvoice] = useState(false);

  useEffect(() => {
    if (!loading && !user) { setLocation("/login"); return; }
    if (user && user.role !== "admin") { setLocation("/dashboard"); return; }
  }, [user, loading]);

  const loadData = useCallback(async () => {
    if (!token) return;
    const [s, p, u, inv, act] = await Promise.all([
      authFetch("/api/admin/stats", token).catch(() => null),
      authFetch("/api/projects", token).catch(() => []),
      authFetch("/api/admin/users", token).catch(() => []),
      authFetch("/api/admin/invoices", token).catch(() => []),
      authFetch("/api/admin/activity", token).catch(() => []),
    ]);
    setStats(s); setProjects(p); setUsers(u); setInvoices(inv); setActivity(act);
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadProject = async (id: number) => {
    const data = await authFetch(`/api/projects/${id}`, token);
    setSelectedProject(data);
    setView("project_detail");
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await authFetch(`/api/admin/projects/${id}`, token, { method: "DELETE" });
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const sendUpdate = async () => {
    if (!updateMsg.trim() || !selectedProject) return;
    setSending(true);
    try {
      await authFetch(`/api/projects/${selectedProject.id}/updates`, token, {
        method: "POST", body: JSON.stringify({ message: updateMsg, type: updateType }),
      });
      await loadProject(selectedProject.id);
      setUpdateMsg("");
    } catch { } finally { setSending(false); }
  };

  const createInvoice = async () => {
    if (!invoiceForm.amount || !selectedProject) return;
    setSavingInvoice(true);
    try {
      await authFetch(`/api/admin/projects/${selectedProject.id}/invoices`, token, {
        method: "POST", body: JSON.stringify({ amount: invoiceForm.amount, status: invoiceForm.status, dueDate: invoiceForm.dueDate }),
      });
      await loadProject(selectedProject.id);
      loadData();
      setInvoiceForm({ amount: "", status: "pending", dueDate: "" });
      setShowInvoiceForm(false);
    } catch { } finally { setSavingInvoice(false); }
  };

  const deleteInvoice = async (invoiceId: number) => {
    if (!confirm("Delete this invoice?")) return;
    await authFetch(`/api/admin/invoices/${invoiceId}`, token, { method: "DELETE" });
    if (selectedProject) await loadProject(selectedProject.id);
    loadData();
  };

  const updateInvoiceStatus = async (invoiceId: number, status: string) => {
    const inv = invoices.find(i => i.id === invoiceId) || selectedProject?.invoices?.find((i: any) => i.id === invoiceId);
    if (!inv) return;
    await authFetch(`/api/admin/invoices/${invoiceId}`, token, {
      method: "PUT", body: JSON.stringify({ status, amount: inv.amount, dueDate: inv.due_date }),
    });
    if (selectedProject) await loadProject(selectedProject.id);
    loadData();
  };

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <LoadingScreen />;

  const pendingInvoicesCount = invoices.filter(i => i.status === "pending").length;

  const navItems: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Overview",  icon: <BarChart3 size={14} /> },
    { id: "projects", label: "Projects",  icon: <Layers size={14} /> },
    { id: "invoices", label: "Invoices",  icon: <CreditCard size={14} />, badge: pendingInvoicesCount || undefined },
    { id: "users",    label: "Clients",   icon: <Users size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#060410] text-foreground relative overflow-hidden">
      <CodeBackground />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(184,85,255,0.1),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_40%_50%_at_90%_90%,rgba(240,80,200,0.05),transparent)] pointer-events-none" />
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
                <Shield size={13} className="text-white" />
              </div>
              <div>
                <p className="text-[8px] font-black tracking-[0.18em] uppercase text-muted-foreground/40">Admin Panel</p>
                <p className="text-sm font-black tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">py</span>
                  <span className="text-white">Kode</span>
                </p>
              </div>
            </a>

            {/* Admin card */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-fuchsia-500/5 border border-primary/15">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center text-[11px] font-black text-white shadow-md shadow-primary/30 flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-primary/90">{user?.name}</p>
                  <p className="text-[9px] text-primary/40">Administrator</p>
                </div>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-primary text-white flex-shrink-0">ADMIN</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5">
            <p className="px-3 mb-2 text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground/30">Navigation</p>
            {navItems.map(item => (
              <button key={item.id}
                onClick={() => { setView(item.id); setShowProjectForm(false); setSelectedProject(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 relative ${
                  (view === item.id || (view === "project_detail" && item.id === "projects"))
                    ? "text-white"
                    : "text-muted-foreground/60 hover:text-white/80 hover:bg-white/[0.03]"
                }`}>
                {(view === item.id || (view === "project_detail" && item.id === "projects")) && (
                  <motion.div layoutId="admin-nav-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-fuchsia-500/10 border border-primary/20" />
                )}
                <span className={`relative z-10 ${(view === item.id || (view === "project_detail" && item.id === "projects")) ? "text-primary" : ""}`}>{item.icon}</span>
                <span className="relative z-10 flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="relative z-10 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-yellow-500 text-black min-w-[18px] text-center">{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-5 space-y-1">
            <div className="mx-2 mb-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <a href="/" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted-foreground/50 hover:text-white/80 hover:bg-white/[0.03] transition-all">
              <ExternalLink size={13} /> View Site
            </a>
            <button onClick={loadData} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted-foreground/50 hover:text-white/80 hover:bg-white/[0.03] transition-all">
              <RefreshCw size={13} /> Refresh Data
            </button>
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/5 transition-all">
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 relative z-10 min-h-screen">
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {view === "overview" && (
            <Pane key="overview">
              <Header title="Overview" subtitle="Real-time snapshot of your business." />
              <div className="px-8 py-6 space-y-6">

                {/* Project stats */}
                <div>
                  <p className="text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground/30 mb-3">Projects</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Clients",  value: stats?.totalClients ?? "—",   icon: <Users size={15} />,  color: "#b855ff", sub: "registered" },
                      { label: "Total Projects", value: stats?.totalProjects ?? "—",  icon: <Layers size={15} />, color: "#818cf8", sub: "all time" },
                      { label: "Active",         value: stats?.activeProjects ?? "—", icon: <Zap size={15} />,    color: "#34d399", sub: "in progress" },
                      { label: "Pending",        value: stats?.pendingRequests ?? "—",icon: <Clock size={15} />,  color: "#f59e0b", sub: "awaiting" },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="relative overflow-hidden p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] group hover:border-white/[0.08] transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" style={{ background: s.color }} />
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                          <span className="text-[9px] text-muted-foreground/30 font-medium">{s.sub}</span>
                        </div>
                        <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[11px] text-muted-foreground/55 mt-0.5 font-medium">{s.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Revenue stats */}
                <div>
                  <p className="text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground/30 mb-3">Revenue</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Invoiced", value: stats?.totalInvoiced, color: "#b855ff", icon: <BarChart3 size={15} />, sub: "issued" },
                      { label: "Collected",      value: stats?.totalPaid,     color: "#34d399", icon: <CheckCircle2 size={15} />, sub: "cleared" },
                      { label: "Outstanding",    value: stats?.totalPending,  color: "#f59e0b", icon: <Clock size={15} />, sub: "pending" },
                    ].map((r, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06 }}
                        className="relative overflow-hidden p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
                        <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-15" style={{ background: r.color }} />
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.color + "18", color: r.color }}>{r.icon}</div>
                          <span className="text-[9px] text-muted-foreground/30">{r.sub}</span>
                        </div>
                        <p className="text-3xl font-black" style={{ color: r.color }}>
                          ${r.value != null ? Number(r.value).toFixed(2) : "0.00"}
                        </p>
                        <p className="text-[11px] text-muted-foreground/55 mt-0.5 font-medium">{r.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recent projects + activity */}
                <div className="grid lg:grid-cols-2 gap-5">
                  <GlassCard title="Recent Projects" action={{ label: "View all", onClick: () => setView("projects") }}>
                    {projects.length === 0 && <p className="text-center text-muted-foreground/40 py-8 text-xs">No projects yet.</p>}
                    <div className="space-y-0.5">
                      {projects.slice(0, 5).map((p, i) => {
                        const sm = STATUS_META[p.status] || STATUS_META.pending;
                        return (
                          <div key={p.id} onClick={() => loadProject(p.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-all group ${i < 4 ? "" : ""}`}>
                            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${sm.color}, transparent)` }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{p.title}</p>
                              <p className="text-[10px] text-muted-foreground/40">{p.client_name}</p>
                            </div>
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                              <div className="w-14">
                                <div className="h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: sm.color }} />
                                </div>
                                <p className="text-[9px] text-right mt-0.5" style={{ color: sm.color }}>{p.progress}%</p>
                              </div>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
                                style={{ background: sm.bg, color: sm.color, borderColor: sm.color + "25" }}>{sm.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>

                  <GlassCard title="Recent Activity">
                    {activity.length === 0 && <p className="text-center text-muted-foreground/40 py-8 text-xs">No activity yet.</p>}
                    <div className="space-y-0.5">
                      {activity.slice(0, 6).map((a, i) => {
                        const typeColor = ({ update: "#818cf8", milestone: "#34d399", note: "#f472b6", alert: "#f59e0b" } as any)[a.type] || "#818cf8";
                        return (
                          <div key={a.id} className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: typeColor, boxShadow: `0 0 6px ${typeColor}` }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground/75 truncate leading-relaxed">{a.message}</p>
                              <p className="text-[9px] text-muted-foreground/35 mt-0.5">
                                {a.project_title} · {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </Pane>
          )}

          {/* ── PROJECTS LIST ── */}
          {view === "projects" && !showProjectForm && (
            <Pane key="projects">
              <Header title="Projects" subtitle={`${filteredProjects.length} project${filteredProjects.length !== 1 ? "s" : ""}`}>
                <Button onClick={() => { setEditingProject(null); setShowProjectForm(true); }}
                  className="bg-gradient-to-r from-primary to-fuchsia-500 text-white text-xs h-9 shadow-lg shadow-primary/20 font-bold">
                  <Plus size={13} className="mr-1.5" /> New Project
                </Button>
              </Header>

              <div className="px-8 pt-5 pb-3 flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/35" />
                  <Input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search projects or clients..." className="pl-9 h-9 bg-white/[0.02] border-white/[0.06] text-xs focus:border-primary/30" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-foreground focus:outline-none focus:border-primary/30">
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
                </select>
              </div>

              <div className="px-8 pb-10 mt-3 space-y-2.5">
                {filteredProjects.map((p, i) => {
                  const sm = STATUS_META[p.status] || STATUS_META.pending;
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:border-primary/20 hover:bg-white/[0.03] transition-all">
                      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${sm.color}, transparent)` }} />
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadProject(p.id)}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{p.title}</p>
                          <span className="text-[10px] text-muted-foreground/40 hidden sm:block">· {p.client_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-28">
                            <div className="h-0.5 rounded-full bg-white/[0.05] overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: sm.color }} />
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground/40">{p.progress}%</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 border"
                        style={{ background: sm.bg, color: sm.color, borderColor: sm.color + "25" }}>{sm.label}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => loadProject(p.id)} className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground/40 hover:text-primary transition-all">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => { setEditingProject(p); setShowProjectForm(true); }} className="p-2 rounded-xl hover:bg-white/[0.06] text-muted-foreground/40 hover:text-white transition-all">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteProject(p.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground/20 group-hover:text-primary/40 transition-colors flex-shrink-0 cursor-pointer" onClick={() => loadProject(p.id)} />
                    </motion.div>
                  );
                })}
                {filteredProjects.length === 0 && (
                  <p className="text-center text-muted-foreground/40 py-16 text-xs">No projects found.</p>
                )}
              </div>
            </Pane>
          )}

          {/* ── PROJECT FORM ── */}
          {showProjectForm && (
            <Pane key="pform">
              <Header title={editingProject ? "Edit Project" : "New Project"} subtitle="">
                <button onClick={() => setShowProjectForm(false)} className="p-2 rounded-xl hover:bg-white/[0.05] text-muted-foreground/50 hover:text-white transition-all">
                  <X size={15} />
                </button>
              </Header>
              <ProjectForm users={users} initial={editingProject} token={token} onSuccess={() => { setShowProjectForm(false); loadData(); }} />
            </Pane>
          )}

          {/* ── PROJECT DETAIL ── */}
          {view === "project_detail" && selectedProject && (
            <Pane key="pdetail">
              <Header title={selectedProject.title} subtitle={`Client: ${selectedProject.client_name}`}>
                <button onClick={() => { setView("projects"); setSelectedProject(null); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors font-medium">
                  <ArrowLeft size={13} /> Back
                </button>
                <button onClick={() => { setEditingProject(selectedProject); setShowProjectForm(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-white/[0.07] hover:border-primary/30 text-muted-foreground/60 hover:text-primary transition-all font-medium">
                  <Edit2 size={12} /> Edit
                </button>
              </Header>

              <div className="px-8 py-6 grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">

                  <GlassCard title="Quick Controls">
                    <QuickEdit project={selectedProject} token={token} onUpdate={() => loadProject(selectedProject.id)} />
                  </GlassCard>

                  <GlassCard title={`Updates (${selectedProject.updates?.length || 0})`}>
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
                      {selectedProject.updates?.length === 0 && <p className="text-xs text-muted-foreground/40 text-center py-4">No updates yet.</p>}
                      {(selectedProject.updates || []).map((u: any) => {
                        const typeColor = ({ update: "#818cf8", milestone: "#34d399", note: "#f472b6", alert: "#f59e0b" } as any)[u.type] || "#818cf8";
                        return (
                          <div key={u.id} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: typeColor, boxShadow: `0 0 6px ${typeColor}` }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border" style={{ background: typeColor + "18", color: typeColor, borderColor: typeColor + "25" }}>{u.type}</span>
                                <span className="text-[9px] text-muted-foreground/35">{new Date(u.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                <span className="text-[9px] text-muted-foreground/25 ml-auto">by {u.author_name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground/65 leading-relaxed">{u.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/[0.04] pt-4 space-y-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {["update", "milestone", "note", "alert"].map(t => (
                          <button key={t} onClick={() => setUpdateType(t)}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${updateType === t ? "bg-primary/15 text-primary border-primary/25" : "text-muted-foreground/40 border-transparent hover:text-white/60"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <Textarea value={updateMsg} onChange={e => setUpdateMsg(e.target.value)}
                        placeholder="Write an update for the client..." rows={2}
                        className="bg-white/[0.02] border-white/[0.06] focus:border-primary/30 resize-none text-xs" />
                      <Button onClick={sendUpdate} disabled={sending || !updateMsg.trim()} size="sm"
                        className="bg-gradient-to-r from-primary to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-primary/20">
                        {sending ? "Sending..." : <><Send size={11} className="mr-1.5" />Send Update</>}
                      </Button>
                    </div>
                  </GlassCard>
                </div>

                <div className="space-y-4">
                  <GlassCard title="Client Info">
                    <div className="space-y-2">
                      <InfoRow label="Name" value={selectedProject.client_name} />
                      <InfoRow label="Email" value={selectedProject.client_email} />
                      {selectedProject.client_company && <InfoRow label="Company" value={selectedProject.client_company} />}
                    </div>
                  </GlassCard>

                  <GlassCard title="Project Info">
                    <div className="space-y-2 mb-4">
                      <InfoRow label="Type" value={selectedProject.type} />
                      <InfoRow label="Budget" value={selectedProject.budget || "—"} />
                      <InfoRow label="Deadline" value={selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : "—"} />
                      <InfoRow label="Priority" value={selectedProject.priority} />
                    </div>
                    {(selectedProject.live_url || selectedProject.repo_url) && (
                      <div className="flex gap-2 pt-3 border-t border-white/[0.04]">
                        {selectedProject.live_url && <a href={selectedProject.live_url} target="_blank" rel="noopener" className="flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"><ExternalLink size={10} />Live Site</a>}
                        {selectedProject.repo_url && <a href={selectedProject.repo_url} target="_blank" rel="noopener" className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-white font-medium"><Github size={10} />Repo</a>}
                      </div>
                    )}
                  </GlassCard>

                  <GlassCard title="Invoices">
                    <div className="space-y-2 mb-3">
                      {selectedProject.invoices?.length === 0 && <p className="text-xs text-muted-foreground/40 text-center py-2">No invoices yet.</p>}
                      {(selectedProject.invoices || []).map((inv: any) => (
                        <div key={inv.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black">${Number(inv.amount).toFixed(2)}</p>
                            {inv.due_date && <p className="text-[9px] text-muted-foreground/40">Due {new Date(inv.due_date).toLocaleDateString()}</p>}
                          </div>
                          <select value={inv.status} onChange={e => updateInvoiceStatus(inv.id, e.target.value)}
                            className={`text-[9px] font-black px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${inv.status === "paid" ? "bg-green-500/12 text-green-400" : inv.status === "overdue" ? "bg-red-500/12 text-red-400" : inv.status === "cancelled" ? "bg-gray-500/12 text-gray-400" : "bg-yellow-500/12 text-yellow-400"}`}>
                            {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => deleteInvoice(inv.id)} className="p-1 rounded-lg hover:text-red-400 text-muted-foreground/30 hover:bg-red-500/8 transition-all">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {showInvoiceForm ? (
                      <div className="border-t border-white/[0.04] pt-3 space-y-2">
                        <Input value={invoiceForm.amount} onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))}
                          placeholder="Amount (e.g. 800)" type="number" className="bg-white/[0.02] border-white/[0.06] h-8 text-xs" />
                        <div className="flex gap-2">
                          <select value={invoiceForm.status} onChange={e => setInvoiceForm(f => ({ ...f, status: e.target.value }))}
                            className="flex-1 h-8 px-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-foreground focus:outline-none">
                            {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <Input value={invoiceForm.dueDate} onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))}
                            type="date" className="flex-1 bg-white/[0.02] border-white/[0.06] h-8 text-xs" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={createInvoice} disabled={savingInvoice || !invoiceForm.amount} size="sm"
                            className="flex-1 bg-gradient-to-r from-primary to-fuchsia-500 text-white text-xs h-8 font-bold">
                            {savingInvoice ? "..." : "Create"}
                          </Button>
                          <Button onClick={() => setShowInvoiceForm(false)} size="sm" variant="outline" className="h-8 border-white/[0.07] text-xs">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowInvoiceForm(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/[0.07] text-xs text-muted-foreground/40 hover:text-primary hover:border-primary/25 transition-all">
                        <Plus size={11} /> Add Invoice
                      </button>
                    )}
                  </GlassCard>
                </div>
              </div>
            </Pane>
          )}

          {/* ── INVOICES ── */}
          {view === "invoices" && (
            <Pane key="invoices">
              <Header title="Invoices" subtitle={`${invoices.length} total invoice${invoices.length !== 1 ? "s" : ""}`} />
              <div className="px-8 py-6 space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Invoiced", value: stats?.totalInvoiced, color: "#b855ff", icon: <BarChart3 size={15} />, sub: "issued" },
                    { label: "Collected",      value: stats?.totalPaid,     color: "#34d399", icon: <CheckCircle2 size={15} />, sub: "cleared" },
                    { label: "Outstanding",    value: stats?.totalPending,  color: "#f59e0b", icon: <Clock size={15} />, sub: "pending" },
                  ].map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="relative overflow-hidden p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
                      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-15" style={{ background: r.color }} />
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: r.color + "18", color: r.color }}>{r.icon}</div>
                        <span className="text-[9px] text-muted-foreground/30">{r.sub}</span>
                      </div>
                      <p className="text-3xl font-black" style={{ color: r.color }}>${r.value != null ? Number(r.value).toFixed(2) : "0.00"}</p>
                      <p className="text-[11px] text-muted-foreground/55 mt-0.5 font-medium">{r.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/[0.04] grid grid-cols-5 gap-4 bg-white/[0.015]">
                    {["Project", "Client", "Amount", "Due Date", "Status"].map(h => (
                      <p key={h} className="text-[9px] font-black tracking-[0.12em] uppercase text-muted-foreground/30">{h}</p>
                    ))}
                  </div>
                  {invoices.length === 0 && <p className="text-center text-muted-foreground/40 py-16 text-xs">No invoices yet.</p>}
                  {invoices.map((inv, i) => (
                    <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className={`grid grid-cols-5 gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-all ${i < invoices.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={11} className="text-muted-foreground/30 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{inv.project_title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground/55 truncate">{inv.client_name}</span>
                      <span className="text-sm font-black">${Number(inv.amount).toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </span>
                      <div className="flex items-center gap-2">
                        <select value={inv.status} onChange={e => updateInvoiceStatus(inv.id, e.target.value)}
                          className={`text-[9px] font-black px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${inv.status === "paid" ? "bg-green-500/12 text-green-400" : inv.status === "overdue" ? "bg-red-500/12 text-red-400" : inv.status === "cancelled" ? "bg-gray-500/12 text-gray-400" : "bg-yellow-500/12 text-yellow-400"}`}>
                          {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 rounded-lg hover:text-red-400 hover:bg-red-500/8 text-muted-foreground/30 transition-all">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Pane>
          )}

          {/* ── CLIENTS ── */}
          {view === "users" && (
            <Pane key="users">
              <Header title="Clients" subtitle={`${users.length} registered client${users.length !== 1 ? "s" : ""}`} />
              <div className="px-8 py-6 space-y-2.5">
                {users.map((u, i) => {
                  const clientProjects = projects.filter(p => p.client_id === u.id);
                  const activeCount = clientProjects.filter(p => p.status === "in_progress").length;
                  const colors = ["#b855ff", "#818cf8", "#f472b6", "#34d399", "#f59e0b"];
                  const color = colors[u.id % colors.length];
                  return (
                    <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:border-primary/20 hover:bg-white/[0.03] transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-md"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, boxShadow: `0 4px 12px ${color}30` }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground/50">{u.email}{u.company ? ` · ${u.company}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-5 text-right flex-shrink-0">
                        <div>
                          <p className="text-sm font-black" style={{ color }}>{u.project_count}</p>
                          <p className="text-[9px] text-muted-foreground/40">projects</p>
                        </div>
                        {activeCount > 0 && (
                          <div>
                            <p className="text-sm font-black text-emerald-400">{activeCount}</p>
                            <p className="text-[9px] text-muted-foreground/40">active</p>
                          </div>
                        )}
                      </div>
                      <button onClick={() => { setSearch(u.name); setStatusFilter("all"); setView("projects"); }}
                        className="p-2 rounded-xl text-muted-foreground/30 hover:text-primary hover:bg-primary/8 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100">
                        <ChevronRight size={14} />
                      </button>
                    </motion.div>
                  );
                })}
                {users.length === 0 && <p className="text-center text-muted-foreground/40 py-16 text-xs">No clients yet.</p>}
              </div>
            </Pane>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Pane({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
      {children}
    </motion.div>
  );
}

function Header({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="px-8 py-5 border-b border-white/[0.04] bg-[#060410]/80 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground/45 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

function GlassCard({ title, children, action }: { title: string; children: React.ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] overflow-hidden backdrop-blur-sm">
      <div className="px-5 py-3 border-b border-white/[0.04] bg-white/[0.015] flex items-center justify-between">
        <h3 className="text-[9px] font-black tracking-[0.12em] uppercase text-muted-foreground/35">{title}</h3>
        {action && <button onClick={action.onClick} className="text-[10px] text-primary font-bold hover:underline">{action.label}</button>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-muted-foreground/45 text-[10px] font-medium">{label}</span>
      <span className="font-bold text-xs">{value}</span>
    </div>
  );
}

function QuickEdit({ project, token, onUpdate }: { project: any; token: string | null; onUpdate: () => void }) {
  const [status, setStatus] = useState(project.status);
  const [progress, setProgress] = useState(project.progress);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await authFetch(`/api/admin/projects/${project.id}`, token, {
        method: "PUT",
        body: JSON.stringify({
          title: project.title, type: project.type, status, description: project.description,
          techStack: project.tech_stack, budget: project.budget, deadline: project.deadline,
          priority: project.priority, progress: Number(progress), notes: project.notes,
          liveUrl: project.live_url, repoUrl: project.repo_url,
        }),
      });
      onUpdate();
    } catch { } finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mb-2 block font-black">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="w-full h-9 px-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-foreground focus:outline-none focus:border-primary/30">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mb-2 block font-black">Progress: <span className="text-primary">{progress}%</span></label>
        <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))}
          className="w-full accent-purple-500 mt-2.5" />
      </div>
      <div className="col-span-2">
        <Button onClick={save} disabled={saving} size="sm"
          className="bg-gradient-to-r from-primary to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-primary/20">
          {saving ? "Saving..." : <><CheckCircle2 size={11} className="mr-1.5" />Save Changes</>}
        </Button>
      </div>
    </div>
  );
}

function ProjectForm({ users, initial, token, onSuccess }: { users: any[]; initial: any; token: string | null; onSuccess: () => void }) {
  const [form, setForm] = useState({
    clientId: initial?.client_id || "",
    title: initial?.title || "",
    type: initial?.type || "Web App",
    status: initial?.status || "pending",
    description: initial?.description || "",
    techStack: (initial?.tech_stack || []).join(", "),
    budget: initial?.budget || "",
    deadline: initial?.deadline ? new Date(initial.deadline).toISOString().split("T")[0] : "",
    priority: initial?.priority || "normal",
    progress: initial?.progress || 0,
    notes: initial?.notes || "",
    liveUrl: initial?.live_url || "",
    repoUrl: initial?.repo_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = {
        clientId: Number(form.clientId), title: form.title, type: form.type,
        status: form.status, description: form.description,
        techStack: form.techStack.split(",").map((t: string) => t.trim()).filter(Boolean),
        budget: form.budget, deadline: form.deadline || null,
        priority: form.priority, progress: Number(form.progress),
        notes: form.notes, liveUrl: form.liveUrl, repoUrl: form.repoUrl,
      };
      if (initial) {
        await authFetch(`/api/admin/projects/${initial.id}`, token, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await authFetch("/api/admin/projects", token, { method: "POST", body: JSON.stringify(payload) });
      }
      onSuccess();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mb-1.5 block font-black">{label}</label>
      {children}
    </div>
  );

  const selectCls = "w-full h-10 px-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-foreground focus:outline-none focus:border-primary/30";
  const inputCls = "bg-white/[0.02] border-white/[0.06] focus:border-primary/30 h-10 text-xs";

  return (
    <form onSubmit={handleSubmit} className="px-8 py-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-xs mb-5">
          <AlertCircle size={12} />{error}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-5">
        <F label="Client *">
          <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required className={selectCls}>
            <option value="">Select client...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
        </F>
        <F label="Project Title *">
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
            placeholder="e.g. Nexus Dashboard" className={inputCls} />
        </F>
        <F label="Type">
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={selectCls}>
            {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </F>
        <F label="Status">
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectCls}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
          </select>
        </F>
        <F label="Priority">
          <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={selectCls}>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </F>
        <F label={`Progress: ${form.progress}%`}>
          <div className="flex items-center gap-3 mt-3">
            <input type="range" min={0} max={100} value={form.progress}
              onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} className="flex-1 accent-purple-500" />
            <span className="text-xs font-black text-primary w-10 text-right">{form.progress}%</span>
          </div>
        </F>
        <F label="Budget">
          <Input value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
            placeholder="e.g. $800" className={inputCls} />
        </F>
        <F label="Deadline">
          <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={inputCls} />
        </F>
        <F label="Tech Stack (comma separated)">
          <Input value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))}
            placeholder="React, Node.js, PostgreSQL" className={inputCls} />
        </F>
        <F label="Live URL">
          <Input value={form.liveUrl} onChange={e => setForm(f => ({ ...f, liveUrl: e.target.value }))}
            placeholder="https://..." className={inputCls} />
        </F>
        <F label="Repo URL">
          <Input value={form.repoUrl} onChange={e => setForm(f => ({ ...f, repoUrl: e.target.value }))}
            placeholder="https://github.com/..." className={inputCls} />
        </F>
        <div className="md:col-span-2">
          <F label="Description">
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Project overview, goals, requirements..." rows={3}
              className="bg-white/[0.02] border-white/[0.06] focus:border-primary/30 resize-none text-xs" />
          </F>
        </div>
        <div className="md:col-span-2">
          <F label="Notes (visible to client)">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes visible to the client..." rows={2}
              className="bg-white/[0.02] border-white/[0.06] focus:border-primary/30 resize-none text-xs" />
          </F>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={saving}
            className="bg-gradient-to-r from-primary to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-primary/20">
            {saving ? "Saving..." : initial ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </div>
    </form>
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
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
