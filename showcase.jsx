const { useState: useSc, useRef: useScR, useEffect: useScE } = React;

// ════════════════════════════════════════════════════════════
//  PROCESS TIMELINE — scroll-driven vertical reveal
// ════════════════════════════════════════════════════════════
function ProcessTimeline() {
  const steps = [
    { n: "01", t: "Discovery", d: "We map the vision, goals and constraints. I ask the sharp questions and confirm scope before a single line of code.", time: "~45 min", ic: "M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" },
    { n: "02", t: "Architecture", d: "A complete technical blueprint — stack, data model, API contracts, auth and deploy strategy, delivered as a spec you keep.", time: "1–2 days", ic: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
    { n: "03", t: "Build", d: "Focused sprints, daily updates and a live preview from day 1 — fast iteration without ever cutting corners on quality.", time: "1–4 weeks", ic: "M16 18l6-6-6-6M8 6l-6 6 6 6" },
    { n: "04", t: "Launch & handover", d: "Zero-downtime deploy, a full code walkthrough and documentation. Post-launch bug-fixing included.", time: "1 day", ic: "M5 13l4 4L19 7" },
  ];
  const ref = useScR(null);
  const [fill, setFill] = useSc(0);
  useScE(() => {
    const onScroll = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8, end = vh * 0.3;
      const p = (start - r.top) / (r.height - (vh - end - start) + (start - end));
      setFill(Math.max(0, Math.min(1, (start - r.top) / (r.height * 0.78))));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <section id="process" style={{ padding: "100px 0" }}>
      <div className="container">
        <SectionHead kicker="02 — Process" title={<span>How we work <span className="serif-i grad-orange">together</span></span>} sub="A calm, transparent process built to ship fast without cutting corners." center />
        <div ref={ref} className="ptl" style={{ position: "relative", maxWidth: 760, margin: "0 auto", paddingLeft: 8 }}>
          <div className="ptl-rail">
            <div className="ptl-rail-fill" style={{ height: (fill * 100) + "%" }}></div>
          </div>
          {steps.map((s, i) => {
            const active = fill >= (i + 0.4) / steps.length;
            return (
              <div key={i} className="ptl-row reveal" style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 22, paddingBottom: i < steps.length - 1 ? 46 : 0 }}>
                <div className="ptl-node" style={{ borderColor: active ? "rgba(255,122,24,0.7)" : "var(--glass-brd)", background: active ? "linear-gradient(180deg,var(--amber),var(--orange))" : "var(--glass-bg-2)", boxShadow: active ? "0 0 24px rgba(255,122,24,0.5)" : "none", transition: "all .5s" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1a0d02" : "var(--ink-mute)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke .5s" }}><path d={s.ic} /></svg>
                </div>
                <div className="glass sheen" style={{ borderRadius: 18, padding: "20px 22px", transition: "border-color .5s, transform .5s", borderColor: active ? "rgba(255,122,24,0.28)" : "var(--glass-brd-soft)", transform: active ? "none" : "translateY(4px)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span className="serif" style={{ fontSize: 28, lineHeight: 1, color: active ? "transparent" : "rgba(255,255,255,0.12)", background: active ? "linear-gradient(100deg,var(--amber),var(--orange))" : "none", WebkitBackgroundClip: active ? "text" : "initial", backgroundClip: active ? "text" : "initial", transition: "color .5s" }}>{s.n}</span>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>{s.t}</h3>
                    <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--ink-mute)", border: "1px solid var(--glass-brd-soft)", padding: "3px 9px", borderRadius: 999 }}>{s.time}</span>
                  </div>
                  <p className="text-pretty" style={{ fontSize: 14.5, color: "var(--ink-mute)", lineHeight: 1.6 }}>{s.d}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .ptl-rail { position: absolute; left: 39px; top: 24px; bottom: 24px; width: 2px; background: var(--glass-brd); border-radius: 2px; overflow: hidden; }
        .ptl-rail-fill { position: absolute; top: 0; left: 0; width: 100%; background: linear-gradient(180deg, var(--amber), var(--orange) 60%, var(--orange-deep)); box-shadow: 0 0 12px rgba(255,122,24,0.6); transition: height .2s linear; }
        .ptl-node { width: 64px; height: 64px; border-radius: 16px; display: grid; place-items: center; border: 1px solid var(--glass-brd); position: relative; z-index: 1; }
        @media (max-width: 560px){ .ptl-row { grid-template-columns: 50px 1fr !important; gap: 14px !important; } .ptl-node { width: 50px; height: 50px; } .ptl-rail { left: 32px; } }
      `}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  CASE STUDY — interactive walkthrough
// ════════════════════════════════════════════════════════════
function CaseStudy() {
  const phases = [
    { k: "brief", tab: "The brief", img: "assets/work-dashboard.png", title: "A fintech that drowned in spreadsheets", body: "A founder needed a real-time analytics platform for their finance team — multi-tenant, secure, and fast enough to trust with live money data. Two agencies had quoted 4+ months.", chips: ["Multi-tenant", "Real-time", "Finance-grade"], metric: { v: "4 mo", l: "agency quote" } },
    { k: "approach", tab: "The approach", img: "assets/work-dashboard.png", title: "Architecture first, then ship in sprints", body: "I designed the schema, auth model and API contracts in two days, then built in focused weekly sprints — a live preview from day one so the team could feel it grow.", chips: ["Postgres + Redis", "Role-based access", "WebSocket streaming"], metric: { v: "Day 1", l: "live preview" } },
    { k: "build", tab: "The build", img: "assets/work-dashboard.png", title: "Dashboards that update as money moves", body: "Live charts, multi-tenant isolation, Stripe billing and granular permissions — all wrapped in a fast, calm interface the team actually enjoys using.", chips: ["Stripe billing", "61ms p95", "87kb bundle"], metric: { v: "61ms", l: "avg response" } },
    { k: "result", tab: "The result", img: "assets/work-dashboard.png", title: "Live in 18 days, not 4 months", body: "Shipped end-to-end in under three weeks with senior-level code the team fully owns. Zero-downtime deploy across 23 edge regions, documented and handed over.", chips: ["18 days", "99.9% uptime", "Fully owned"], metric: { v: "18 days", l: "to launch" } },
  ];
  const [i, setI] = useSc(0);
  const p = phases[i];
  useScE(() => {
    const id = setInterval(() => setI(x => (x + 1) % phases.length), 6000);
    return () => clearInterval(id);
  }, []);
  return (
    <section id="casestudy" style={{ padding: "100px 0" }}>
      <div className="container">
        <SectionHead kicker="Case study" title={<span>Anatomy of a <span className="serif-i grad-orange">build</span></span>} sub="One project, four steps — how a complex idea becomes a fast, owned product." center />
        <div className="cs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 34, alignItems: "center" }}>
          {/* left: tabs + copy */}
          <div className="reveal">
            <div className="cs-tabs" style={{ display: "flex", gap: 8, marginBottom: 26, flexWrap: "wrap" }}>
              {phases.map((ph, j) => (
                <button key={ph.k} onClick={() => setI(j)} style={{ padding: "9px 15px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--sans)", transition: "all .25s",
                  color: i === j ? "#1a0d02" : "var(--ink-soft)", background: i === j ? "linear-gradient(100deg,var(--amber),var(--orange))" : "var(--glass-bg)", border: "1px solid " + (i === j ? "transparent" : "var(--glass-brd-soft)") }}>{ph.tab}</button>
              ))}
            </div>
            <div key={i} className="cs-fade">
              <h3 className="serif text-balance" style={{ fontSize: "clamp(1.7rem,2.6vw,2.3rem)", lineHeight: 1.1, marginBottom: 16 }}>{p.title}</h3>
              <p className="text-pretty" style={{ fontSize: 16, color: "var(--ink-mute)", lineHeight: 1.7, marginBottom: 22 }}>{p.body}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {p.chips.map(c => <span key={c} className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", border: "1px solid var(--glass-brd-soft)", padding: "5px 11px", borderRadius: 8 }}>{c}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 30 }}>
              {phases.map((_, j) => (
                <button key={j} onClick={() => setI(j)} aria-label={"Step " + (j+1)} style={{ height: 4, flex: 1, borderRadius: 999, border: 0, cursor: "pointer", padding: 0, background: j === i ? "linear-gradient(90deg,var(--amber),var(--orange))" : "var(--glass-brd)", transition: "background .3s" }}></button>
              ))}
            </div>
          </div>
          {/* right: browser mockup */}
          <div className="reveal" style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: "6% 4%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,24,0.16), transparent 64%)", filter: "blur(34px)", pointerEvents: "none" }}></div>
            <div className="glass-2" style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 38, borderBottom: "1px solid var(--glass-brd-soft)", background: "rgba(0,0,0,0.25)" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }}></span>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }}></span>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }}></span>
                <span className="mono" style={{ margin: "0 auto", fontSize: 10.5, color: "var(--ink-faint)" }}>atlas.app · {p.tab.toLowerCase()}</span>
              </div>
              <div style={{ position: "relative", aspectRatio: "16/11", overflow: "hidden" }}>
                <img key={p.img + i} src={p.img} alt={p.title} className="cs-shot" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                <div className="cs-metric glass-2" style={{ position: "absolute", bottom: 14, right: 14, borderRadius: 14, padding: "12px 16px" }}>
                  <div className="serif grad-orange" style={{ fontSize: 26, lineHeight: 1 }}>{p.metric.v}</div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginTop: 3 }}>{p.metric.l}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .cs-fade { animation: csFade .5s cubic-bezier(.16,1,.3,1); }
        .cs-shot { animation: csShot .7s cubic-bezier(.16,1,.3,1); }
        .cs-metric { animation: csFade .6s cubic-bezier(.16,1,.3,1); }
        @keyframes csFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes csShot { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: none; } }
        @media (max-width: 860px){ section .cs-grid { grid-template-columns: 1fr !important; gap: 26px !important; } }
      `}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  COMPARISON — Kode vs. a classic agency
// ════════════════════════════════════════════════════════════
function Comparison() {
  const rows = [
    { l: "Who builds it", kode: "A senior engineer, directly", them: "Juniors + an account manager" },
    { l: "Time to launch", kode: "Days to weeks", them: "Months" },
    { l: "Communication", kode: "Straight to the builder", them: "Through layers" },
    { l: "Code ownership", kode: "100% yours, documented", them: "Often locked-in" },
    { l: "Live preview", kode: "From day one", them: "At the end, if ever" },
    { l: "Pricing", kode: "Transparent, scope-based", them: "Padded with overhead" },
  ];
  return (
    <section id="why" style={{ padding: "100px 0" }}>
      <div className="container" style={{ maxWidth: 920 }}>
        <SectionHead kicker="Why Kode" title={<span>The difference is <span className="serif-i grad-orange">night and day</span></span>} center />
        <div className="glass-2 reveal" style={{ borderRadius: 22, overflow: "hidden" }}>
          <div className="cmp-row cmp-head" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr" }}>
            <div></div>
            <div className="cmp-kode-head"><span className="grad-orange serif" style={{ fontSize: 19 }}>Kode</span></div>
            <div style={{ color: "var(--ink-mute)", fontSize: 14, fontWeight: 500 }}>Classic agency</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="cmp-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", borderTop: "1px solid var(--glass-brd-soft)" }}>
              <div className="cmp-l" style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 500 }}>{r.l}</div>
              <div className="cmp-kode" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--ink)" }}>
                <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,122,24,0.15)", color: "var(--orange-bright)", fontSize: 11 }}>✓</span>{r.kode}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--ink-mute)" }}>
                <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.05)", color: "var(--ink-faint)", fontSize: 11 }}>✕</span>{r.them}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .cmp-row > div { padding: 16px 20px; }
        .cmp-head > div { padding-top: 20px; padding-bottom: 14px; }
        .cmp-kode-head, .cmp-kode { background: rgba(255,122,24,0.05); }
        @media (max-width: 620px){
          .cmp-row { grid-template-columns: 1fr !important; }
          .cmp-row > div { padding: 8px 16px !important; }
          .cmp-l { padding-top: 16px !important; font-weight: 600 !important; color: var(--ink) !important; }
          .cmp-row > div:last-child { padding-bottom: 16px !important; }
          .cmp-head { display: none !important; }
        }
      `}</style>
    </section>
  );
}

Object.assign(window, { ProcessTimeline, CaseStudy, Comparison });
