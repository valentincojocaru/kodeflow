import { useState, useRef, useEffect, type ReactNode } from "react";
import AICore from "@/components/AICore";
import PremiumFX from "@/components/PremiumFX";

/* ====================================================================
   Kodeflow — premium glassmorphism marketing home (single-file port).
   Pairs with: src/styles/kodeflow-theme.css  +  src/components/AICore.tsx
   Wire it into your router, e.g. <Route path="/"><Home/></Route> (wouter).
   ==================================================================== */

// ── scroll-reveal hook ───────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    const els = Array.from(document.querySelectorAll(".kf-root .reveal"));
    els.forEach((el) => obs.observe(el));
    const revealVisible = () => els.forEach((el) => { if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add("in"); });
    window.addEventListener("scroll", revealVisible, { passive: true });
    const timers = [600, 1700, 2600].map((t) => setTimeout(revealVisible, t));
    return () => { obs.disconnect(); window.removeEventListener("scroll", revealVisible); timers.forEach(clearTimeout); };
  }, []);
}

function SectionHead({ kicker, title, sub, center }: { kicker: string; title: ReactNode; sub?: string; center?: boolean }) {
  return (
    <div className="reveal" style={{ marginBottom: 56, textAlign: center ? "center" : "left", maxWidth: center ? 640 : "none", marginInline: center ? "auto" : 0 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>{kicker}</div>
      <h2 className="serif text-balance" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 1.04, letterSpacing: "-0.015em" }}>{title}</h2>
      {sub && <p className="text-pretty" style={{ color: "var(--ink-mute)", fontSize: 17, marginTop: 16, maxWidth: 520, marginInline: center ? "auto" : 0, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

// ── NAVBAR ───────────────────────────────────────────────────────────
function Navbar({ onHire }: { onHire: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["About", "Services", "Process", "Work", "Pricing"];
  const ids = ["about", "services", "process", "work", "pricing"];
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
      <div style={{ margin: scrolled ? "12px auto" : "20px auto", maxWidth: "var(--maxw)", padding: scrolled ? "0 10px" : "0 24px", transition: "all .4s ease" }}>
        <div className="glass" style={{ borderRadius: 999, height: 62, padding: "0 14px 0 22px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: scrolled ? undefined : "none", background: scrolled ? "var(--glass-bg-2)" : "rgba(255,255,255,0.02)", transition: "background .4s ease" }}>
          <a href="#top" style={{ fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em", color: "var(--ink)", textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "linear-gradient(var(--amber),var(--orange))", boxShadow: "0 0 14px rgba(255,122,24,0.9)" }} />
            py<span className="grad-orange">Kode</span>
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: 30 }} className="nav-links">
            {links.map((l, i) => (
              <a key={l} href={"#" + ids[i]} style={{ fontSize: 14, color: "var(--ink-mute)", textDecoration: "none", fontWeight: 500, transition: "color .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-mute)")}>{l}</a>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="/login" className="portal-link" style={{ fontSize: 13, color: "var(--ink-soft)", textDecoration: "none", padding: "9px 15px", borderRadius: 999, border: "1px solid var(--glass-brd-soft)", display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span className="mono" style={{ fontSize: 11 }}>↗</span> Client Portal
            </a>
            <button onClick={onHire} className="btn-primary nav-cta" style={{ padding: "11px 20px", fontSize: 14 }}>Start a Project</button>
            <button onClick={() => setOpen((o) => !o)} className="nav-burger" aria-label="Menu" style={{ display: "none", width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", cursor: "pointer", background: "var(--glass-bg)", border: "1px solid var(--glass-brd-soft)", color: "var(--ink)" }}>
              <div style={{ position: "relative", width: 18, height: 12 }}>
                <span style={{ position: "absolute", left: 0, top: open ? 5 : 0, width: 18, height: 2, borderRadius: 2, background: "currentColor", transition: "all .3s", transform: open ? "rotate(45deg)" : "none" }} />
                <span style={{ position: "absolute", left: 0, top: 5, width: 18, height: 2, borderRadius: 2, background: "currentColor", transition: "opacity .2s", opacity: open ? 0 : 1 }} />
                <span style={{ position: "absolute", left: 0, top: open ? 5 : 10, width: 18, height: 2, borderRadius: 2, background: "currentColor", transition: "all .3s", transform: open ? "rotate(-45deg)" : "none" }} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="nav-mobile" style={{ display: "none", overflow: "hidden", maxHeight: open ? 460 : 0, opacity: open ? 1 : 0, transition: "max-height .42s cubic-bezier(.16,1,.3,1), opacity .3s, margin .3s", marginTop: open ? 10 : 0 }}>
          <div className="glass-2" style={{ borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", gap: 4 }}>
            {links.map((l, i) => (
              <a key={l} href={"#" + ids[i]} onClick={() => setOpen(false)} style={{ fontSize: 16, color: "var(--ink-soft)", textDecoration: "none", fontWeight: 500, padding: "13px 16px", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {l} <span className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>0{i + 1}</span>
              </a>
            ))}
            <div style={{ height: 1, margin: "6px 8px", background: "var(--glass-brd-soft)" }} />
            <a href="/login" onClick={() => setOpen(false)} style={{ fontSize: 15, color: "var(--ink-soft)", textDecoration: "none", fontWeight: 500, padding: "13px 16px", borderRadius: 13, display: "inline-flex", alignItems: "center", gap: 9 }}>
              <span className="mono" style={{ fontSize: 12 }}>↗</span> Client Portal
            </a>
            <button onClick={() => { setOpen(false); onHire(); }} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Start a Project →</button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────
function Hero({ onHire }: { onHire: () => void }) {
  return (
    <section id="top" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 120, paddingBottom: 60 }}>
      <div className="container" style={{ width: "100%" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 40, alignItems: "center" }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="pill reveal" style={{ marginBottom: 30 }}>
              <span className="dot-live" /><span style={{ color: "var(--ink-soft)" }}>Available for new projects · 2026</span>
            </div>
            <h1 className="serif text-balance" style={{ fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 0.98, letterSpacing: "-0.02em", marginBottom: 26 }}>
              <span style={{ display: "block", overflow: "hidden" }}><span className="hero-line" style={{ display: "block" }}>Web apps,</span></span>
              <span style={{ display: "block", overflow: "hidden" }}><span className="hero-line hl2" style={{ display: "block" }}>supercharged</span></span>
              <span style={{ display: "block", overflow: "hidden" }}><span className="hero-line hl3 grad-orange serif-i" style={{ display: "block", paddingBottom: "0.08em" }}>by AI agents.</span></span>
            </h1>
            <p className="text-pretty reveal" style={{ fontSize: 18, color: "var(--ink-soft)", maxWidth: 460, lineHeight: 1.65, marginBottom: 38, fontWeight: 300 }}>
              I'm Kode — an independent full-stack engineer. I build premium, fast and scalable web products, using AI agents to ship 10× faster than a traditional agency.
            </p>
            <div className="reveal" style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={onHire} className="btn-primary">Start a Project <span style={{ fontSize: 17 }}>→</span></button>
              <a href="#work" className="btn-ghost">View My Work</a>
            </div>
            <div className="reveal" style={{ marginTop: 46, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {[
                { v: "10×", l: "faster with AI" },
                { v: "24h", l: "reply time" },
                { v: "100%", l: "you own the code" },
              ].map((s, i) => (
                <div key={i} className="glass" style={{ borderRadius: 14, padding: "10px 16px" }}>
                  <span className="serif grad-orange" style={{ fontSize: 22, lineHeight: 1, marginRight: 8 }}>{s.v}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-core" style={{ position: "relative", height: "min(74vh, 620px)" }}>
            <div style={{ position: "absolute", inset: "-6%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,24,0.16), transparent 62%)", filter: "blur(20px)" }} />
            <AICore />
            <div className="glass-2 hud-chip" style={{ position: "absolute", top: "12%", left: "2%", borderRadius: 16, padding: "12px 16px", animation: "kf-floatY 6s ease-in-out infinite" }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.1em" }}>AGENT · BUILD</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>18 components <span className="grad-orange">generated</span></div>
            </div>
            <div className="glass-2 hud-chip" style={{ position: "absolute", bottom: "14%", right: "0%", borderRadius: 16, padding: "12px 16px", animation: "kf-floatY 7s ease-in-out infinite 1s" }}>
              <div className="mono" style={{ fontSize: 10, color: "#9f8fff", letterSpacing: "0.1em" }}>● LIVE · DEPLOY</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>61ms · 99.9% uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── TECH MARQUEE ─────────────────────────────────────────────────────
const TECHS = ["React", "TypeScript", "Node.js", "Python", "Next.js", "PostgreSQL", "Tailwind", "OpenAI", "Claude", "AWS", "Vite", "Redis", "Stripe", "Docker"];
function TechMarquee() {
  return (
    <div style={{ position: "relative", overflow: "hidden", padding: "26px 0", borderTop: "1px solid var(--glass-brd-soft)", borderBottom: "1px solid var(--glass-brd-soft)", background: "rgba(255,255,255,0.012)" }}>
      <div className="marquee-track" style={{ display: "flex", gap: 56, whiteSpace: "nowrap", width: "max-content" }}>
        {[0, 1].map((k) => (
          <div key={k} style={{ display: "flex", gap: 56 }}>
            {TECHS.map((t, i) => (
              <span key={i} className="mono" style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-mute)", display: "inline-flex", alignItems: "center", gap: 56 }}>
                {t}<span style={{ color: "var(--orange)", opacity: 0.5 }}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: 120, background: "linear-gradient(90deg, var(--bg-0), transparent)" }} />
      <div style={{ position: "absolute", inset: "0 0 0 auto", width: 120, background: "linear-gradient(270deg, var(--bg-0), transparent)" }} />
    </div>
  );
}

// ── STATS ────────────────────────────────────────────────────────────
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        let s: number | null = null; const dur = 1600;
        const step = (t: number) => { if (s === null) s = t; const p = Math.min((t - s) / dur, 1); setN(Math.floor((1 - Math.pow(2, -10 * p)) * to)); if (p < 1) requestAnimationFrame(step); else setN(to); };
        requestAnimationFrame(step); obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

function Stats() {
  const stats = [
    { n: 10, s: "×", l: "Faster with AI" },
    { n: 24, s: "h", l: "Reply time" },
    { n: 100, s: "%", l: "You own the code" },
    { n: 99, s: ".9%", l: "Uptime target" },
  ];
  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container">
        <div className="glass-2 reveal stat-row" style={{ borderRadius: 28, padding: "44px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-cell" style={{ textAlign: "center", borderLeft: i ? "1px solid var(--glass-brd-soft)" : "none" }}>
              <div className="serif grad-orange" style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", lineHeight: 1, marginBottom: 8 }}><Counter to={s.n} suffix={s.s} /></div>
              <div style={{ fontSize: 13, color: "var(--ink-mute)", letterSpacing: "0.04em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ABOUT + LIVE TERMINAL ────────────────────────────────────────────
const TERMINAL = [
  { t: "cmd", x: '$ agent init --client "Atlas" --stack next' },
  { t: "ok", x: "✓ Environment configured in 0.3s" },
  { t: "ok", x: "✓ TypeScript strict · 0 errors" },
  { t: "blank", x: "" },
  { t: "cmd", x: "$ agent build --components --smart" },
  { t: "ok", x: "✓ 18 components generated & tested" },
  { t: "ok", x: "✓ Bundle 87kb gzip · −68% vs. avg" },
  { t: "blank", x: "" },
  { t: "cmd", x: "$ agent deploy --regions global" },
  { t: "ok", x: "✓ CDN live · 23 edge regions" },
  { t: "win", x: "🚀 LIVE → atlas.app · 61ms · 99.9%" },
];
function LiveTerminal() {
  const [vis, setVis] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    let reset: ReturnType<typeof setTimeout>;
    const run = () => {
      setVis(0); timers.forEach(clearTimeout); timers = [];
      TERMINAL.forEach((_, i) => timers.push(setTimeout(() => setVis(i + 1), 380 * i + 300)));
      reset = setTimeout(run, 380 * TERMINAL.length + 3200);
    };
    const obs = new IntersectionObserver((e) => { if (e[0].isIntersecting) run(); else { timers.forEach(clearTimeout); clearTimeout(reset); } }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); timers.forEach(clearTimeout); clearTimeout(reset); };
  }, []);
  const color = (t: string) => t === "cmd" ? "var(--orange-bright)" : t === "ok" ? "#7fe0a0" : t === "win" ? "var(--amber)" : "transparent";
  return (
    <div ref={ref} className="glass-2" style={{ borderRadius: 20, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", borderBottom: "1px solid var(--glass-brd-soft)", background: "rgba(0,0,0,0.25)" }}>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
        <span className="mono" style={{ marginLeft: 10, fontSize: 11, color: "var(--ink-faint)" }}>pykode-agent — zsh</span>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "#5fd07a", display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5fd07a", boxShadow: "0 0 8px #5fd07a" }} />LIVE</span>
      </div>
      <div className="mono" style={{ padding: 20, fontSize: 12.5, lineHeight: 1.85, minHeight: 280 }}>
        {TERMINAL.slice(0, vis).map((l, i) => (
          <div key={i} style={{ color: color(l.t), fontWeight: l.t === "win" ? 600 : 400, animation: "kf-lineIn .3s ease" }}>{l.x || "\u00a0"}</div>
        ))}
        <span style={{ display: "inline-block", width: 8, height: 15, background: "var(--orange)", verticalAlign: "middle", animation: "kf-blink 1s step-end infinite" }} />
      </div>
    </div>
  );
}

function About() {
  return (
    <section id="about" style={{ padding: "100px 0" }}>
      <div className="container">
        <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div className="reveal">
            <div className="eyebrow" style={{ marginBottom: 18 }}>01 — About</div>
            <h2 className="serif text-balance" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 1.04, marginBottom: 26 }}>
              One engineer. <span className="serif-i grad-orange">Zero bureaucracy.</span>
            </h2>
            <p className="text-pretty" style={{ color: "var(--ink-soft)", fontSize: 17, lineHeight: 1.7, marginBottom: 18 }}>
              When you hire me, you don't get an account manager or a junior learning on your dime. You get me, directly — from architecture all the way to deploy.
            </p>
            <p className="text-pretty" style={{ color: "var(--ink-mute)", fontSize: 16, lineHeight: 1.7, marginBottom: 30 }}>
              I take complex requirements and turn them into intuitive, blazing-fast apps. AI agents handle the repetitive work; I keep control of architecture, quality and the details.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Direct communication", "You own the code", "Shipped in days, not months"].map((t) => (
                <span key={t} className="pill" style={{ fontSize: 13 }}><span style={{ color: "var(--orange)" }}>✓</span> {t}</span>
              ))}
            </div>
          </div>
          <div className="reveal"><LiveTerminal /></div>
        </div>
      </div>
    </section>
  );
}

// ── PROCESS ──────────────────────────────────────────────────────────
function Process() {
  const steps = [
    { n: "01", t: "Discovery", d: "We map the vision, goals and constraints. I ask the right questions and confirm scope before a single line of code.", time: "~45 min" },
    { n: "02", t: "Architecture", d: "Full technical blueprint — stack, DB schema, API contracts, auth model and deploy strategy, delivered as a spec.", time: "1–2 days" },
    { n: "03", t: "AI-agent build", d: "Focused sprints with daily updates and a live preview from day 1. AI agents speed up iteration without cutting quality.", time: "1–4 weeks" },
    { n: "04", t: "Launch & handover", d: "Zero-downtime deploy, full code walkthrough and documentation. Post-launch bug-fixing included.", time: "1 day" },
  ];
  return (
    <section id="process" style={{ padding: "100px 0" }}>
      <div className="container">
        <SectionHead kicker="02 — Process" title={<span>How we work <span className="serif-i grad-orange">together</span></span>} sub="A simple process, designed to ship fast without cutting corners." center />
        <div className="proc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {steps.map((s, i) => (
            <div key={i} className="glass sheen reveal proc-card" style={{ borderRadius: 22, padding: 26, transition: "transform .35s, border-color .35s", transitionDelay: i * 0.06 + "s" }}>
              <div className="serif" style={{ fontSize: 52, lineHeight: 1, color: "rgba(255,255,255,0.07)", marginBottom: 18 }}>{s.n}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <h3 style={{ fontSize: 17, fontWeight: 600 }}>{s.t}</h3>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", border: "1px solid var(--glass-brd-soft)", padding: "2px 7px", borderRadius: 999 }}>{s.time}</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SERVICES ─────────────────────────────────────────────────────────
function Services() {
  const items = [
    { t: "Web Applications", d: "Complex SPAs, dashboards and portals in React + modern tooling.", ic: "M3 5h18M3 12h18M3 19h12" },
    { t: "SaaS Products", d: "End-to-end architecture, multi-tenant, authentication and payments.", ic: "M13 2L3 14h7l-1 8 10-12h-7z" },
    { t: "AI Integration", d: "Agents, RAG and intelligent features on OpenAI and Claude.", ic: "M12 2a5 5 0 015 5v1a5 5 0 01-10 0V7a5 5 0 015-5zM5 21v-2a7 7 0 0114 0v2" },
    { t: "Landing Pages", d: "High-converting marketing pages, interactive and optimized.", ic: "M4 4h16v6H4zM4 14h10v6H4z" },
    { t: "DevOps & Infra", d: "AWS / Vercel, Docker containers, CI/CD and autoscaling.", ic: "M5 12h14M12 5v14" },
    { t: "API Development", d: "Robust REST and GraphQL APIs with auth, rate-limiting and monitoring.", ic: "M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12" },
    { t: "E-Commerce", d: "Headless storefronts, Stripe and conversion-optimized checkout.", ic: "M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20a1 1 0 100 2 1 1 0 000-2zM18 20a1 1 0 100 2 1 1 0 000-2z" },
    { t: "Custom Tooling", d: "Internal dashboards, admin panels and tools built for your workflow.", ic: "M14 7l-9 9-2 5 5-2 9-9M14 7l3-3 4 4-3 3M14 7l4 4" },
  ];
  return (
    <section id="services" style={{ padding: "100px 0" }}>
      <div className="container">
        <SectionHead kicker="03 — Services" title={<span>What I can build <span className="serif-i grad-orange">for you</span></span>} />
        <div className="serv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {items.map((s, i) => (
            <div key={i} className="glass sheen reveal serv-card" style={{ borderRadius: 20, padding: 24, transition: "transform .3s, border-color .3s" }}>
              <div className="glass-2" style={{ width: 46, height: 46, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange-bright)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={s.ic} /></svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ fontSize: 13.5, color: "var(--ink-mute)", lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── WORK ─────────────────────────────────────────────────────────────
import workDashboard from "@/assets/work/work-dashboard.png";
import workEcommerce from "@/assets/work/work-ecommerce.png";
import workRestaurant from "@/assets/work/work-restaurant.png";

function Work() {
  const projects = [
    { n: "01", t: "Fintech SaaS Dashboard", tag: "SaaS Platform", img: workDashboard, kind: "Example concept", d: "The kind of product I build: a real-time analytics platform with multi-tenant architecture, role-based access, Stripe billing and live WebSocket streaming.", tech: ["React", "Node", "Postgres", "Redis"], metrics: [{ v: "Realtime", l: "data sync" }, { v: "Multi", l: "tenant" }, { v: "Stripe", l: "billing" }] },
    { n: "02", t: "E-Commerce Storefront", tag: "Headless Commerce", img: workEcommerce, kind: "Example concept", d: "A headless storefront concept — smart filtering, one-click checkout, automated cart recovery and a fully custom CMS, built to convert and scale.", tech: ["Next.js", "Stripe", "Sanity"], metrics: [{ v: "1-click", l: "checkout" }, { v: "Headless", l: "CMS" }, { v: "<1s", l: "load target" }] },
    { n: "03", t: "Restaurant & Bookings", tag: "Booking System", img: workRestaurant, kind: "Example concept", d: "A booking experience concept — live table reservations, a dynamic menu and a full admin dashboard, wrapped in an elegant, fast interface.", tech: ["React", "Node", "Postgres"], metrics: [{ v: "Live", l: "reservations" }, { v: "Admin", l: "dashboard" }, { v: "24/7", l: "self-serve" }] },
  ];
  return (
    <section id="work" style={{ padding: "100px 0" }}>
      <div className="container">
        <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>04 — What I Can Build</div>
            <h2 className="serif text-balance" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 1.04 }}>Examples of what's <span className="serif-i grad-orange">possible</span></h2>
          </div>
          <a href="https://github.com/valentincojocaru" className="btn-ghost" style={{ fontSize: 14 }}>View GitHub →</a>
        </div>
        <p className="reveal text-pretty" style={{ fontSize: 15, color: "var(--ink-faint)", maxWidth: 520, marginBottom: 64 }}>
          Concept builds that show the kind of products, polish and engineering I bring to a project — not client work.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 110 }}>
          {projects.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={i} className="reveal work-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
                <div className="work-visual" style={{ order: flip ? 2 : 1, position: "relative" }}>
                  <div style={{ position: "absolute", inset: "8% 6%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,24,0.18), transparent 65%)", filter: "blur(40px)", pointerEvents: "none" }} />
                  <div className="glass-2 work-frame" style={{ position: "relative", borderRadius: 18, overflow: "hidden", transition: "transform .5s cubic-bezier(.16,1,.3,1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 38, borderBottom: "1px solid var(--glass-brd-soft)", background: "rgba(0,0,0,0.25)" }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
                      <span className="mono" style={{ margin: "0 auto", fontSize: 11, color: "var(--ink-faint)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3ad17a" }} />preview
                      </span>
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <img src={p.img} alt={p.t} loading="lazy" className="work-shot" style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "top", transition: "transform 1.2s cubic-bezier(.16,1,.3,1)" }} />
                    </div>
                  </div>
                </div>

                <div style={{ order: flip ? 1 : 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <span className="serif" style={{ fontSize: 56, lineHeight: 1, color: "rgba(255,255,255,0.10)", flexShrink: 0 }}>{p.n}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--orange-bright)", marginBottom: 5, whiteSpace: "nowrap" }}>{p.tag}</div>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--glass-brd-soft)" }}>{p.kind}</span>
                    </div>
                  </div>
                  <h3 className="serif text-balance" style={{ fontSize: "clamp(1.8rem, 2.6vw, 2.5rem)", lineHeight: 1.08, marginBottom: 16 }}>{p.t}</h3>
                  <p className="text-pretty" style={{ fontSize: 16, color: "var(--ink-mute)", lineHeight: 1.7, marginBottom: 28, maxWidth: 460 }}>{p.d}</p>
                  <div style={{ display: "flex", gap: 28, marginBottom: 28, flexWrap: "wrap" }}>
                    {p.metrics.map((m, j) => (
                      <div key={j}>
                        <div className="serif grad-orange" style={{ fontSize: 26, lineHeight: 1 }}>{m.v}</div>
                        <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)", marginTop: 5 }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      {p.tech.map((t) => <span key={t} className="mono" style={{ fontSize: 10.5, color: "var(--ink-soft)", border: "1px solid var(--glass-brd-soft)", padding: "4px 10px", borderRadius: 8 }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── PRICING ──────────────────────────────────────────────────────────
function Pricing({ onHire }: { onHire: () => void }) {
  const plans = [
    { name: "Landing", price: "€1.5k", tag: "From", d: "A premium page that converts.", feats: ["1–3 custom sections", "Animations & interactions", "100% responsive & SEO", "Delivered in 5–7 days"], hot: false },
    { name: "Web App", price: "€5k", tag: "From", d: "Your product, built right.", feats: ["Full-stack architecture", "Auth, DB & payments", "Admin panel", "Deploy + 30 days support"], hot: true },
    { name: "Retainer", price: "€2k", tag: "/mo", d: "A dedicated technical partner.", feats: ["Ongoing development", "Priority delivery", "Maintenance & monitoring", "Weekly call"], hot: false },
  ];
  return (
    <section id="pricing" style={{ padding: "100px 0" }}>
      <div className="container">
        <SectionHead kicker="05 — Pricing" title={<span>Transparent <span className="serif-i grad-orange">pricing</span></span>} sub="No surprises. You pay for outcomes, not meetings." center />
        <div className="price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, alignItems: "stretch" }}>
          {plans.map((p, i) => (
            <div key={i} className={"reveal " + (p.hot ? "glass-2" : "glass")} style={{ borderRadius: 24, padding: 32, position: "relative", border: p.hot ? "1px solid rgba(255,122,24,0.45)" : undefined, boxShadow: p.hot ? "0 24px 80px -24px rgba(255,122,24,0.4)" : undefined, transform: p.hot ? "scale(1.03)" : "none" }}>
              {p.hot && <span className="mono" style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, background: "linear-gradient(100deg,var(--amber),var(--orange))", color: "#1a0d02", fontWeight: 600 }}>Most popular</span>}
              <div style={{ fontSize: 14, color: "var(--ink-mute)", marginBottom: 10 }}>{p.name}</div>
              <div style={{ marginBottom: 8 }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.08em", marginBottom: 2 }}>{p.tag}</div>
                <span className="serif grad-orange" style={{ fontSize: 50, lineHeight: 1, whiteSpace: "nowrap" }}>{p.price}</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-mute)", marginBottom: 24, minHeight: 38 }}>{p.d}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {p.feats.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 14, color: "var(--ink-soft)" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,122,24,0.14)", color: "var(--orange-bright)", fontSize: 11 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={onHire} className={p.hot ? "btn-primary" : "btn-ghost"} style={{ width: "100%", justifyContent: "center" }}>Get started</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────────────
function Testimonials() {
  const items = [
    { ic: "M13 2L3 14h7l-1 8 10-12h-7z", t: "AI-accelerated, senior-led", d: "Agents handle the repetitive work so I can focus on architecture, quality and the details that matter. You get senior-level output at startup speed." },
    { ic: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", t: "Direct, no bureaucracy", d: "You talk to the person building your product — not an account manager. Live preview from day one, so you always know where things stand." },
    { ic: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", t: "Clean code, you own it", d: "Documented, maintainable code that's yours from day one. No lock-in, no black boxes — built to scale long after launch." },
  ];
  return (
    <section style={{ padding: "100px 0" }}>
      <div className="container">
        <SectionHead kicker="06 — How I Work" title={<span>What you can <span className="serif-i grad-orange">expect</span></span>} center />
        <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {items.map((t, i) => (
            <div key={i} className="glass reveal" style={{ borderRadius: 22, padding: 32 }}>
              <div className="glass-2" style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange-bright)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={t.ic} /></svg>
              </div>
              <h3 className="serif" style={{ fontSize: 22, marginBottom: 12, lineHeight: 1.15 }}>{t.t}</h3>
              <p className="text-pretty" style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-mute)" }}>{t.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CONTACT ──────────────────────────────────────────────────────────
function Contact({ onHire }: { onHire: () => void }) {
  return (
    <section id="contact" style={{ padding: "60px 0 110px" }}>
      <div className="container">
        <div className="glass-2 reveal" style={{ borderRadius: 32, padding: "clamp(40px, 7vw, 80px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,122,24,0.22), transparent 60%)", filter: "blur(40px)", pointerEvents: "none" }} />
          <div className="pill" style={{ marginBottom: 26 }}><span className="dot-live" /><span style={{ color: "var(--ink-soft)" }}>1 spot open this month</span></div>
          <h2 className="serif text-balance" style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)", lineHeight: 1, marginBottom: 22 }}>
            Let's build <br /><span className="serif-i grad-orange">something remarkable.</span>
          </h2>
          <p className="text-pretty" style={{ fontSize: 18, color: "var(--ink-soft)", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Tell me about your idea. I reply within 24 hours — no endless forms.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onHire} className="btn-primary">Start a Project <span style={{ fontSize: 17 }}>→</span></button>
            <a href="mailto:hello@kodeflow.dev" className="btn-ghost">hello@kodeflow.dev</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--glass-brd-soft)", padding: "48px 0 40px", position: "relative", zIndex: 1 }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 6 }}>py<span className="grad-orange">Kode</span></div>
          <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>© 2026 · Web engineering supercharged by AI · kodeflow.dev</div>
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 13.5, color: "var(--ink-mute)" }}>
          {["GitHub", "LinkedIn", "X / Twitter", "Email"].map((l) => (
            <a key={l} href="#" style={{ color: "var(--ink-mute)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--orange-bright)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-mute)")}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── HIRE MODAL ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(0,0,0,0.25)", border: "1px solid var(--glass-brd-soft)", borderRadius: 13, padding: "13px 15px", color: "var(--ink)", fontSize: 14, fontFamily: "var(--sans)", outline: "none" };

function HireModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  if (!open) return null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to EmailJS (you already use @emailjs/browser).
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); setForm({ name: "", email: "", msg: "" }); }, 1600);
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", animation: "kf-fadeIn .2s ease" }}>
      <div onClick={(e) => e.stopPropagation()} className="glass-2" style={{ borderRadius: 26, padding: 36, width: "100%", maxWidth: 480, position: "relative", animation: "kf-modalIn .3s cubic-bezier(.16,1,.3,1)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: 10, border: "1px solid var(--glass-brd-soft)", background: "var(--glass-bg)", color: "var(--ink-mute)", cursor: "pointer", fontSize: 16 }}>×</button>
        <div className="pill" style={{ marginBottom: 18 }}><span className="dot-live" /><span style={{ color: "var(--ink-soft)" }}>Let's work together</span></div>
        <h3 className="serif" style={{ fontSize: 30, marginBottom: 6 }}>Start a project</h3>
        <p style={{ fontSize: 14, color: "var(--ink-mute)", marginBottom: 24 }}>Tell me about your idea. I'll get back within 24 hours.</p>
        {sent ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
            <div className="serif" style={{ fontSize: 22 }}>Message sent!</div>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", marginTop: 6 }}>I'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input required type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
            <textarea required rows={4} placeholder="Describe your project, goals and timeline..." value={form.msg} onChange={(e) => setForm((f) => ({ ...f, msg: e.target.value }))} style={{ ...inputStyle, resize: "none" }} />
            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Send message →</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── responsive + keyframe styles (scoped) ────────────────────────────
const STYLE = `
.kf-root .marquee-track{ animation: kf-scrollx 26s linear infinite; }
@keyframes kf-scrollx{ to { transform: translateX(-50%); } }
.kf-root .hero-line{ transform: translateY(105%); animation: kf-heroUp .95s cubic-bezier(.16,1,.3,1) forwards; }
.kf-root .hero-line.hl2{ animation-delay:.1s; } .kf-root .hero-line.hl3{ animation-delay:.2s; }
@keyframes kf-heroUp{ to { transform: translateY(0); } }
@keyframes kf-floatY{ 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-12px) } }
@keyframes kf-blink{ 50%{ opacity:0 } }
@keyframes kf-lineIn{ from{ opacity:0; transform: translateX(-6px) } to{ opacity:1; transform:none } }
@keyframes kf-fadeIn{ from{ opacity:0 } to{ opacity:1 } }
@keyframes kf-modalIn{ from{ opacity:0; transform: translateY(20px) scale(.97) } to{ opacity:1; transform:none } }
.kf-root .proc-card:hover{ transform: translateY(-6px); border-color: rgba(255,122,24,0.4) !important; }
.kf-root .serv-card:hover{ transform: translateY(-5px); border-color: rgba(255,122,24,0.4) !important; }
.kf-root .work-card:hover{ transform: translateY(-6px); }
.kf-root .work-card:hover .work-img{ transform: scale(1.06); }
.kf-root .work-row:hover .work-frame{ transform: translateY(-6px); }
.kf-root .work-row:hover .work-shot{ transform: scale(1.04); }
.kf-root .work-link:hover{ gap: 11px; }
@media (max-width: 880px){
  .kf-root .work-row{ grid-template-columns: 1fr !important; gap: 32px !important; }
  .kf-root .work-visual{ order: 1 !important; }
  .kf-root .work-row > div:last-child{ order: 2 !important; }
}
@media (max-width: 920px){
  .kf-root .hero-grid{ grid-template-columns: 1fr !important; }
  .kf-root .hero-core{ height: 420px !important; order:-1; }
  .kf-root .hud-chip{ font-size: 12px !important; padding: 9px 12px !important; border-radius: 12px !important; }
}
@media (max-width: 900px){
  .kf-root .nav-links, .kf-root .portal-link, .kf-root .nav-cta{ display:none !important; }
  .kf-root .nav-burger{ display:inline-flex !important; }
  .kf-root .nav-mobile{ display:block !important; }
  .kf-root .proc-grid{ grid-template-columns: 1fr 1fr !important; }
  .kf-root .work-grid{ grid-template-columns: 1fr !important; max-width:460px; margin:0 auto; }
  .kf-root .price-grid{ grid-template-columns: 1fr !important; max-width:420px; margin:0 auto; }
  .kf-root .price-grid > div{ transform:none !important; }
  .kf-root .testi-grid{ grid-template-columns: 1fr !important; max-width:480px; margin:0 auto; }
}
@media (max-width: 980px){ .kf-root .serv-grid{ grid-template-columns: 1fr 1fr !important; } }
@media (max-width: 860px){ .kf-root .about-grid{ grid-template-columns: 1fr !important; gap:40px !important; } }
@media (max-width: 760px){ .kf-root .stat-row{ grid-template-columns: 1fr 1fr !important; } .kf-root .stat-cell{ border-left:none !important; } }
@media (max-width: 520px){ .kf-root .proc-grid, .kf-root .serv-grid{ grid-template-columns: 1fr !important; } }
@media (prefers-reduced-motion: reduce){ .kf-root .marquee-track, .kf-root .hero-line{ animation:none !important; transform:none !important; } }
`;

// ── PAGE ─────────────────────────────────────────────────────────────
export default function Home() {
  const [hire, setHire] = useState(false);
  useReveal();
  return (
    <div className="kf-root">
      <style>{STYLE}</style>
      <PremiumFX />
      <div className="bg-atmos">
        <div className="bg-base" />
        <div className="orb orb-a" /><div className="orb orb-b" /><div className="orb orb-c" />
        <div className="bg-grid" /><div className="bg-grain" />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar onHire={() => setHire(true)} />
        <Hero onHire={() => setHire(true)} />
        <TechMarquee />
        <Stats />
        <About />
        <Process />
        <Services />
        <Work />
        <Pricing onHire={() => setHire(true)} />
        <Testimonials />
        <Contact onHire={() => setHire(true)} />
        <Footer />
      </div>
      <HireModal open={hire} onClose={() => setHire(false)} />
    </div>
  );
}
