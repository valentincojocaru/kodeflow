/* ════════════════════════════════════════════════════════════
   pyKode — immersion layer (scroll + entrance driven, no cursor)
   • Eyebrow "decode" scramble on reveal (terminal aesthetic)
   • Scroll-parallax depth on background orbs + grid
   • One-shot, rAF-throttled. Respects reduced-motion.
   ════════════════════════════════════════════════════════════ */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  /* ── 1. Eyebrow decode scramble ─────────────────────────── */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#*+";
  function scramble(el) {
    if (el.dataset.fx) return; el.dataset.fx = "1";
    const final = el.textContent;
    const chars = final.split("");
    let frame = 0;
    const total = 28;
    const revealAt = chars.map((_, i) => Math.floor((i / chars.length) * (total - 8)) + 4);
    const tick = () => {
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " ") { out += " "; continue; }
        if (frame >= revealAt[i]) out += chars[i];
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      frame++;
      if (frame <= total) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  }

  const seen = new WeakSet();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !seen.has(e.target)) {
        seen.add(e.target);
        scramble(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });

  function arm() {
    document.querySelectorAll(".eyebrow").forEach(el => { if (!el.dataset.fxArm) { el.dataset.fxArm = "1"; io.observe(el); } });
  }
  [500, 1200, 2200, 3400].forEach(t => setTimeout(arm, t));

  /* ── 2. Scroll-parallax depth ───────────────────────────── */
  const orbA = document.querySelector(".orb-a");
  const orbB = document.querySelector(".orb-b");
  const orbC = document.querySelector(".orb-c");
  const grid = document.querySelector(".bg-grid");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (orbA) orbA.style.transform = `translateY(${y * 0.12}px)`;
      if (orbB) orbB.style.transform = `translateY(${y * -0.08}px)`;
      if (orbC) orbC.style.transform = `translateY(${y * 0.06}px)`;
      if (grid) grid.style.transform = `translateY(${y * 0.04}px)`;
      ticking = false;
    });
  }
  // keep the idle CSS float at the top; switch to parallax once scrolling
  let scrolledOnce = false;
  window.addEventListener("scroll", () => {
    if (!scrolledOnce && window.scrollY > 40) {
      scrolledOnce = true;
      [orbA, orbB, orbC].forEach(o => o && (o.style.animation = "none"));
    }
    if (scrolledOnce) onScroll();
  }, { passive: true });

  /* ── 3. Hero headline shimmer sweep (one pass after entrance) ── */
  function shimmer() {
    const h1 = document.querySelector(".hero-line.hl3") || document.querySelector(".hero-line");
    const host = h1 && h1.closest("h1");
    if (!host || host.dataset.shimmer) return;
    host.dataset.shimmer = "1";
    const s = document.createElement("style");
    s.textContent = `
      @keyframes kfShimmer { 0%{background-position:-150% 0;} 100%{background-position:250% 0;} }
      .kf-shimmer::after { content:""; position:absolute; inset:0; pointer-events:none; border-radius:8px;
        background: linear-gradient(105deg, transparent 38%, rgba(255,220,160,0.35) 50%, transparent 62%);
        background-size: 220% 100%; mix-blend-mode: overlay;
        animation: kfShimmer 1.5s cubic-bezier(.4,0,.2,1) .2s 1 both; }`;
    document.head.appendChild(s);
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.classList.add("kf-shimmer");
    setTimeout(() => host.classList.remove("kf-shimmer"), 2200);
  }
  setTimeout(shimmer, 1900);

  /* ── scroll progress + back-to-top ─────────────────────── */
  const prog = document.getElementById("scrollProg");
  const toTop = document.getElementById("toTop");
  let pTick = false;
  function updProg() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    if (prog) prog.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("show", y > 600);
    pTick = false;
  }
  window.addEventListener("scroll", () => { if (!pTick) { pTick = true; requestAnimationFrame(updProg); } }, { passive: true });
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  updProg();
})();
