const { useState: useS3 } = React;

// ════════════════════════════════════════════════════════════
//  PRICE CALCULATOR
// ════════════════════════════════════════════════════════════
function useCountUp(target) {
  const [n, setN] = useS3(target);
  const ref = React.useRef(target);
  React.useEffect(() => {
    const from = ref.current, to = target, dur = 550, t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick); else ref.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return n;
}

function PriceCalculator({ onHire }) {
  const TYPES = [
    { k: "landing", t: "Landing page", base: 500, wk: 1.2, ic: "M4 4h16v6H4zM4 14h10v6H4z" },
    { k: "webapp", t: "Web app / SaaS", base: 1800, wk: 3, ic: "M3 5h18M3 12h18M3 19h12" },
    { k: "ecom", t: "E-commerce", base: 1400, wk: 2.6, ic: "M6 6h15l-1.5 9h-12zM6 6L5 3H2" },
    { k: "api", t: "API / backend", base: 1100, wk: 2, ic: "M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12" },
  ];
  const ADDONS = [
    { k: "auth", t: "Auth & accounts", price: 250, wk: 0.4 },
    { k: "payments", t: "Payments (Stripe)", price: 300, wk: 0.5 },
    { k: "admin", t: "Admin dashboard", price: 400, wk: 0.6 },
    { k: "ai", t: "Smart / AI features", price: 500, wk: 0.7 },
    { k: "cms", t: "Custom CMS", price: 350, wk: 0.5 },
    { k: "i18n", t: "Multi-language", price: 200, wk: 0.3 },
  ];
  const SPEED = [
    { k: "standard", t: "Standard", mult: 1, tmult: 1, note: "normal queue" },
    { k: "priority", t: "Priority", mult: 1.25, tmult: 0.75, note: "+25% · faster" },
    { k: "rush", t: "Rush", mult: 1.6, tmult: 0.55, note: "+60% · all-in" },
  ];

  const [type, setType] = useS3("webapp");
  const [addons, setAddons] = useS3({ auth: true, payments: false, admin: true, ai: false, cms: false, i18n: false });
  const [speed, setSpeed] = useS3("standard");
  const [bump, setBump] = useS3(0);

  const typeObj = TYPES.find(t => t.k === type);
  const base = typeObj.base;
  const chosen = ADDONS.filter(a => addons[a.k]);
  const addTotal = chosen.reduce((s, a) => s + a.price, 0);
  const sp = SPEED.find(s => s.k === speed);
  const low = Math.round((base + addTotal) * sp.mult);
  const high = Math.round(low * 1.3 / 50) * 50;
  const weeks = Math.max(1, Math.round((typeObj.wk + chosen.reduce((s, a) => s + a.wk, 0)) * sp.tmult * 10) / 10);
  const fmt = n => "€" + n.toLocaleString("en-US");
  const animLow = useCountUp(low);
  const animHigh = useCountUp(high);

  React.useEffect(() => { setBump(b => b + 1); }, [low]);

  // breakdown bar segments
  const baseW = base * sp.mult, featW = addTotal * sp.mult, totalW = baseW + featW || 1;

  return (
    <section id="estimate" style={{ padding: "100px 0" }}>
      <div className="container">
        <SectionHead kicker="Instant estimate" title={<span>Price your <span className="serif-i grad-orange">project</span></span>} sub="Tick what you need — see a transparent ballpark and timeline instantly. Final quote after a short call." center />
        <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20, alignItems: "start" }}>
          {/* controls */}
          <div className="glass reveal" style={{ borderRadius: 24, padding: "28px 28px 30px" }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>1 · Project type</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {TYPES.map(t => (
                <button key={t.k} onClick={() => setType(t.k)} style={chip(type === t.k)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={type === t.k ? "var(--orange-bright)" : "var(--ink-mute)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={t.ic} /></svg>
                  <span>{t.t}</span>
                </button>
              ))}
            </div>

            <div className="eyebrow" style={{ marginBottom: 14 }}>2 · Add features</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {ADDONS.map(a => {
                const on = addons[a.k];
                return (
                  <button key={a.k} onClick={() => setAddons(s => ({ ...s, [a.k]: !s[a.k] }))} style={chip(on, true)}>
                    <span style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center", border: "1px solid " + (on ? "var(--orange)" : "var(--glass-brd)"), background: on ? "linear-gradient(180deg,var(--amber),var(--orange))" : "transparent", color: "#1a0d02", fontSize: 11 }}>{on ? "✓" : ""}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>{a.t}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>+€{a.price}</span>
                  </button>
                );
              })}
            </div>

            <div className="eyebrow" style={{ marginBottom: 14 }}>3 · Timeline</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {SPEED.map(s => (
                <button key={s.k} onClick={() => setSpeed(s.k)} style={{ ...chip(speed === s.k), flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "13px 14px" }}>
                  <span style={{ fontWeight: 600 }}>{s.t}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{s.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* result */}
          <div className="glass-2 reveal calc-result" style={{ borderRadius: 24, padding: 28, position: "sticky", top: 24, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,24,0.18), transparent 65%)", filter: "blur(20px)", pointerEvents: "none" }}></div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="eyebrow">Estimated range</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--amber)", padding: "3px 8px", borderRadius: 999, background: "rgba(255,122,24,0.12)", border: "1px solid rgba(255,122,24,0.25)" }}>LIVE</span>
            </div>
            <div key={bump} className="calc-price serif" style={{ fontSize: "clamp(2.6rem,4.4vw,3.4rem)", lineHeight: 1, marginBottom: 6 }}>
              <span className="grad-orange">{fmt(animLow)}</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-mute)", marginBottom: 18 }}>to {fmt(animHigh)} · all-in</div>

            {/* breakdown bar */}
            <div style={{ height: 8, borderRadius: 999, overflow: "hidden", display: "flex", background: "rgba(255,255,255,0.05)", marginBottom: 8 }}>
              <div style={{ width: (baseW / totalW * 100) + "%", background: "linear-gradient(90deg,var(--amber),var(--orange))", transition: "width .5s cubic-bezier(.16,1,.3,1)" }}></div>
              <div style={{ width: (featW / totalW * 100) + "%", background: "rgba(255,122,24,0.4)", transition: "width .5s cubic-bezier(.16,1,.3,1)" }}></div>
            </div>
            <div style={{ display: "flex", gap: 14, marginBottom: 20, fontSize: 11, color: "var(--ink-faint)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--orange)" }}></span>Base</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,122,24,0.4)" }}></span>Features</span>
            </div>

            {/* timeline + features highlight */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, padding: "13px 14px", borderRadius: 13, background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-brd-soft)" }}>
                <div className="serif grad-orange" style={{ fontSize: 22, lineHeight: 1 }}>~{weeks} wk</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginTop: 4 }}>est. delivery</div>
              </div>
              <div style={{ flex: 1, padding: "13px 14px", borderRadius: 13, background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-brd-soft)" }}>
                <div className="serif grad-orange" style={{ fontSize: 22, lineHeight: 1 }}>{chosen.length + 1}</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginTop: 4 }}>scope items</div>
              </div>
            </div>

            {/* live scope summary */}
            <div className="eyebrow" style={{ marginBottom: 10 }}>Your build includes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22, paddingBottom: 22, borderBottom: "1px solid var(--glass-brd-soft)" }}>
              <span className="calc-tag" style={{ background: "rgba(255,122,24,0.14)", borderColor: "rgba(255,122,24,0.3)", color: "var(--amber)" }}>{typeObj.t}</span>
              {chosen.map(a => <span key={a.k} className="calc-tag">{a.t}</span>)}
              {speed !== "standard" && <span className="calc-tag" style={{ borderColor: "rgba(255,122,24,0.3)", color: "var(--orange-bright)" }}>{sp.t} delivery</span>}
            </div>

            <button onClick={onHire} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>Get exact quote →</button>
            <p style={{ fontSize: 11.5, color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.5 }}>Indicative only · you own all code · no payment until we agree on scope</p>
          </div>
        </div>
      </div>
      <style>{`
        .calc-tag { font-size: 11.5px; padding: 5px 11px; border-radius: 999px; color: var(--ink-soft); background: var(--glass-bg); border: 1px solid var(--glass-brd-soft); animation: calcTagIn .3s cubic-bezier(.16,1,.3,1); }
        @keyframes calcTagIn { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: none; } }
        .calc-price { animation: calcPricePop .4s cubic-bezier(.16,1,.3,1); }
        @keyframes calcPricePop { 0% { transform: scale(.96); } 55% { transform: scale(1.03); } 100% { transform: scale(1); } }
        @media (max-width: 860px){ section .calc-grid{ grid-template-columns: 1fr !important; } section .calc-grid > div:last-child{ position: static !important; } }
      `}</style>
    </section>
  );
}
function chip(active, row) {
  return {
    display: "flex", alignItems: "center", gap: 9, padding: "13px 14px", borderRadius: 13, cursor: "pointer",
    fontSize: 13.5, fontWeight: 500, fontFamily: "var(--sans)", textAlign: "left",
    color: active ? "var(--ink)" : "var(--ink-soft)",
    background: active ? "rgba(255,122,24,0.10)" : "var(--glass-bg)",
    border: "1px solid " + (active ? "rgba(255,122,24,0.4)" : "var(--glass-brd-soft)"),
    transition: "all .2s",
  };
}

// ════════════════════════════════════════════════════════════
//  FAQ
// ════════════════════════════════════════════════════════════
function FAQ() {
  const ITEMS = [
    { q: "How long does a project take?", a: "Most landing pages ship in 5–10 days; full web apps in 1–4 weeks depending on scope. You get a clear timeline after the discovery call, plus daily updates and a live preview throughout." },
    { q: "Do I own the code?", a: "100%. Everything is yours from day one — clean, documented and handed over with no lock-in. Host it anywhere, keep building with anyone." },
    { q: "How does pricing work?", a: "Transparent and scope-based — you pay for outcomes, not meetings. Use the estimate tool above for a ballpark; the exact quote comes after a short call. No surprises." },
    { q: "What if I need changes after launch?", a: "Post-launch bug-fixing is included. Beyond that, I offer a monthly retainer for continuous work, or one-off updates whenever you need them." },
    { q: "Who exactly builds my project?", a: "Me, directly — a senior engineer with 5+ years. No account managers, no juniors learning on your budget. You always talk to the person writing the code." },
    { q: "What's your tech stack?", a: "Modern and proven: React / Next.js, TypeScript, Node, Postgres, Tailwind, deployed on Vercel or AWS. I pick what fits your product, not what's trendy." },
  ];
  const [open, setOpen] = useS3(0);
  return (
    <section id="faq" style={{ padding: "100px 0" }}>
      <div className="container" style={{ maxWidth: 820 }}>
        <SectionHead kicker="FAQ" title={<span>Good questions, <span className="serif-i grad-orange">straight answers</span></span>} center />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ITEMS.map((it, i) => {
            const on = open === i;
            return (
              <div key={i} className="glass reveal" style={{ borderRadius: 18, overflow: "hidden", border: "1px solid " + (on ? "rgba(255,122,24,0.3)" : "var(--glass-brd-soft)"), transition: "border-color .25s" }}>
                <button onClick={() => setOpen(on ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 24px", cursor: "pointer", background: "transparent", border: 0, textAlign: "left" }}>
                  <span className="serif" style={{ fontSize: 19, color: "var(--ink)" }}>{it.q}</span>
                  <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: on ? "linear-gradient(180deg,var(--amber),var(--orange))" : "var(--glass-bg)", color: on ? "#1a0d02" : "var(--ink-mute)", border: "1px solid " + (on ? "transparent" : "var(--glass-brd-soft)"), fontSize: 16, transition: "all .25s", transform: on ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                <div style={{ maxHeight: on ? 260 : 0, overflow: "hidden", transition: "max-height .35s cubic-bezier(.16,1,.3,1)" }}>
                  <p className="text-pretty" style={{ padding: "0 24px 22px", fontSize: 15, lineHeight: 1.65, color: "var(--ink-mute)" }}>{it.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { PriceCalculator, FAQ });
