import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 300);
    const t3 = setTimeout(() => setPhase(3), 500);
    const t4 = setTimeout(() => setVisible(false), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#080612]"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(184,80,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(184,80,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />

          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_30%,#080612_80%)]" />

          {/* Scanning line */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"
                initial={{ top: "0%", opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          <div className="relative flex flex-col items-center gap-4">
            {/* Logo */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, y: 20, filter: "blur(16px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-6xl md:text-8xl font-bold text-primary tracking-tighter"
                    style={{ textShadow: "0 0 60px rgba(184,80,255,0.9), 0 0 120px rgba(184,80,255,0.4)" }}>
                    py
                  </span>
                  <span className="text-6xl md:text-8xl font-bold text-foreground tracking-tighter">Kode</span>
                  <span className="text-6xl md:text-8xl font-bold text-primary/40 tracking-tighter">.</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tagline */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.p
                  className="text-muted-foreground text-sm tracking-[0.4em] uppercase font-medium"
                  initial={{ opacity: 0, letterSpacing: "0.8em" }}
                  animate={{ opacity: 1, letterSpacing: "0.4em" }}
                  transition={{ duration: 0.9 }}
                >
                  AI-Powered Full-Stack Development
                </motion.p>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  className="mt-6 w-48 h-[1px] bg-white/10 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: phase >= 3 ? "100%" : "70%" }}
                    transition={{ duration: phase >= 3 ? 0.5 : 1.4, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Corner decorations */}
          {[
            "top-6 left-6 border-t border-l",
            "top-6 right-6 border-t border-r",
            "bottom-6 left-6 border-b border-l",
            "bottom-6 right-6 border-b border-r",
          ].map((cls, i) => (
            <motion.div key={i}
              className={`absolute w-8 h-8 border-primary/30 ${cls}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
