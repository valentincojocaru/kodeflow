import { useEffect } from "react";

export default function PremiumFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    // ── Intro dismiss ── caută la nivel de document, nu în root
    const dismissIntro = () => {
      const intro = document.querySelector(".kf-intro") as HTMLElement | null;
      if (!intro || intro.classList.contains("done")) return;
      if (reduce) { intro.remove(); return; }
      intro.classList.add("done");
      setTimeout(() => { if (intro.parentNode) intro.remove(); }, 1100);
    };

    if (!reduce) {
      const t1 = setTimeout(dismissIntro, 1600);
      const t2 = setTimeout(dismissIntro, 3400); // failsafe
      cleanups.push(() => { clearTimeout(t1); clearTimeout(t2); });
    } else {
      dismissIntro();
    }

    // ── Scroll progress ──
    const prog = document.querySelector(".scroll-prog") as HTMLElement | null;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (prog) prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // ── Magnetic buttons ──
    if (fine && !reduce) {
      const magHandlers: Array<{ el: HTMLElement; move: (e: PointerEvent) => void; leave: () => void }> = [];
      const attachMagnetic = () => {
        document.querySelectorAll<HTMLElement>(".btn-primary, .btn-ghost").forEach((el) => {
          if (el.dataset.mag) return;
          el.dataset.mag = "1";
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            el.style.transform = `translate(${(e.clientX-(r.left+r.width/2))*0.3}px,${(e.clientY-(r.top+r.height/2))*0.3}px)`;
          };
          const leave = () => { el.style.transform = ""; };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          magHandlers.push({ el, move, leave });
        });
      };
      const timers = [400, 1000, 1800, 3000].map(t => setTimeout(attachMagnetic, t));
      cleanups.push(() => {
        timers.forEach(clearTimeout);
        magHandlers.forEach(({ el, move, leave }) => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });
    }

    // ── Hero entrance failsafe ──
    const heroFix = setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".hero-line").forEach((l) => {
        const cs = getComputedStyle(l).transform;
        try {
          const m = new (window.DOMMatrix || (window as any).WebKitCSSMatrix)(cs === "none" ? "" : cs);
          if (Math.abs(m.m42) > 4) { l.style.transform = "translateY(0)"; l.style.opacity = "1"; }
        } catch {}
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
