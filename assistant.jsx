/* ════════════════════════════════════════════════════════════════
   Kode — AI assistant (floating glass chat, powered by Claude)
   Mounts into #assistant-root. Self-contained.
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useRef, useEffect } = React;

  // Knowledge the assistant answers from (kept tight & honest).
  const SYSTEM = `You are "Kai", the concierge on Kode's website — polished, warm and genuinely helpful, like a senior studio lead who enjoys the craft. Professional but personable; never pushy, never robotic.

ABOUT KODE:
- Solo senior engineer, 5+ years. Clients work directly with Kode — no account managers, no juniors, no bureaucracy.
- Delivers in weeks, not months, with senior-level code quality and real craft.
- Client owns 100% of the code — clean, documented, no lock-in.
- Stack: React/Next.js, TypeScript, Node, Postgres, Tailwind, deployed on Vercel or AWS. Picks what fits the product.

WHAT KODE BUILDS: landing pages, web apps & SaaS, e-commerce (headless + Stripe), APIs/backends, DevOps/infra (AWS/Vercel, Docker, CI/CD), custom dashboards & internal tools, and AI features for clients who want them (chatbots, RAG, automation).

PROCESS: 1) Discovery call (~45min) 2) Architecture spec (1–2 days) 3) Build (1–4 weeks, daily updates + live preview from day 1) 4) Launch & handover (zero-downtime deploy, docs, post-launch fixes included).

PRICING — realistic ballparks (final quote after a call):
- Landing page: from €500 (5–7 days)
- Web app / SaaS: from €1,800 (1–4 weeks)
- E-commerce: from €1,400 · API/backend: from €1,100
- Add-ons: auth ~€250, payments(Stripe) ~€300, admin dashboard ~€400, AI features ~€500, custom CMS ~€350, multi-language ~€200
- Retainer (ongoing): €600/month
- Priority timeline +25%, rush +60%. There's a live estimate tool on the page — point people to it.
You MAY give a rough number using these figures when asked (e.g. "a web app with auth + admin is roughly €2,500"), always framed as a ballpark pending a call.

CONTACT: Replies within 24h. Next step = the "Start a Project" button (opens a quick form) or hello@kodeflow.dev.

EXAMPLE PROJECTS (use as concrete reference points when relevant — these are representative of Kode's work, describe them as "the kind of thing I build"):
- A fintech SaaS dashboard: real-time analytics, multi-tenant, role-based access, Stripe billing, live data — a web-app build with auth + admin + payments, ~€2,500–€3,500, ~3–4 weeks.
- A headless e-commerce storefront: smart filtering, one-click checkout, cart recovery, custom CMS — ~€1,800–€2,800, ~2–4 weeks.
- A restaurant site with live table bookings + admin dashboard — ~€1,400–€2,200, ~2–3 weeks.
- A high-converting product landing page with motion and interactions — from €500, ~5–7 days.
When a user's idea matches one, anchor to it briefly ("that's close to a booking site I'd build — roughly €1,400–€2,200, 2–3 weeks").

HOW TO BEHAVE:
- Open warmly and briefly. Mirror the user's energy and language (Romanian or English). A touch of personality is good; stiffness is not.
- First, silently classify the user's intent (pricing / timeline / scope / tech / trust / how-to-start / smalltalk) and answer THAT precisely. If their ask is vague, ask one sharp clarifying question instead of guessing.
- Be genuinely useful and consultative: give a quick expert take (a real opinion or a concrete number), THEN a light nudge to start a project. Sound like a senior engineer who has shipped this before, not a chatbot.
- Keep replies SHORT: 2–3 sentences, plus at most ONE follow-up question. No headings, no bullet lists — talk like a person texting.
- When someone describes a project, give a ballpark € range from the pricing below AND a rough timeline in the same breath, always framed as "pending a quick call".
- CURRENCY IS EUROS (€) ONLY. Never use $ or dollars. Use ONLY the pricing figures above — never invent higher numbers.
- Stay honest: never invent clients, reviews or numbers beyond the pricing above. If you don't know something specific, say so and point to the call.
- Focus on outcomes (speed, quality, ownership). If asked whether AI builds it, say Kode uses modern tooling to move fast but every decision is senior-led — then steer back to their project.
- NO markdown whatsoever. Mirror the user's language (Romanian or English) naturally and warmly.`;

  const SUGGESTIONS = [
    "I have a project in mind",
    "Roughly what would it cost?",
    "Show me what you've built",
    "How do we get started?",
  ];

  function clean(t) {
    return (t || "")
      .replace(/^#{1,6}\s+/gm, "")        // strip heading markers
      .replace(/\*\*(.+?)\*\*/g, "$1")     // bold
      .replace(/(^|\s)\*(?!\s)(.+?)\*/g, "$1$2") // italic
      .replace(/^\s*[-*]\s+/gm, "\u2022 ")  // bullets -> middot
      .replace(/`([^`]+)`/g, "$1")         // inline code
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function Assistant() {
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([
      { role: "assistant", content: "Hi, I'm Kai 👋 Kode's studio concierge. Tell me what you're thinking of building and I'll give you a ballpark and timeline — or ask me anything about how we work." },
    ]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [unread, setUnread] = useState(true);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs, busy, open]);

    useEffect(() => {
      if (open) { setUnread(false); setTimeout(() => inputRef.current && inputRef.current.focus(), 350); }
    }, [open]);

    const send = async (text) => {
      const q = (text != null ? text : input).trim();
      if (!q || busy) return;
      setInput("");
      const next = [...msgs, { role: "user", content: q }];
      setMsgs(next);
      setBusy(true);
      try {
        const convo = next.filter(m => m.role !== "system").slice(-10)
          .map(m => ({ role: m.role, content: m.content }));
        // window.claude.complete ignores a `system` param — prime the model with
        // an instruction turn so it actually follows the rules.
        const primed = [
          { role: "user", content: SYSTEM + "\n\nReply only with 'Ready.' to confirm you'll follow these rules." },
          { role: "assistant", content: "Ready." },
          ...convo,
        ];
        const reply = await window.claude.complete({ messages: primed });
        setMsgs(m => [...m, { role: "assistant", content: clean(reply) || "Sorry, could you rephrase that?" }]);
      } catch (e) {
        setMsgs(m => [...m, { role: "assistant", content: "I'm having trouble reaching the server right now. You can reach Kode directly at hello@kodeflow.dev — replies within 24h." }]);
      } finally {
        setBusy(false);
      }
    };

    const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

    return (
      React.createElement(React.Fragment, null,
        // ── Launcher ──
        React.createElement("button", {
          className: "kai-fab" + (open ? " kai-fab--open" : ""),
          onClick: () => setOpen(o => !o),
          "aria-label": open ? "Close assistant" : "Open assistant",
        },
          React.createElement("span", { className: "kai-fab-glow" }),
          open
            ? React.createElement("span", { className: "kai-fab-ic" }, "✕")
            : React.createElement(React.Fragment, null,
                React.createElement("span", { className: "kai-fab-orb" },
                  React.createElement("span", { className: "kai-fab-core" })
                ),
                React.createElement("span", { className: "kai-fab-label" }, "Ask Kai"),
                unread && React.createElement("span", { className: "kai-fab-dot" })
              )
        ),

        // ── Panel ──
        React.createElement("div", { className: "kai-panel" + (open ? " kai-panel--open" : "") },
          React.createElement("div", { className: "kai-head" },
            React.createElement("div", { className: "kai-head-l" },
              React.createElement("span", { className: "kai-avatar" }, React.createElement("span", { className: "kai-avatar-core" })),
              React.createElement("div", null,
                React.createElement("div", { className: "kai-name" }, "Kai", React.createElement("span", { className: "kai-badge" }, "AI")),
                React.createElement("div", { className: "kai-status" },
                  React.createElement("span", { className: "kai-status-dot" }), "Online · replies instantly"
                )
              )
            ),
            React.createElement("button", { className: "kai-x", onClick: () => setOpen(false), "aria-label": "Close" }, "✕")
          ),

          React.createElement("div", { className: "kai-scroll", ref: scrollRef },
            msgs.map((m, i) =>
              React.createElement("div", { key: i, className: "kai-msg kai-msg--" + m.role },
                m.role === "assistant" && React.createElement("span", { className: "kai-msg-av" }),
                React.createElement("div", { className: "kai-bubble" }, m.content)
              )
            ),
            busy && React.createElement("div", { className: "kai-msg kai-msg--assistant" },
              React.createElement("span", { className: "kai-msg-av" }),
              React.createElement("div", { className: "kai-bubble kai-typing" },
                React.createElement("i", null), React.createElement("i", null), React.createElement("i", null)
              )
            ),
            msgs.length <= 1 && !busy && React.createElement("div", { className: "kai-suggest" },
              SUGGESTIONS.map((s, i) =>
                React.createElement("button", { key: i, className: "kai-chip", onClick: () => send(s) }, s)
              )
            )
          ),

          React.createElement("div", { className: "kai-input" },
            React.createElement("textarea", {
              ref: inputRef, rows: 1, value: input, placeholder: "Ask about services, pricing…",
              onChange: e => setInput(e.target.value), onKeyDown: onKey,
            }),
            React.createElement("button", {
              className: "kai-send", onClick: () => send(), disabled: busy || !input.trim(), "aria-label": "Send",
            }, "→")
          ),
          React.createElement("div", { className: "kai-foot" }, "AI assistant · answers may be imperfect")
        )
      )
    );
  }

  const root = document.getElementById("assistant-root");
  if (root && window.React && window.ReactDOM) {
    ReactDOM.createRoot(root).render(React.createElement(Assistant));
  }
})();
