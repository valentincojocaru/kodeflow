const { useState, useRef, useEffect } = React;

// shared reusable section heading
function SectionHead({ kicker, title, sub, center }) {
  return (
    <div className="reveal" style={{ marginBottom: 56, textAlign: center ? "center" : "left", maxWidth: center ? 640 : "none", marginInline: center ? "auto" : 0 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>{kicker}</div>
      <h2 className="serif text-balance" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 1.04, letterSpacing: "-0.015em" }}>{title}</h2>
      {sub && <p className="text-pretty" style={{ color: "var(--ink-mute)", fontSize: 17, marginTop: 16, maxWidth: 520, marginInline: center ? "auto" : 0, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  TECH MARQUEE
// ════════════════════════════════════════════════════════════
const TECHS = ["React", "TypeScript", "Node.js", "Python", "Next.js", "PostgreSQL", "Tailwind", "OpenAI", "Claude", "AWS", "Vite", "Redis", "Stripe", "Docker"];
function TechMarquee() {
  return (
    <div style={{ position: "relative", overflow: "hidden", padding: "26px 0", borderTop: "1px solid var(--glass-brd-soft)", borderBottom: "1px solid var(--glass-brd-soft)", background: "rgba(255,255,255,0.012)" }}>
      <div className="marquee-track" style={{ display: "flex", gap: 56, whiteSpace: "nowrap", width: "max-content" }}>
        {[0, 1].map(k => (
          <div key={k} style={{ display: "flex", gap: 56 }}>
            {TECHS.map((t, i) => (
              <span key={i} className="mono" style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-mute)", display: "inline-flex", alignItems: "center", gap: 56 }}>
                {t}<span style={{ color: "var(--orange)", opacity: 0.5 }}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: 120, background: "linear-gradient(90deg, var(--bg-0), transparent)" }}></div>
      <div style={{ position: "absolute", inset: "0 0 0 auto", width: 120, background: "linear-gradient(270deg, var(--bg-0), transparent)" }}></div>
      <style>{`.marquee-track{ animation: scrollx 26s linear infinite; } @keyframes scrollx{ to { transform: translateX(-50%); } } @media (prefers-reduced-motion: reduce){ .marquee-track{ animation: none; } }`}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  STATS
// ════════════════════════════════════════════════════════════
function Counter({ to, suffix }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        let s = null; const dur = 1600;
        const step = (t) => { if (!s) s = t; const p = Math.min((t - s) / dur, 1); setN(Math.floor((1 - Math.pow(2, -10 * p)) * to)); if (p < 1) requestAnimationFrame(step); else setN(to); };
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
    { n: 10, s: "×", l: "Faster delivery" },
    { n: 24, s: "h", l: "Reply time" },
    { n: 100, s: "%", l: "You own the code" },
    { n: 99, s: ".9%", l: "Uptime target" },
  ];
  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container">
        <div className="glass-2 reveal" style={{ borderRadius: 28, padding: "44px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center", borderLeft: i ? "1px solid var(--glass-brd-soft)" : "none" }} className="stat-cell">
              <div className="serif grad-orange" style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", lineHeight: 1, marginBottom: 8 }}>
                <Counter to={s.n} suffix={s.s} />
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-mute)", letterSpacing: "0.04em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 760px){ .glass-2 .stat-cell{ border-left: none !important; } section .glass-2{ grid-template-columns: 1fr 1fr !important; } }`}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  ABOUT + LIVE AGENT TERMINAL
// ════════════════════════════════════════════════════════════
const TERMINAL = [
  { t: "cmd", x: "$ kode build --client \"Atlas\" --stack next" },
  { t: "ok", x: "✓ Environment configured in 0.3s" },
  { t: "ok", x: "✓ TypeScript strict · 0 errors" },
  { t: "blank", x: "" },
  { t: "cmd", x: "$ kode test --all" },
  { t: "ok", x: "✓ 142 tests passed · 100% green" },
  { t: "ok", x: "✓ Bundle 87kb gzip · −68% vs. avg" },
  { t: "blank", x: "" },
  { t: "cmd", x: "$ kode deploy --regions global" },
  { t: "ok", x: "✓ CDN live · 23 edge regions" },
  { t: "win", x: "🚀 LIVE → atlas.app · 61ms · 99.9%" },
];
function LiveTerminal() {
  const [vis, setVis] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let timers = [], reset;
    const run = () => {
      setVis(0); timers.forEach(clearTimeout); timers = [];
      TERMINAL.forEach((_, i) => timers.push(setTimeout(() => setVis(i + 1), 380 * i + 300)));
      reset = setTimeout(run, 380 * TERMINAL.length + 3200);
    };
    const obs = new IntersectionObserver(e => { if (e[0].isIntersecting) run(); else { timers.forEach(clearTimeout); clearTimeout(reset); } }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); timers.forEach(clearTimeout); clearTimeout(reset); };
  }, []);
  return (
    <div ref={ref} className="glass-2" style={{ borderRadius: 20, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", borderBottom: "1px solid var(--glass-brd-soft)", background: "rgba(0,0,0,0.25)" }}>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }}></span>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }}></span>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }}></span>
        <span className="mono" style={{ marginLeft: 10, fontSize: 11, color: "var(--ink-faint)" }}>kode-build — zsh</span>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "#5fd07a", display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5fd07a", boxShadow: "0 0 8px #5fd07a" }}></span>LIVE</span>
      </div>
      <div className="mono" style={{ padding: 20, fontSize: 12.5, lineHeight: 1.85, minHeight: 280 }}>
        {TERMINAL.slice(0, vis).map((l, i) => (
          <div key={i} style={{ color: l.t === "cmd" ? "var(--orange-bright)" : l.t === "ok" ? "#7fe0a0" : l.t === "win" ? "var(--amber)" : "transparent", fontWeight: l.t === "win" ? 600 : 400, animation: "lineIn .3s ease" }}>{l.x || "\u00a0"}</div>
        ))}
        <span style={{ display: "inline-block", width: 8, height: 15, background: "var(--orange)", verticalAlign: "middle", animation: "blink 1s step-end infinite" }}></span>
      </div>
      <style>{`@keyframes blink{50%{opacity:0}} @keyframes lineIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}`}</style>
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
              I take complex requirements and turn them into intuitive, blazing-fast apps. I automate the repetitive work so my focus goes where it matters — architecture, quality and the details.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Direct communication", "You own the code", "Shipped in days, not months"].map(t => (
                <span key={t} className="pill" style={{ fontSize: 13 }}><span style={{ color: "var(--orange)" }}>✓</span> {t}</span>
              ))}
            </div>
          </div>
          <div className="reveal"><LiveTerminal /></div>
        </div>
      </div>
      <style>{`@media (max-width: 860px){ section .about-grid{ grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  PROCESS
// ════════════════════════════════════════════════════════════
function Process() {
  const steps = [
    { n: "01", t: "Discovery", d: "We map the vision, goals and constraints. I ask the right questions and confirm scope before a single line of code.", time: "~45 min" },
    { n: "02", t: "Architecture", d: "Full technical blueprint — stack, DB schema, API contracts, auth model and deploy strategy, delivered as a spec.", time: "1–2 days" },
    { n: "03", t: "Build", d: "Focused sprints with daily updates and a live preview from day 1 — fast iteration without ever cutting corners on quality.", time: "1–4 weeks" },
    { n: "04", t: "Launch & handover", d: "Zero-downtime deploy, full code walkthrough and documentation. Post-launch bug-fixing included.", time: "1 day" },
  ];
  return (
    <section id="process" style={{ padding: "100px 0" }}>
      <div className="container">
        <SectionHead kicker="02 — Process" title={<span>How we work <span className="serif-i grad-orange">together</span></span>} sub="A simple process, designed to ship fast without cutting corners." center />
        <div className="proc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {steps.map((s, i) => (
            <div key={i} className="glass sheen reveal proc-card" style={{ borderRadius: 22, padding: 26, transition: "transform .35s, border-color .35s", transitionDelay: (i * 0.06) + "s" }}>
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
      <style>{`
        .proc-card:hover{ transform: translateY(-6px); border-color: rgba(255,122,24,0.4) !important; }
        @media (max-width: 900px){ section .proc-grid{ grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 520px){ section .proc-grid{ grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  SERVICES
// ════════════════════════════════════════════════════════════
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
      <style>{`
        .serv-card:hover{ transform: translateY(-5px); border-color: rgba(255,122,24,0.4) !important; }
        @media (max-width: 980px){ section .serv-grid{ grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 520px){ section .serv-grid{ grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

Object.assign(window, { SectionHead, TechMarquee, Stats, About, Process, Services });
