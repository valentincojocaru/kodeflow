import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Eye, EyeOff, Zap, User, Mail, Lock, Building, Phone, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, RotateCcw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "login" | "register";
type ForgotStep = "email" | "code" | "done";

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", company: "", phone: "", adminSecret: "" });

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  if (user) {
    setLocation(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginForm.email.trim() || !loginForm.password) {
      setError("Email și parola sunt obligatorii."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email.trim())) {
      setError("Introdu o adresă de email validă."); return;
    }
    setLoading(true);
    try {
      await login(loginForm.email.trim(), loginForm.password);
    } catch (err: any) {
      setError(err.message || "Autentificare eșuată. Verifică datele.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!regForm.name.trim()) { setError("Numele este obligatoriu."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())) {
      setError("Introdu o adresă de email validă."); return;
    }
    if (regForm.password.length < 8) { setError("Parola trebuie să aibă minim 8 caractere."); return; }
    setLoading(true);
    try {
      await register({ ...regForm, email: regForm.email.trim() });
    } catch (err: any) {
      setError(err.message || "Înregistrare eșuată. Încearcă din nou.");
    } finally { setLoading(false); }
  };

  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError("Introdu o adresă de email validă."); return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setForgotStep("code");
    } catch (err: any) {
      setForgotError(err.message || "Eroare la trimiterea codului.");
    } finally { setForgotLoading(false); }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (forgotCode.trim().length !== 6) { setForgotError("Codul trebuie să aibă 6 cifre."); return; }
    if (newPassword.length < 8) { setForgotError("Parola trebuie să aibă minim 8 caractere."); return; }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), code: forgotCode.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setForgotStep("done");
    } catch (err: any) {
      setForgotError(err.message || "Eroare la resetarea parolei.");
    } finally { setForgotLoading(false); }
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotCode("");
    setNewPassword("");
    setForgotError("");
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

        {/* ── Forgot Password Overlay ────────────────────────────────────── */}
        <AnimatePresence>
          {forgotOpen && (
            <motion.div
              key="forgot-overlay"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-20 rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.5), rgba(234,88,12,0.3), rgba(249,115,22,0.1))" }}
            >
              <div className="rounded-[15px] bg-[#181818]/98 backdrop-blur-xl h-full flex flex-col">
                <div className="px-8 pt-8 pb-6 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                      <KeyRound size={15} className="text-orange-400" />
                    </div>
                    <h2 className="text-base font-bold text-white">Resetare parolă</h2>
                  </div>
                  <p className="text-xs text-muted-foreground pl-11">
                    {forgotStep === "email" && "Introdu emailul contului tău."}
                    {forgotStep === "code" && `Codul a fost trimis la ${forgotEmail}`}
                    {forgotStep === "done" && "Parola a fost resetată cu succes!"}
                  </p>
                </div>

                <div className="px-8 py-6 flex-1 flex flex-col">
                  {/* Error */}
                  <AnimatePresence>
                    {forgotError && (
                      <motion.div key="fe" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-4">
                        <AlertCircle size={13} className="shrink-0" /> {forgotError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {/* Step 1: email */}
                    {forgotStep === "email" && (
                      <motion.form key="fs1" noValidate initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        onSubmit={handleForgotSend} className="space-y-4 flex flex-col flex-1">
                        <Field label="Email" icon={<Mail size={14} />}>
                          <Input type="email" placeholder="your@email.com" value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 h-11" />
                        </Field>
                        <Button type="submit" disabled={forgotLoading}
                          className="w-full h-11 font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] transition-all">
                          {forgotLoading
                            ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>Se trimite...</motion.span>
                            : <><ArrowRight className="mr-2 h-4 w-4" />Trimite codul</>}
                        </Button>
                        <div className="flex-1" />
                        <button type="button" onClick={closeForgot}
                          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors text-center">
                          ← Înapoi la login
                        </button>
                      </motion.form>
                    )}

                    {/* Step 2: code + new password */}
                    {forgotStep === "code" && (
                      <motion.form key="fs2" noValidate initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        onSubmit={handleForgotReset} className="space-y-4 flex flex-col flex-1">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Cod din email (6 cifre)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            value={forgotCode}
                            onChange={e => setForgotCode(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 h-14 text-center text-3xl font-black tracking-[0.3em] text-orange-400 focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-white/10 placeholder:text-lg placeholder:tracking-normal"
                          />
                        </div>
                        <Field label="Parola nouă (min 8 caractere)" icon={<Lock size={14} />}
                          right={
                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                              {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          }>
                          <Input type={showNewPass ? "text" : "password"} placeholder="••••••••" value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 pr-9 h-11" />
                        </Field>
                        <Button type="submit" disabled={forgotLoading}
                          className="w-full h-11 font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] transition-all">
                          {forgotLoading
                            ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>Se salvează...</motion.span>
                            : <><KeyRound className="mr-2 h-4 w-4" />Resetează parola</>}
                        </Button>
                        <div className="flex-1" />
                        <button type="button" onClick={() => { setForgotStep("email"); setForgotError(""); }}
                          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50 hover:text-orange-400 transition-colors">
                          <RotateCcw size={11} /> Retrimite codul
                        </button>
                      </motion.form>
                    )}

                    {/* Step 3: done */}
                    {forgotStep === "done" && (
                      <motion.div key="fs3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center flex-1 text-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center">
                          <CheckCircle2 size={28} className="text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-base mb-1">Parola resetată!</h3>
                          <p className="text-muted-foreground text-sm">Acum te poți autentifica cu noua parolă.</p>
                        </div>
                        <Button onClick={closeForgot}
                          className="w-full h-11 font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                          <ArrowRight className="mr-2 h-4 w-4" /> Mergi la login
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Card ──────────────────────────────────────────────────── */}
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
              <AnimatePresence>
                {error && (
                  <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-5">
                    <AlertCircle size={14} className="shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.form key="lform" noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleLogin} className="space-y-4">
                    <Field label="Email" icon={<Mail size={14} />}>
                      <Input type="email" placeholder="your@email.com" value={loginForm.email}
                        onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 h-11" required />
                    </Field>
                    <div>
                      <Field label="Password" icon={<Lock size={14} />}
                        right={<button type="button" onClick={() => setShowPass(!showPass)} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>}>
                        <Input type={showPass ? "text" : "password"} placeholder="••••••••" value={loginForm.password}
                          onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                          className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 pl-9 pr-9 h-11" required />
                      </Field>
                      <div className="flex justify-end mt-2">
                        <button type="button"
                          onClick={() => { setForgotEmail(loginForm.email); setForgotOpen(true); }}
                          className="text-xs text-muted-foreground/50 hover:text-orange-400 transition-colors">
                          Ai uitat parola?
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading}
                      className="w-full h-11 mt-2 font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] transition-all">
                      {loading ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>Signing in...</motion.span>
                        : <><ArrowRight className="mr-2 h-4 w-4" />Sign In</>}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form key="rform" noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRegister} className="space-y-3">
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
