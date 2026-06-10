import { useEffect } from "react";

/**
 * PremiumFX — premium interaction layer for the marketing page.
 * Renders the intro reveal, cinematic vignette and scroll-progress bar,
 * and wires magnetic buttons + 3D tilt/glare on cards. No custom cursor.
 *
 * Render it as the FIRST child inside <div className="kf-root">…</div>.
 * Pairs with the premium styles appended to kodeflow-theme.css.
 */
export default function PremiumFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const root = document.querySelector(".kf-root") as HTMLElement | null;
    if (!root) return;
    const cleanups: Array<() => void> = [];

    // Intro
    const intro = root.querySelector(".kf-intro") as HTMLElement | null;
    if (intro) {
      if (reduce) intro.remove();
      else {
        const lift = () => { intro.classList.add("done"); setTimeout(() => intro.remove(), 1100); };
        const t1 = setTimeout(lift, 1600);
        const t2 = setTimeout(() => { if (document.body.contains(intro)) lift(); }, 3400);
        cleanups.push(() => { clearTimeout(t1); clearTimeout(t2); });
      }
    }

    // Scroll progress
    const prog = root.querySelector(".scroll-prog") as HTMLElement | null;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (prog) prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // Magnetic buttons + tilt/glare
    if (fine && !reduce) {
      const magHandlers: Array<{ el: HTMLElement; move: any; leave: any }> = [];
      root.querySelectorAll<HTMLElement>(".btn-primary, .btn-ghost").forEach((el) => {
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.3}px, ${(e.clientY - (r.top + r.height / 2)) * 0.3}px)`;
        };
        const leave = () => { el.style.transform = ""; };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        magHandlers.push({ el, move, leave });
      });
      root.querySelectorAll<HTMLElement>(".proc-card, .serv-card").forEach((card) => {
        if (getComputedStyle(card).position === "static") card.style.position = "relative";
        const glare = document.createElement("div");
        glare.className = "glare";
        card.appendChild(glare);
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 14}deg) rotateY(${(px - 0.5) * 14}deg) translateY(-4px)`;
          glare.style.setProperty("--gx", px * 100 + "%");
          glare.style.setProperty("--gy", py * 100 + "%");
          glare.style.opacity = "1";
        };
        const leave = () => { card.style.transform = ""; glare.style.opacity = "0"; };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        magHandlers.push({ el: card, move, leave });
      });
      cleanups.push(() => magHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      }));
    }

    // Hero-line failsafe (in case the entrance animation stalls)
    const heroFix = setTimeout(() => {
      root.querySelectorAll<HTMLElement>(".hero-line").forEach((l) => {
        const cs = getComputedStyle(l).transform;
        const m = new (window.DOMMatrix || (window as any).WebKitCSSMatrix)(cs === "none" ? "" : cs);
        if (Math.abs(m.m42) > 4) { l.style.transform = "translateY(0)"; l.style.opacity = "1"; }
      });
    }, 1700);
    cleanups.push(() => clearTimeout(heroFix));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      <div className="vignette" />
      <div className="scroll-prog" />
      <div className="kf-intro">
        <div className="word">
          {"pyKode".split("").map((c, i) => (
            <span key={i} style={{ animationDelay: 0.05 + i * 0.06 + "s", fontStyle: i >= 2 ? "italic" : "normal" }} className={i >= 2 ? "grad-orange" : ""}>{c}</span>
          ))}
        </div>
        <div className="bar"><i /></div>
      </div>
    </>
  );
}
