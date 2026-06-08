import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Eye, EyeOff, Zap, User, Mail, Lock, Building, Phone, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "login" | "register";

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", company: "", phone: "", adminSecret: "" });

  if (user) {
    setLocation(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(regForm);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(249,115,22,0.18),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: "rgba(249,115,22,0.15)" }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: "rgba(234,88,12,0.12)" }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />

      {/* Back to home */}
      <motion.a href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
        <span className="font-semibold text-primary">py</span><span>Kode</span>
      </motion.a>

      <motion.div className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

        {/* Card */}
        <div className="relative rounded-2xl p-[1px]"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.5), rgba(234,88,12,0.3), rgba(249,115,22,0.1))" }}>
          <div className="rounded-[15px] bg-[#181818]/98 backdrop-blur-xl overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Zap size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/60 tracking-widest uppercase">Client Portal</p>
                  <h1 className="text-sm font-bold text-foreground">pyKode</h1>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6">
                {(["login", "register"] as Tab[]).map((t) => (
                  <button key={t} onClick={() => { setTab(t); setError(""); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${tab === t ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]" : "text-muted-foreground hover:text-foreground"}`}>
                    {t === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-xl font-bold mb-1">Welcome back</h2>
                    <p className="text-sm text-muted-foreground">Sign in to track your project progress.</p>
                  </motion.div>
                ) : (
                  <motion.div key="register" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-xl font-bold mb-1">Create your account</h2>
                    <p className="text-sm text-muted-foreground">Get access to your client dashboard.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-5">
                    <AlertCircle size={14} className="shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.form key="lform" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleLogin} className="space-y-4">
                    <Field label="Email" icon={<Mail size={14} />}>
                      <Input type="email" placeholder="your@email.com" value={loginForm.email}
                        onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 h-11" required />
                    </Field>
                    <Field label="Password" icon={<Lock size={14} />}
                      right={<button type="button" onClick={() => setShowPass(!showPass)} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>}>
                      <Input type={showPass ? "text" : "password"} placeholder="••••••••" value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 pr-9 h-11" required />
                    </Field>
                    <Button type="submit" disabled={loading}
                      className="w-full h-11 mt-2 font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] transition-all">
                      {loading ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>Signing in...</motion.span>
                        : <><ArrowRight className="mr-2 h-4 w-4" />Sign In</>}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form key="rform" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRegister} className="space-y-3">
                    <Field label="Full Name" icon={<User size={14} />}>
                      <Input placeholder="John Smith" value={regForm.name}
                        onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 h-10" required />
                    </Field>
                    <Field label="Email" icon={<Mail size={14} />}>
                      <Input type="email" placeholder="your@email.com" value={regForm.email}
                        onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 h-10" required />
                    </Field>
                    <Field label="Password (min 8 chars)" icon={<Lock size={14} />}
                      right={<button type="button" onClick={() => setShowPass(!showPass)} className="text-muted-foreground/50 hover:text-muted-foreground">{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>}>
                      <Input type={showPass ? "text" : "password"} placeholder="••••••••" value={regForm.password}
                        onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 pr-9 h-10" required />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Company" icon={<Building size={14} />}>
                        <Input placeholder="Optional" value={regForm.company}
                          onChange={e => setRegForm(f => ({ ...f, company: e.target.value }))}
                          className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 h-10" />
                      </Field>
                      <Field label="Phone" icon={<Phone size={14} />}>
                        <Input placeholder="Optional" value={regForm.phone}
                          onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                          className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 h-10" />
                      </Field>
                    </div>
                    <Field label="Admin Secret (optional)" icon={<ShieldCheck size={14} />}>
                      <Input placeholder="For admin access only" value={regForm.adminSecret}
                        onChange={e => setRegForm(f => ({ ...f, adminSecret: e.target.value }))}
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 h-10" />
                    </Field>
                    <Button type="submit" disabled={loading}
                      className="w-full h-11 mt-1 font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] transition-all">
                      {loading ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>Creating account...</motion.span>
                        : <><ArrowRight className="mr-2 h-4 w-4" />Create Account</>}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, icon, right, children }: { label: string; icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">{icon}</span>
        {children}
        {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
      </div>
    </div>
  );
}
