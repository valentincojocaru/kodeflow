/* ════════════════════════════════════════════════════════════
   pyKode — premium interaction layer (lean & safe)
   Custom cursor · scroll progress · intro reveal · magnetic
   buttons · 3D tilt + glare. Pure JS, no persistent observers.
   ════════════════════════════════════════════════════════════ */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ── Intro reveal ──────────────────────────────────────────
  const intro = document.getElementById("intro");
  if (intro) {
    if (reduce) { intro.remove(); }
    else {
      const lift = () => { intro.classList.add("done"); setTimeout(() => intro.remove(), 1100); };
      setTimeout(lift, 1600);
      setTimeout(() => { if (document.body.contains(intro)) lift(); }, 3400);
    }
  }

  // ── Scroll progress ───────────────────────────────────────
  const prog = document.getElementById("scrollProg");
  if (prog) {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── Custom cursor: removed (native cursor) ────────────────

  // ── Magnetic buttons ──────────────────────────────────────
  function attachMagnetic(el) {
    if (el.dataset.mag) return; el.dataset.mag = "1";
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.3}px, ${(e.clientY - (r.top + r.height / 2)) * 0.3}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }

  // ── 3D tilt + glare ───────────────────────────────────────
  function attachTilt(card) {
    if (card.dataset.tilt) return; card.dataset.tilt = "1";
    if (getComputedStyle(card).position === "static") card.style.position = "relative";
    const glare = document.createElement("div");
    glare.className = "glare";
    card.appendChild(glare);
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 14}deg) rotateY(${(px - 0.5) * 14}deg) translateY(-4px)`;
      glare.style.setProperty("--gx", px * 100 + "%");
      glare.style.setProperty("--gy", py * 100 + "%");
      glare.style.opacity = "1";
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; glare.style.opacity = "0"; });
  }

  // one-shot scans after React mounts (no persistent observer → no loops)
  function scan() {
    if (fine && !reduce) {
      document.querySelectorAll(".btn-primary, .btn-ghost").forEach(attachMagnetic);
      document.querySelectorAll(".proc-card, .serv-card").forEach(attachTilt);
    }
  }
  [400, 1000, 1800, 3000].forEach(t => setTimeout(scan, t));

  // ── Click ripple burst (wow on every button) ─────────────
  function ripple(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 1.4;
    const s = document.createElement("span");
    s.className = "kf-ripple";
    s.style.width = s.style.height = d + "px";
    s.style.left = (e.clientX - r.left - d / 2) + "px";
    s.style.top = (e.clientY - r.top - d / 2) + "px";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    if (getComputedStyle(el).overflow !== "hidden") el.style.overflow = "hidden";
    el.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }
  function attachRipple(el) {
    if (el.dataset.rip) return; el.dataset.rip = "1";
    el.addEventListener("pointerdown", ripple);
  }
  function scanRipple() {
    document.querySelectorAll(".btn-primary, .btn-ghost, .kai-send, .kai-chip").forEach(attachRipple);
  }
  [400, 1000, 1800, 3000].forEach(t => setTimeout(scanRipple, t));
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest && e.target.closest(".btn-primary, .btn-ghost, .kai-send, .kai-chip");
    if (b && !b.dataset.rip) { attachRipple(b); }
  }, true);

  // ── Safety nets (guarantee content shows even if IO / CSS anim stalls) ──
  function revealVisible() {
    document.querySelectorAll(".reveal:not(.in)").forEach(e => {
      if (e.getBoundingClientRect().top < innerHeight * 0.92) e.classList.add("in");
    });
  }
  function showHeroLines() {
    document.querySelectorAll(".hero-line").forEach(l => {
      const cs = getComputedStyle(l).transform;
      const m = new (window.DOMMatrix || window.WebKitCSSMatrix)(cs === "none" ? "" : cs);
      if (Math.abs(m.m42) > 4) { l.style.transform = "translateY(0)"; l.style.opacity = "1"; }
    });
  }
  // hero entrance is short — backstop after it should be done
  setTimeout(showHeroLines, 1700);
  // scroll-driven reveal fallback — keeps the stagger even if IntersectionObserver is unavailable
  window.addEventListener("scroll", revealVisible, { passive: true });
  [600, 1700, 2600].forEach(t => setTimeout(revealVisible, t));
})();
