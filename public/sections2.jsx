const { useState: useState2, useRef: useRef2, useEffect: useEffect2 } = React;

// ════════════════════════════════════════════════════════════
//  WORK — premium showcase (large alternating case studies)
// ════════════════════════════════════════════════════════════
function Work() {
  const projects = [
    { n: "01", t: "Fintech SaaS Dashboard", tag: "SaaS Platform", img: "assets/work-dashboard.png", kind: "Example concept", d: "The kind of product I build: a real-time analytics platform with multi-tenant architecture, role-based access, Stripe billing and live WebSocket streaming.", tech: ["React", "Node", "Postgres", "Redis"], metrics: [{ v: "Realtime", l: "data sync" }, { v: "Multi", l: "tenant" }, { v: "Stripe", l: "billing" }] },
    { n: "02", t: "E-Commerce Storefront", tag: "Headless Commerce", img: "assets/work-ecommerce.png", kind: "Example concept", d: "A headless storefront concept — smart filtering, one-click checkout, automated cart recovery and a fully custom CMS, built to convert and scale.", tech: ["Next.js", "Stripe", "Sanity"], metrics: [{ v: "1-click", l: "checkout" }, { v: "Headless", l: "CMS" }, { v: "<1s", l: "load target" }] },
    { n: "03", t: "Restaurant & Bookings", tag: "Booking System", img: "assets/work-restaurant.png", kind: "Example concept", d: "A booking experience concept — live table reservations, a dynamic menu and a full admin dashboard, wrapped in an elegant, fast interface.", tech: ["React", "Node", "Postgres"], metrics: [{ v: "Live", l: "reservations" }, { v: "Admin", l: "dashboard" }, { v: "24/7", l: "self-serve" }] },
  ];
  return (
    <section id="work" style={{ padding: "100px 0" }}>
      <div className="container">
        <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>04 — What I Can Build</div>
            <h2 className="serif text-balance" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 1.04 }}>Examples of what's <span className="serif-i grad-orange">possible</span></h2>
          </div>
          <a href="https://github.com/valentincojocaru" target="_blank" rel="noopener" className="btn-ghost" style={{ fontSize: 14 }}>View GitHub →</a>
        </div>
        <p className="reveal text-pretty" style={{ fontSize: 15, color: "var(--ink-faint)", maxWidth: 520, marginBottom: 64 }}>
          Concept builds that show the kind of products, polish and engineering I bring to a project — not client work.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 110 }}>
          {projects.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={i} className="reveal work-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
                {/* Visual */}
                <div className="work-visual" style={{ order: flip ? 2 : 1, position: "relative" }}>
                  <div style={{ position: "absolute", inset: "8% 6%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,24,0.18), transparent 65%)", filter: "blur(40px)", pointerEvents: "none" }}></div>
                  <div className="glass-2 work-frame" style={{ position: "relative", borderRadius: 18, overflow: "hidden", transition: "transform .5s cubic-bezier(.16,1,.3,1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 38, borderBottom: "1px solid var(--glass-brd-soft)", background: "rgba(0,0,0,0.25)" }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }}></span>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }}></span>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }}></span>
                      <span className="mono" style={{ margin: "0 auto", fontSize: 11, color: "var(--ink-faint)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }}></span>preview
                      </span>
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <img src={p.img} alt={p.t} loading="lazy" className="work-shot" style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "top", transition: "transform 1.2s cubic-bezier(.16,1,.3,1)" }} />
                    </div>
                  </div>
                </div>

                {/* Text */}
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

                  {/* Capability highlights */}
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
                      {p.tech.map(t => <span key={t} className="mono" style={{ fontSize: 10.5, color: "var(--ink-soft)", border: "1px solid var(--glass-brd-soft)", padding: "4px 10px", borderRadius: 8 }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .work-row:hover .work-frame{ transform: translateY(-6px); }
        .work-row:hover .work-shot{ transform: scale(1.04); }
        .work-link:hover{ gap: 11px; }
        @media (max-width: 880px){
          section .work-row{ grid-template-columns: 1fr !important; gap: 32px !important; }
          section .work-visual{ order: 1 !important; }
          section .work-row > div:last-child{ order: 2 !important; }
        }
      `}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  PRICING
// ════════════════════════════════════════════════════════════
function Pricing({ onHire }) {
  const plans = [
    { name: "Landing", price: "€600", tag: "From", d: "A premium page that converts.", feats: ["1–3 custom sections", "Animations & interactions", "100% responsive & SEO", "Delivered in 5–7 days"], hot: false },
    { name: "Web App", price: "€1.8k", tag: "From", d: "Your product, built right.", feats: ["Full-stack architecture", "Auth, DB & payments", "Admin panel", "Deploy + 30 days support"], hot: true },
    { name: "Retainer", price: "€600", tag: "/mo", d: "A dedicated technical partner.", feats: ["Ongoing development", "Priority delivery", "Maintenance & monitoring", "Weekly call"], hot: false },
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
                {p.feats.map(f => (
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
      <style>{`@media (max-width: 900px){ section .price-grid{ grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; } section .price-grid > div{ transform: none !important; } }`}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  TESTIMONIALS
// ════════════════════════════════════════════════════════════
function Testimonials() {
  const items = [
    { ic: "M13 2L3 14h7l-1 8 10-12h-7z", t: "Senior-led, end to end", d: "From architecture to deploy, you get one senior engineer obsessed with quality — fast, focused, and accountable for the result." },
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
      <style>{`@media (max-width: 900px){ section .testi-grid{ grid-template-columns: 1fr !important; max-width: 480px; margin: 0 auto; } }`}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
//  CONTACT / CTA
// ════════════════════════════════════════════════════════════
function Contact({ onHire }) {
  return (
    <section id="contact" style={{ padding: "60px 0 110px" }}>
      <div className="container">
        <div className="glass-2 reveal" style={{ borderRadius: 32, padding: "clamp(40px, 7vw, 80px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,122,24,0.22), transparent 60%)", filter: "blur(40px)", pointerEvents: "none" }}></div>
          <div className="pill" style={{ marginBottom: 26 }}><span className="dot-live"></span><span style={{ color: "var(--ink-soft)" }}>1 spot open this month</span></div>
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

// ════════════════════════════════════════════════════════════
//  FOOTER
// ════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--glass-brd-soft)", padding: "48px 0 40px", position: "relative", zIndex: 1 }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 6 }}>py<span className="grad-orange">Kode</span></div>
          <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>© 2026 · Premium web engineering · kodeflow.dev</div>
        </div>
        <div style={{ display: "flex", gap: 22, fontSize: 13.5, color: "var(--ink-mute)" }}>
          {[
            { l: "GitHub", href: "https://github.com/valentincojocaru" },
            { l: "LinkedIn", href: "https://www.linkedin.com/" },
            { l: "X / Twitter", href: "https://x.com/" },
            { l: "Email", href: "mailto:hello@kodeflow.dev" },
          ].map(s => (
            <a key={s.l} href={s.href} target={s.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener" style={{ color: "var(--ink-mute)", textDecoration: "none", transition: "color .2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--orange-bright)"} onMouseLeave={e => e.currentTarget.style.color = "var(--ink-mute)"}>{s.l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ════════════════════════════════════════════════════════════
//  HIRE MODAL
// ════════════════════════════════════════════════════════════
function HireModal({ open, onClose }) {
  const [form, setForm] = useState2({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState2(false);
  const [sending, setSending] = useState2(false);
  const [err, setErr] = useState2("");
  if (!open) return null;
  // ⚙️ To make this live, paste a Formspree / Web3Forms / Discord-webhook URL below.
  //    Leave empty and it falls back to opening the visitor's email client (mailto).
  const ENDPOINT = "";
  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setErr("");
    if (!ENDPOINT) {
      // graceful fallback: prefill an email so the message is never lost
      const body = encodeURIComponent(`Hi Kode,\n\n${form.msg}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:hello@kodeflow.dev?subject=${encodeURIComponent("New project — " + form.name)}&body=${body}`;
      setSent(true);
      setTimeout(() => { setSent(false); onClose(); setForm({ name: "", email: "", msg: "" }); }, 2200);
      return;
    }
    setSending(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.msg, source: "kodeflow.dev" }),
      });
      if (!res.ok) throw new Error("bad status");
      setSent(true);
      setTimeout(() => { setSent(false); onClose(); setForm({ name: "", email: "", msg: "" }); }, 2200);
    } catch (_) {
      setErr("Couldn't send just now — email hello@kodeflow.dev directly.");
    } finally {
      setSending(false);
    }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", animation: "fadeIn .2s ease" }}>
      <div onClick={e => e.stopPropagation()} className="glass-2" style={{ borderRadius: 26, padding: 36, width: "100%", maxWidth: 480, position: "relative", animation: "modalIn .3s cubic-bezier(.16,1,.3,1)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: 10, border: "1px solid var(--glass-brd-soft)", background: "var(--glass-bg)", color: "var(--ink-mute)", cursor: "pointer", fontSize: 16 }}>×</button>
        <div className="pill" style={{ marginBottom: 18 }}><span className="dot-live"></span><span style={{ color: "var(--ink-soft)" }}>Let's work together</span></div>
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
            {[["name", "Your name", "text"], ["email", "Email", "email"]].map(([k, ph, ty]) => (
              <input key={k} required type={ty} placeholder={ph} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={inputStyle} />
            ))}
            <textarea required rows={4} placeholder="Describe your project, goals and timeline..." value={form.msg} onChange={e => setForm(f => ({ ...f, msg: e.target.value }))} style={{ ...inputStyle, resize: "none" }} />
            {err && <div style={{ fontSize: 12.5, color: "#ff8a5a" }}>{err}</div>}
            <button type="submit" disabled={sending} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: sending ? 0.6 : 1 }}>{sending ? "Sending…" : "Send message →"}</button>
          </form>
        )}
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  );
}
const inputStyle = { width: "100%", background: "rgba(0,0,0,0.25)", border: "1px solid var(--glass-brd-soft)", borderRadius: 13, padding: "13px 15px", color: "var(--ink)", fontSize: 14, fontFamily: "var(--sans)", outline: "none" };

// ════════════════════════════════════════════════════════════
//  SECTIONS WRAPPER
// ════════════════════════════════════════════════════════════
function Sections({ onHire }) {
  return (
    <React.Fragment>
      <TechMarquee />
      <Stats />
      <About />
      <ProcessTimeline />
      <Services />
      <Work />
      <CaseStudy />
      <Pricing onHire={onHire} />
      <PriceCalculator onHire={onHire} />
      <Testimonials />
      <FAQ />
      <Contact onHire={onHire} />
      <Footer />
    </React.Fragment>
  );
}

Object.assign(window, { Work, Pricing, Testimonials, Contact, Footer, HireModal, Sections });
