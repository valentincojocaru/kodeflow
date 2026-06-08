import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Code2, Terminal, Cpu, Globe, Zap, Server, Layers, Rocket,
  CheckCircle2, Send, Github, Twitter, Linkedin, ArrowRight,
  Menu, X, Sparkles, Star, Shield, Clock, MessageSquare, Settings, Blocks,
  TrendingUp, Award, Users, ExternalLink, ChevronRight, BadgeCheck, Minus
} from "lucide-react";
import CodeBackground from "@/components/CodeBackground";
import AIBrainField from "@/components/AIBrainField";
import BrainHUD from "@/components/BrainHUD";
import IntroScreen from "@/components/IntroScreen";
import ScrollProgress from "@/components/ScrollProgress";

// ─── Magnetic Button ──────────────────────────────────────────────────────

function MagneticButton({ children, className = "", strength = 0.3 }: {
  children: React.ReactNode; className?: string; strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      <motion.div style={{ x: sx, y: sy }}>
        {children}
      </motion.div>
    </div>
  );
}

// ─── 3D Tilt ──────────────────────────────────────────────────────────────

function TiltCard({ children, className = "", intensity = 8 }: {
  children: React.ReactNode; className?: string; intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 250, damping: 35 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 250, damping: 35 });
  const glow = useTransform([mx, my], ([lx, ly]) =>
    `radial-gradient(300px circle at ${lx}px ${ly}px, rgba(184,80,255,0.1), transparent 65%)`
  );
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
    mx.set(e.clientX - r.left); my.set(e.clientY - r.top);
  };
  return (
    <div ref={ref} className={`perspective-[1000px] ${className}`}
      onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }} className="relative">
        <motion.div className="absolute inset-0 rounded-[inherit] pointer-events-none z-10" style={{ background: glow }} />
        {children}
      </motion.div>
    </div>
  );
}

// ─── Animated number ──────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let v = 0; const step = target / 60;
    const id = setInterval(() => {
      v += step;
      if (v >= target) { setN(target); clearInterval(id); }
      else setN(Math.floor(v));
    }, 22);
    return () => clearInterval(id);
  }, [inView, target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

// ─── Marquee ──────────────────────────────────────────────────────────────

const TECHS = ["React", "TypeScript", "Node.js", "Python", "Next.js", "PostgreSQL", "Docker",
  "Tailwind CSS", "OpenAI API", "AWS", "Vite", "GraphQL", "Redis", "Stripe", "Vercel", "Prisma", "Supabase", "Framer Motion"];

function Marquee({ reverse = false }: { reverse?: boolean }) {
  const items = [...TECHS, ...TECHS];
  return (
    <div className="relative overflow-hidden py-3">
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-black/60 to-transparent" />
      <motion.div className="flex gap-4 w-max"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {items.map((t, i) => (
          <div key={i} className="px-4 py-1.5 rounded-full border border-primary/12 bg-primary/5 text-sm font-medium text-muted-foreground whitespace-nowrap hover:border-primary/45 hover:text-primary transition-all duration-300 cursor-default">
            {t}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Magnetic cursor ──────────────────────────────────────────────────────

function useMagneticCursor() {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 40, damping: 20 });
  const sy = useSpring(y, { stiffness: 40, damping: 20 });
  useEffect(() => {
    const mv = (e: MouseEvent) => {
      x.set((e.clientX - window.innerWidth / 2) / window.innerWidth * 24);
      y.set((e.clientY - window.innerHeight / 2) / window.innerHeight * 24);
    };
    window.addEventListener("mousemove", mv);
    return () => window.removeEventListener("mousemove", mv);
  }, [x, y]);
  return { springX: sx, springY: sy };
}

// ─── Noise overlay ────────────────────────────────────────────────────────

const NoiseOverlay = () => (
  <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.022]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: "128px 128px", mixBlendMode: "overlay",
    }}
  />
);

// ─── Glitch text ──────────────────────────────────────────────────────────

function GlitchText({ children, className = "", style = {} }: { children: string; className?: string; style?: React.CSSProperties }) {
  const [g, setG] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => { setG(true); setTimeout(() => setG(false), 180); }, 5000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className={`relative inline-block ${className}`} style={style}>
      {g && <>
        <span className="absolute inset-0 text-[#f050c8] translate-x-[2.5px] translate-y-[-1px] opacity-75" aria-hidden>{children}</span>
        <span className="absolute inset-0 text-primary translate-x-[-2.5px] translate-y-[1px] opacity-75" aria-hidden>{children}</span>
      </>}
      {children}
    </span>
  );
}

// ─── Animated gradient border card ────────────────────────────────────────

function GradientBorderCard({ children, className = "", animated = false }: { children: React.ReactNode; className?: string; animated?: boolean }) {
  if (animated) {
    return (
      <div className={`relative rounded-2xl animated-border ${className}`}
        style={{ background: "rgba(13,8,32,0.9)" }}>
        <div className="relative rounded-[15px] w-full h-full">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className={`relative rounded-2xl p-[1px] ${className}`}
      style={{ background: "linear-gradient(135deg, rgba(184,80,255,0.45), rgba(240,80,200,0.25), rgba(184,80,255,0.08), rgba(240,80,200,0.35))" }}>
      <div className="relative rounded-[15px] w-full h-full"
        style={{ background: "rgba(9,5,22,0.95)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(8,6,18,0.4)", "rgba(8,6,18,0.95)"]);
  const links = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Process", href: "#process" },
    { label: "Work", href: "#work" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <motion.header className="fixed top-0 w-full z-40 border-b border-white/[0.04]"
      style={{
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        backgroundColor: bg,
        boxShadow: "0 1px 0 rgba(184,80,255,0.08), 0 4px 32px rgba(0,0,0,0.4)",
      }}>
      <div className="container mx-auto px-6 h-[68px] flex items-center justify-between">
        <motion.a href="#" className="text-2xl font-bold tracking-tighter flex items-center gap-0.5" whileHover={{ scale: 1.04 }}>
          <GlitchText className="text-primary" style={{ textShadow: "0 0 20px rgba(184,80,255,0.9)" }}>py</GlitchText>
          <span className="text-foreground">Kode</span>
          <motion.span className="text-primary/50"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>.</motion.span>
        </motion.a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l, i) => (
            <motion.a key={l.label} href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }} whileHover={{ y: -1 }}>
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
          <a href="/login"
            className="text-sm font-medium text-muted-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5 border border-white/[0.08] hover:border-primary/30 px-3 py-1.5 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Client Portal
          </a>
          <MagneticButton>
            <Button asChild variant="outline"
              className="border-primary/35 text-primary hover:bg-primary hover:text-black shadow-[0_0_20px_rgba(184,80,255,0.2)] hover:shadow-[0_0_40px_rgba(184,80,255,0.6)] transition-all duration-300">
              <a href="#contact">Hire Me</a>
            </Button>
          </MagneticButton>
        </nav>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#080612]/98 backdrop-blur-2xl border-b border-white/5">
            <div className="p-6 flex flex-col gap-4">
              {links.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">{l.label}</a>
              ))}
              <a href="/login" onClick={() => setOpen(false)}
                className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">Client Portal</a>
              <Button asChild className="w-full mt-4 bg-primary text-black">
                <a href="#contact" onClick={() => setOpen(false)}>Hire Me</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────

const Hero = () => {
  const { springX, springY } = useMagneticCursor();

  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-15%,rgba(184,80,255,0.28),transparent)]" />
      {/* Side ambient blobs — CSS animations (GPU-only, zero JS overhead) */}
      <div className="hero-blob-left absolute -left-56 top-1/4 w-[520px] h-[520px] rounded-full blur-[90px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(184,85,255,0.5), transparent)" }} />
      <div className="hero-blob-right absolute -right-56 bottom-1/4 w-[520px] h-[520px] rounded-full blur-[90px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(240,80,200,0.4), transparent)" }} />
      <div className="hero-blob-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(140,60,255,0.09), transparent)" }} />
      <div className="absolute bottom-0 inset-x-0 h-52 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left */}
        <div className="flex flex-col gap-7">
          <motion.div
            className="shimmer-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full w-fit text-sm font-medium"
            style={{ background: "rgba(184,80,255,0.07)", border: "1px solid rgba(184,80,255,0.25)", color: "rgba(200,130,255,0.95)", boxShadow: "0 0 20px rgba(184,80,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.div className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ boxShadow: "0 0 8px rgba(184,80,255,0.8)" }} />
            Available for new projects
          </motion.div>

          <h1 className="text-[clamp(2.6rem,5.5vw,4.8rem)] font-bold leading-[1.07] tracking-tight">
            {["Build Faster.", "Build Smarter.", "Dominate."].map((line, i) => (
              <motion.span key={i} className="block"
                initial={{ opacity: 0, y: 55, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 0.12 + i * 0.22, ease: [0.22, 1, 0.36, 1] }}>
                {i === 2
                  ? <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-300 to-accent"
                      style={{ filter: "drop-shadow(0 0 48px rgba(184,80,255,0.7)) drop-shadow(0 0 120px rgba(184,80,255,0.3))" }}>{line}
                    </span>
                  : line}
              </motion.span>
            ))}
          </h1>

          <motion.p className="text-lg text-muted-foreground max-w-md leading-relaxed"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.85 }}>
            I'm Kode — a full-stack engineer who ships what agencies charge <span className="text-foreground font-semibold">10x more</span> for. Modern web products, built at machine speed, with human precision.
          </motion.p>

          <motion.div className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}>
            <MagneticButton>
              <Button size="lg" asChild
                className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-primary to-fuchsia-500 text-white hover:from-fuchsia-500 hover:to-primary shadow-[0_0_40px_rgba(184,80,255,0.55)] hover:shadow-[0_0_65px_rgba(184,80,255,0.85)] transition-all duration-300">
                <a href="#contact">Start a Project <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button size="lg" variant="outline" asChild
                className="h-12 px-8 text-base border-white/10 bg-white/[0.025] hover:bg-white/[0.06] backdrop-blur-sm transition-all duration-300">
                <a href="#work">View Work</a>
              </Button>
            </MagneticButton>
          </motion.div>

          {/* Social proof */}
          <motion.div className="flex items-center gap-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
            <div className="flex -space-x-2.5">
              {["#b855ff", "#f050c8", "#9333ea", "#d946ef", "#a21caf"].map((c, i) => (
                <motion.div key={i} className="w-8 h-8 rounded-full border-2 border-[#080612] ring-1 ring-white/10"
                  style={{ background: `radial-gradient(circle at 38% 38%, #fff 0%, ${c} 65%)` }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.08 }} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-sm text-muted-foreground"><span className="text-primary font-semibold">12+</span> satisfied clients globally</p>
            </div>
          </motion.div>

          {/* Trusted-by strip */}
          <motion.div className="pt-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.55 }}>
            <p className="text-[10px] text-muted-foreground/45 tracking-[0.25em] uppercase mb-3">Trusted by founders at</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {["TechStart.io", "NovaBrand", "Finova Labs", "Aura Studio", "Synthetix AI"].map((name, i) => (
                <motion.span key={i} className="text-xs font-bold text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors duration-300 tracking-wide cursor-default"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 + i * 0.08 }}>
                  {name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — Interactive Particle Field */}
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>

          {/* Deep ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(184,80,255,0.13) 0%, transparent 70%)" }} />

          {/* Particle canvas — borderless, free-floating */}
          <div className="relative">
            <AIBrainField width={520} height={440} />
            {/* Ultra-subtle scanlines */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(120,160,255,0.005) 3px, rgba(120,160,255,0.005) 6px)",
              }} />
            {/* HUD panel */}
            <BrainHUD />
          </div>

          {/* Floating tech badges */}
          {[
            { label: "React + TS", icon: "⚛", x: -70, y: -170 },
            { label: "Node.js",   icon: "🟢", x: -90, y:  160 },
            { label: "AI Powered",icon: "✦",  x:  200, y:   20 },
          ].map(({ label, icon, x, y }, i) => (
            <motion.div key={i}
              className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/22 bg-[#080612]/90 backdrop-blur-md text-xs font-semibold text-foreground z-20 whitespace-nowrap"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: "translate(-50%,-50%)",
                boxShadow: "0 0 18px rgba(184,80,255,0.15), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.2 + i * 0.7, delay: i * 0.45, repeat: Infinity, ease: "easeInOut" }}>
              <span>{icon}</span>{label}
            </motion.div>
          ))}

          {/* Hint text */}
          <motion.p
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase whitespace-nowrap"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}>
            Mișcă mouse-ul peste simbol
          </motion.p>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
        <span className="text-[10px] text-muted-foreground/45 tracking-[0.4em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-primary/60 to-transparent" />
      </motion.div>
    </section>
  );
};

// ─── Tech Stack ───────────────────────────────────────────────────────────

const TechStack = () => (
  <div className="relative py-3 overflow-hidden bg-black/55"
    style={{ borderTop: "1px solid rgba(184,80,255,0.12)", borderBottom: "1px solid rgba(184,80,255,0.12)" }}>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(184,80,255,0.06),transparent_70%)]" />
    <Marquee />
    <Marquee reverse />
  </div>
);

// ─── About ────────────────────────────────────────────────────────────────

const About = () => {
  const features = [
    { icon: <Rocket size={17} className="text-primary" />, title: "Rapid Delivery", desc: "From concept to production in days, not months." },
    { icon: <Shield size={17} className="text-accent" />, title: "Production Quality", desc: "Enterprise-grade code built on modern best practices." },
    { icon: <Terminal size={17} className="text-primary" />, title: "Direct Access", desc: "No middlemen. You talk directly to the engineer." },
    { icon: <Cpu size={17} className="text-accent" />, title: "AI-Powered", desc: "Leveraging cutting-edge LLMs for 10x faster iteration." },
  ];

  return (
    <section id="about" className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(240,80,200,0.09),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_80%,rgba(184,80,255,0.07),transparent_50%)]" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-8">
              <Sparkles size={10} /> The Engineer Advantage
            </div>
            <h2 className="text-4xl md:text-[3.2rem] font-bold mb-6 leading-[1.1] tracking-tight">
              One Developer.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-fuchsia-400 to-accent">Infinite Leverage.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-5 leading-relaxed">
              Traditional development is slow and expensive. By integrating AI at every layer of my workflow, I ship faster than entire teams — without sacrificing a single pixel of quality.
            </p>
            <p className="text-muted-foreground text-lg mb-14 leading-relaxed">
              You don't just get a developer. You get a <span className="text-foreground font-semibold">complete engineering department</span> — one point of contact, zero overhead, zero excuses.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[{ value: 10, suffix: "x", label: "Faster Dev" }, { value: 100, suffix: "%", label: "Direct Access" }, { value: 0, suffix: "", label: "Bureaucracy" }].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.13 }}>
                  <div className="relative">
                    <div className="text-5xl font-black text-primary tracking-tighter" style={{ textShadow: "0 0 30px rgba(184,80,255,0.8), 0 0 60px rgba(184,80,255,0.3)" }}>
                      <AnimatedNumber target={s.value} suffix={s.suffix} />
                    </div>
                    <motion.div className="absolute -bottom-1 left-0 h-[2px] w-8 bg-gradient-to-r from-primary to-transparent rounded-full"
                      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.13 + 0.4, duration: 0.6 }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-3 tracking-[0.18em] uppercase font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <LiveTerminal />
            <div className="grid grid-cols-2 gap-3 mt-1">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                  <div className="group flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/25 hover:bg-primary/5 transition-all duration-300">
                    <div className="h-8 w-8 rounded-lg bg-black/60 border border-white/[0.07] flex items-center justify-center flex-shrink-0 group-hover:border-primary/25 transition-all">{f.icon}</div>
                    <div>
                      <div className="text-xs font-bold mb-0.5">{f.title}</div>
                      <p className="text-[11px] text-muted-foreground/65 leading-snug">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Process ──────────────────────────────────────────────────────────────

const Process = () => {
  const steps = [
    { num: "01", icon: <MessageSquare size={22} />, title: "Discovery Call", desc: "We map your vision, goals, and constraints. I ask the right questions, identify risks early, and confirm the scope before a single line of code is written.", color: "from-primary to-fuchsia-500", time: "~45 min" },
    { num: "02", icon: <Settings size={22} />, title: "Architecture & Plan", desc: "I design the full technical blueprint — stack selection, database schema, API contracts, auth model, and deployment strategy — delivered as a spec doc.", color: "from-fuchsia-500 to-accent", time: "1–2 days" },
    { num: "03", icon: <Code2 size={22} />, title: "AI-Powered Build", desc: "Focused sprints with daily progress updates and a live preview link from day 1. AI tooling accelerates iteration without cutting corners on quality.", color: "from-accent to-primary", time: "1–4 weeks" },
    { num: "04", icon: <Rocket size={22} />, title: "Launch & Handover", desc: "Zero-downtime deploy, full code walkthrough, and documentation handover. Post-launch bug fixes included. Ongoing maintenance available on retainer.", color: "from-primary to-fuchsia-500", time: "1 day" },
  ];

  return (
    <section id="process" className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(184,80,255,0.07),transparent_55%)]" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 text-primary text-xs font-medium tracking-[0.2em] uppercase mb-6">
            <Sparkles size={10} /> How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-accent">Process</span>
          </h2>
          <p className="text-muted-foreground text-lg">From first message to shipped product — a clear, relentless process with zero guesswork.</p>
        </motion.div>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px z-0">
            <motion.div className="h-full bg-gradient-to-r from-primary via-accent to-primary"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ transformOrigin: "left", opacity: 0.35 }} />
            {/* Animated pulse along line */}
            <motion.div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_rgba(184,80,255,0.9)]"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}>
                <TiltCard intensity={6}>
                  <GradientBorderCard>
                    <div className="p-6">
                      {/* Number + icon */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-[0_0_20px_rgba(184,80,255,0.4)] flex-shrink-0 text-white`}>
                            {s.icon}
                          </div>
                          <span className="text-4xl font-bold text-white/8 select-none">{s.num}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50 border border-white/[0.07] px-2 py-0.5 rounded-full font-mono">{(s as any).time}</span>
                      </div>
                      <h3 className="text-base font-bold mb-2 tracking-tight">{s.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </GradientBorderCard>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Services ─────────────────────────────────────────────────────────────

const Services = () => {
  const services = [
    { icon: <Globe size={28} />, title: "Full-Stack Web Apps", desc: "End-to-end SaaS, dashboards, and platforms — React/Next.js frontend, Node.js backend, PostgreSQL, Redis, and WebSockets. Shipped and production-ready.", glow: "184,80,255", accent: "text-primary" },
    { icon: <Layers size={28} />, title: "Landing Pages", desc: "Conversion-obsessed, pixel-perfect marketing sites. GSAP animations, 95+ Lighthouse score, Core Web Vitals compliant. Every pixel earns its place.", glow: "240,80,200", accent: "text-accent" },
    { icon: <Zap size={28} />, title: "AI / LLM Integration", desc: "Inject GPT-4, Claude, or custom fine-tuned models into your product. RAG pipelines, vector search, streaming, function-calling — all production-ready.", glow: "184,80,255", accent: "text-primary" },
    { icon: <Server size={28} />, title: "DevOps & Infrastructure", desc: "AWS / GCP / Vercel setup, Docker containers, CI/CD pipelines, monitoring, and autoscaling — so your app survives going viral.", glow: "240,80,200", accent: "text-accent" },
  ];

  return (
    <section id="services" className="py-40 relative">
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(184,80,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(184,80,255,0.028)_1px,transparent_1px)] bg-[size:55px_55px]" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(184,80,255,0.05),transparent_65%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 text-primary text-xs font-medium tracking-[0.2em] uppercase mb-6">
            <Sparkles size={10} /> What I Build
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Engineering{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Capabilities</span>
          </h2>
          <p className="text-muted-foreground text-lg">Comprehensive solutions spanning the entire modern stack — from pixel to production.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <TiltCard intensity={8} className="h-full">
                <Card className="relative h-full bg-background/70 border-white/[0.06] hover:border-primary/45 transition-all duration-500 group backdrop-blur-md overflow-hidden"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 0 rgba(184,80,255,0)" }}>
                  {/* Top glow on hover */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="pb-3">
                    <motion.div className={`${s.accent} mb-5 w-fit p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] group-hover:border-primary/25 group-hover:bg-primary/8 transition-all duration-300`}
                      whileHover={{ scale: 1.12, rotate: 6 }} transition={{ duration: 0.25 }}
                      style={{ filter: `drop-shadow(0 0 14px rgba(${s.glow},0.7))` }}>
                      {s.icon}
                    </motion.div>
                    <CardTitle className="text-base font-bold tracking-tight">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1.5px] bg-gradient-to-r from-primary via-fuchsia-400 to-accent transition-all duration-700" />
                  {/* Corner glow */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, rgba(${s.glow},0.12), transparent 70%)` }} />
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Work ─────────────────────────────────────────────────────────────────

const Work = () => {
  const projects = [
    {
      title: "Nexus Dashboard",
      category: "SaaS · Full-Stack",
      image: "/portfolio-1.png",
      accent: "184,80,255",
      tag: "React + Node.js",
      desc: "Real-time analytics SaaS with multi-tenant architecture, role-based access, Stripe billing, and live WebSocket data streaming. Shipped in 18 days.",
      tech: ["React", "Node.js", "PostgreSQL", "Redis", "Stripe"],
      stat: { label: "Delivery", value: "18 days" },
    },
    {
      title: "Aura Commerce",
      category: "E-Commerce · Stripe",
      image: "/portfolio-2.png",
      accent: "240,80,200",
      tag: "Next.js + Postgres",
      desc: "High-conversion storefront with AI-powered product recommendations, one-click checkout, abandoned cart recovery, and headless CMS integration.",
      tech: ["Next.js", "Postgres", "Stripe", "Sanity", "Vercel"],
      stat: { label: "Conversion lift", value: "+34%" },
    },
    {
      title: "Synthetix AI",
      category: "AI Platform · OpenAI",
      image: "/portfolio-3.png",
      accent: "147,51,234",
      tag: "Python + React",
      desc: "Enterprise AI document intelligence platform: GPT-4 fine-tuning, vector search via Pinecone, secure SOC2-compliant infrastructure, and a custom LLM chain.",
      tech: ["Python", "React", "OpenAI", "Pinecone", "FastAPI"],
      stat: { label: "Docs processed", value: "1M+" },
    },
    {
      title: "PulseHR",
      category: "HR Tech · B2B SaaS",
      image: "/portfolio-1.png",
      accent: "240,80,200",
      tag: "Next.js + Prisma",
      desc: "AI-powered HR platform with onboarding automation, performance tracking, 360° feedback loops, and payroll integrations for teams of 10–500.",
      tech: ["Next.js", "Prisma", "Clerk Auth", "OpenAI", "AWS"],
      stat: { label: "Clients using", value: "340+ teams" },
    },
  ];

  return (
    <section id="work" className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,rgba(184,80,255,0.06),transparent_55%)]" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/25 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-5">
              <Sparkles size={10} /> Portfolio
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              Selected{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Work</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg">Every project is a case study in velocity, quality, and business impact.</p>
          </motion.div>
          <MagneticButton>
            <Button variant="ghost" className="text-primary border border-primary/20 hover:bg-primary/8 hover:border-primary/45">
              View All on GitHub <Github className="ml-2 h-4 w-4" />
            </Button>
          </MagneticButton>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.12 }}>
              <TiltCard intensity={4} className="h-full">
                <motion.div className="group relative rounded-2xl overflow-hidden border border-white/[0.07] bg-black/80 cursor-pointer h-full"
                  whileHover={{ boxShadow: `0 40px 90px rgba(0,0,0,0.75), 0 0 60px rgba(${p.accent},0.18)` }}>
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-[16/9]">
                    <img src={p.image} alt={p.title}
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at 50% 50%, rgba(${p.accent},0.12), transparent 65%)` }} />
                    {/* Badges on image */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full border border-white/10 bg-black/70 backdrop-blur-md text-[10px] font-medium text-muted-foreground">
                      {p.tag}
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: `rgba(${p.accent},0.18)`, border: `1px solid rgba(${p.accent},0.35)`, color: `rgb(${p.accent})` }}>
                      {p.stat.label}: {p.stat.value}
                    </div>
                    {/* External link */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center backdrop-blur-md">
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: `rgb(${p.accent})` }}>{p.category}</p>
                    <h3 className="text-xl font-bold tracking-tight mb-3">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
                    {/* Tech chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.tech.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-lg text-[10px] font-medium border border-white/[0.08] text-muted-foreground/70"
                          style={{ background: "rgba(255,255,255,0.025)" }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom glow line */}
                  <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1.5px] transition-all duration-700"
                    style={{ background: `linear-gradient(to right, rgba(${p.accent},0.7), transparent)` }} />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `inset 0 0 0 1px rgba(${p.accent},0.22)` }} />
                </motion.div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Pricing ──────────────────────────────────────────────────────────────

const Pricing = () => {
  const tiers = [
    { name: "Starter", price: "$300", period: "one-time", desc: "Landing page or portfolio site — clean, fast, and ready to go live.", features: ["1–3 Pages", "Mobile Responsive", "Basic SEO", "Contact Form", "5–7 Day Delivery", "1 Revision Round"], notFeatures: ["Auth / Database", "Payment Processing"] },
    { name: "Pro", price: "$800", period: "one-time", isPopular: true, desc: "A complete web app with backend, auth, and everything you need to launch.", features: ["Full-Stack Web App", "User Authentication", "Database (PostgreSQL)", "REST API", "2–3 Week Delivery", "2 Revision Rounds", "30-Day Bug Support"], notFeatures: [] },
    { name: "Custom", price: "Let's talk", period: "scoped", desc: "Bigger project? AI features, complex infra, or ongoing work — we'll scope it together.", features: ["Custom Scope & Timeline", "AI / LLM Integration", "Third-party Integrations", "Priority Support", "Unlimited Revisions"], notFeatures: [] },
  ];

  return (
    <section id="pricing" className="py-40 relative">
      <div className="absolute inset-0 bg-black/42" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(184,80,255,0.1),transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 text-primary text-xs font-medium tracking-[0.2em] uppercase mb-6">
            <Sparkles size={10} /> Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg">No hidden fees. Flat rates for defined scope, custom quotes for complex builds.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }}>
              <TiltCard intensity={5} className="h-full">
                {tier.isPopular ? (
                  <GradientBorderCard animated className="h-full">
                    <PricingCardInner tier={tier} />
                  </GradientBorderCard>
                ) : (
                  <Card className="h-full relative overflow-hidden bg-white/[0.02] border-white/[0.06] hover:border-white/[0.14] transition-all duration-300">
                    <PricingCardInner tier={tier} />
                  </Card>
                )}
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <motion.div className="flex flex-wrap items-center justify-center gap-8 mt-16"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          {[{ icon: <Shield size={14} />, text: "Satisfaction Guarantee" }, { icon: <Clock size={14} />, text: "On-Time Delivery" }, { icon: <Star size={14} />, text: "5-Star Rated" }].map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary">{b.icon}</span>{b.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

function PricingCardInner({ tier }: { tier: any }) {
  return (
    <div className="p-7 h-full flex flex-col">
      {tier.isPopular && (
        <div className="absolute top-5 right-5 bg-gradient-to-r from-primary to-fuchsia-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full tracking-widest uppercase"
          style={{ boxShadow: "0 0 16px rgba(184,80,255,0.5)" }}>
          Most Popular
        </div>
      )}
      <div className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground/60 mb-2">{tier.name}</div>
      <div className="mb-2 flex items-end gap-1">
        <span className="text-4xl font-black tracking-tighter" style={tier.isPopular ? { background: "linear-gradient(to right,#b855ff,#f050c8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}}>{tier.price}</span>
        <span className="text-xs text-muted-foreground mb-1.5">/ {tier.period}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{tier.desc}</p>
      <ul className="space-y-2.5 mb-6 flex-1">
        {tier.features.map((f: string, j: number) => (
          <li key={j} className="flex items-center gap-3 text-sm text-foreground/80">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />{f}
          </li>
        ))}
        {tier.notFeatures?.map((f: string, j: number) => (
          <li key={`n${j}`} className="flex items-center gap-3 text-sm text-muted-foreground/40 line-through">
            <Minus className="w-4 h-4 shrink-0 text-muted-foreground/30" />{f}
          </li>
        ))}
      </ul>
      <MagneticButton className="w-full" strength={0.15}>
        <Button asChild className={`w-full font-semibold transition-all duration-300 ${
          tier.isPopular
            ? "bg-gradient-to-r from-primary to-fuchsia-500 text-white hover:from-fuchsia-500 hover:to-primary shadow-[0_0_30px_rgba(184,80,255,0.45)] hover:shadow-[0_0_50px_rgba(184,80,255,0.7)]"
            : "border-white/10 hover:bg-white/[0.06]"
        }`} variant={tier.isPopular ? "default" : "outline"}>
          <a href="#contact">{tier.name === "AI+" ? "Get a Quote" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" /></a>
        </Button>
      </MagneticButton>
    </div>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
          { from_name: form.name, from_email: form.email, message: form.message },
          EMAILJS_PUBLIC_KEY
        );
        toast({ title: "✦ Message Transmitted!", description: "I'll respond within 24 hours." });
      } else {
        await new Promise(r => setTimeout(r, 1200));
        toast({ title: "✦ Demo Mode Active", description: "Configure VITE_EMAILJS_* env vars to enable real email." });
      }
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast({ title: "Transmission Failed", description: "Please try again or reach out directly.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(184,80,255,0.11),transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(184,80,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(184,80,255,0.018)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-6 relative z-10 max-w-2xl">
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 text-primary text-xs font-medium tracking-[0.2em] uppercase mb-6">
            <Sparkles size={10} /> Let's Work Together
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-400 to-accent">Initialize</span> Connection
          </h2>
          <p className="text-muted-foreground text-lg">Ready to build something extraordinary? I respond within 24 hours — no bots, no agencies.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <TiltCard intensity={2}>
            <GradientBorderCard>
              <div className="p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[
                      { label: "Name", key: "name", type: "text", placeholder: "John Doe" },
                      { label: "Email", key: "email", type: "email", placeholder: "john@example.com" },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key} className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground tracking-[0.18em] uppercase">{label}</label>
                        <Input required type={type} value={(form as any)[key]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/50 h-12 transition-all" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground tracking-[0.18em] uppercase">Project Details</label>
                    <Textarea required rows={6} value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell me about your project — what are you building, timeline, and budget?"
                      className="bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/50 resize-none transition-all" />
                  </div>
                  <MagneticButton className="w-full" strength={0.1}>
                    <Button type="submit" disabled={isSubmitting}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-fuchsia-500 text-white hover:from-fuchsia-500 hover:to-primary shadow-[0_0_30px_rgba(184,80,255,0.45)] hover:shadow-[0_0_55px_rgba(184,80,255,0.7)] transition-all duration-300">
                      {isSubmitting
                        ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>Transmitting signal...</motion.span>
                        : <><Send className="mr-2 h-4 w-4" />Send Transmission</>}
                    </Button>
                  </MagneticButton>
                </form>
              </div>
            </GradientBorderCard>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────

const StatsBar = () => {
  const stats = [
    { num: 47, suffix: "+", label: "Projects Shipped", icon: <Rocket size={18} />, sub: "From MVP to enterprise scale" },
    { num: 3,  suffix: "+", label: "Years Engineering", icon: <Award size={18} />, sub: "Professional production work" },
    { num: 12, suffix: "+", label: "Happy Clients", icon: <Users size={18} />, sub: "Across 3 continents" },
    { num: 99, suffix: ".9%", label: "Uptime Average", icon: <TrendingUp size={18} />, sub: "Across all production systems" },
  ];
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(184,80,255,0.06),transparent_65%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }}
              className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/18 group-hover:border-primary/40 transition-all duration-300"
                style={{ boxShadow: "0 0 20px rgba(184,80,255,0.12)" }}>
                {s.icon}
              </div>
              <div className="text-5xl lg:text-6xl font-black tracking-tighter mb-1"
                style={{ background: "linear-gradient(135deg, #fff 0%, #d4aaff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 30px rgba(184,80,255,0.5))" }}>
                <AnimatedNumber target={s.num} suffix={s.suffix} />
              </div>
              <div className="text-sm font-bold text-foreground mb-1 tracking-tight">{s.label}</div>
              <div className="text-xs text-muted-foreground/60">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Live Terminal ─────────────────────────────────────────────────────────

const TERMINAL_LINES = [
  { delay: 0,    type: "cmd",    text: "$ ai-dev init --client=\"TechStartup\" --stack=nextjs" },
  { delay: 600,  type: "ok",     text: "✓ Environment configured in 0.3s" },
  { delay: 1000, type: "ok",     text: "✓ TypeScript strict mode enabled" },
  { delay: 1400, type: "blank",  text: "" },
  { delay: 1500, type: "cmd",    text: "$ ai --generate components --smart --count=18" },
  { delay: 2200, type: "ok",     text: "✓ 18 components generated" },
  { delay: 2600, type: "ok",     text: "✓ Types inferred — 0 errors" },
  { delay: 3000, type: "ok",     text: "✓ Unit tests written automatically" },
  { delay: 3400, type: "blank",  text: "" },
  { delay: 3500, type: "cmd",    text: "$ ai --build --optimize --target=production" },
  { delay: 4200, type: "ok",     text: "✓ Bundle: 87kb (gzip) — 68% smaller than avg" },
  { delay: 4700, type: "ok",     text: "✓ Core Web Vitals: 99 / 100 / 100" },
  { delay: 5200, type: "blank",  text: "" },
  { delay: 5300, type: "cmd",    text: "$ deploy --provider=vercel --regions=global" },
  { delay: 6000, type: "ok",     text: "✓ CDN deployed — 23 edge regions" },
  { delay: 6500, type: "ok",     text: "✓ SSL + DDoS protection enabled" },
  { delay: 7000, type: "success",text: "🚀 LIVE → client-app.vercel.app" },
  { delay: 7400, type: "metric", text: "   Response: 61ms  |  Uptime: 99.9%  |  Time: 11 days" },
];

function LiveTerminal() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [restartKey, setRestartKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    setVisibleLines([]);
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(prev => [...prev, i]), line.delay));
    });
    const resetTimer = setTimeout(() => {
      setVisibleLines([]);
      setRestartKey(k => k + 1);
    }, 11000);
    timers.push(resetTimer);
    return () => timers.forEach(t => clearTimeout(t));
  }, [inView, restartKey]);

  return (
    <div ref={ref} className="relative rounded-2xl overflow-hidden"
      style={{ background: "rgba(4,2,14,0.95)", border: "1px solid rgba(184,80,255,0.15)", boxShadow: "0 0 60px rgba(184,80,255,0.08), 0 40px 80px rgba(0,0,0,0.5)" }}>
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]"
        style={{ background: "rgba(8,4,24,0.9)" }}>
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-[11px] text-muted-foreground/50 font-mono tracking-wider">AI-DEV — zsh — 80×24</span>
        <div className="ml-auto flex items-center gap-1.5">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[10px] text-green-400/70 font-mono">LIVE</span>
        </div>
      </div>
      {/* Terminal body */}
      <div className="p-5 font-mono text-[12px] leading-[1.7] min-h-[280px] space-y-0.5">
        <AnimatePresence>
          {TERMINAL_LINES.map((line, i) =>
            visibleLines.includes(i) ? (
              <motion.div key={`${restartKey}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={
                  line.type === "cmd"     ? "text-primary font-semibold" :
                  line.type === "ok"      ? "text-green-400/90" :
                  line.type === "success" ? "text-fuchsia-300 font-bold text-[13px]" :
                  line.type === "metric"  ? "text-blue-300/70 text-[11px]" :
                  "h-2"
                }>
                {line.text}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        {/* blinking cursor */}
        <motion.span className="inline-block w-2 h-4 bg-primary/70 ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
      </div>
    </div>
  );
}

// ─── Booking ───────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOTS = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const TAKEN = new Set(["Mon-9:00", "Mon-10:00", "Wed-11:00", "Thu-14:00", "Fri-9:00"]);

const Booking = () => {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay]   = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep]                 = useState<"pick" | "form" | "done">("pick");
  const [sending, setSending]           = useState(false);
  const [form, setForm]                 = useState({ name: "", email: "", brief: "" });

  const now = new Date();
  const diffToMon = now.getDay() === 0 ? 1 : 8 - now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);

  const dayDates = DAYS.map((d, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return { label: d, date: dt.getDate(), month: dt.toLocaleString("en", { month: "short" }) };
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.brief) return;
    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:    form.name,
          from_email:   form.email,
          message:      `📅 BOOKING REQUEST\n\nZi: ${selectedDay} · Ora: ${selectedSlot}\n\nProiect:\n${form.brief}`,
          booking_day:  selectedDay,
          booking_slot: selectedSlot,
          reply_to:     form.email,
        },
        EMAILJS_PUBLIC_KEY
      );
      setStep("done");
    } catch {
      toast({ title: "Failed to send", description: "Please try again or contact us directly by email.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setStep("pick"); setSelectedDay(null); setSelectedSlot(null);
    setForm({ name: "", email: "", brief: "" });
  };

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(184,80,255,0.07),transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(184,80,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(184,80,255,0.018)_1px,transparent_1px)] bg-[size:70px_70px]" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="container mx-auto px-6 relative z-10 max-w-3xl">
        <motion.div className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 text-primary text-xs font-medium tracking-[0.2em] uppercase mb-6">
            <Send size={10} /> Schedule a Session
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Pick a slot.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Send your details.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Select a day and time, share a few details about your project — I'll reply by email within 2 hours.
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {["Pick a slot", "Project details", "Confirmed"].map((label, i) => {
            const stepIdx = step === "pick" ? 0 : step === "form" ? 1 : 2;
            return (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${i <= stepIdx ? "text-primary" : "text-muted-foreground/40"}`}>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${i < stepIdx ? "bg-primary border-primary text-white" : i === stepIdx ? "border-primary text-primary" : "border-white/10 text-muted-foreground/30"}`}>
                    {i < stepIdx ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 max-w-[60px] h-px transition-colors ${i < stepIdx ? "bg-primary/50" : "bg-white/[0.07]"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: slot picker ── */}
          {step === "pick" && (
            <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <GradientBorderCard>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-semibold">Pick a day — next week</p>
                    <span className="text-xs text-muted-foreground/50 border border-white/[0.07] px-2 py-0.5 rounded-full font-mono">EET · UTC+2</span>
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-5 gap-2 mb-8">
                    {dayDates.map((d) => (
                      <motion.button key={d.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => { setSelectedDay(d.label); setSelectedSlot(null); }}
                        className={`flex flex-col items-center py-3 rounded-xl border transition-all duration-200 ${selectedDay === d.label ? "border-primary bg-primary/12 shadow-[0_0_20px_rgba(184,80,255,0.25)]" : "border-white/[0.07] bg-white/[0.02] hover:border-primary/30 hover:bg-primary/5"}`}>
                        <span className="text-[10px] text-muted-foreground/60 tracking-wider uppercase mb-1">{d.label}</span>
                        <span className={`text-xl font-bold ${selectedDay === d.label ? "text-primary" : ""}`}>{d.date}</span>
                        <span className="text-[10px] text-muted-foreground/50">{d.month}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Time slots */}
                  <AnimatePresence>
                    {selectedDay && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <p className="text-sm font-semibold mb-4">
                          Pick a time —{" "}
                          <span className="text-muted-foreground font-normal">
                            {selectedDay}, {dayDates.find(d => d.label === selectedDay)?.date} {dayDates.find(d => d.label === selectedDay)?.month}
                          </span>
                        </p>
                        <div className="grid grid-cols-3 gap-2 mb-8">
                          {SLOTS.map((slot) => {
                            const taken = TAKEN.has(`${selectedDay}-${slot}`);
                            return (
                              <motion.button key={slot} whileHover={taken ? {} : { scale: 1.03 }} whileTap={taken ? {} : { scale: 0.97 }}
                                disabled={taken} onClick={() => !taken && setSelectedSlot(slot)}
                                className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${taken ? "border-white/[0.04] text-muted-foreground/25 cursor-not-allowed line-through" : selectedSlot === slot ? "border-primary bg-primary/12 text-primary shadow-[0_0_16px_rgba(184,80,255,0.2)]" : "border-white/[0.07] bg-white/[0.02] hover:border-primary/30 hover:bg-primary/5"}`}>
                                {taken ? <span className="text-[11px] no-underline line-through">Taken</span> : slot}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <MagneticButton className="w-full" strength={0.12}>
                    <Button onClick={() => setStep("form")} disabled={!selectedDay || !selectedSlot}
                      className="w-full h-12 font-bold bg-gradient-to-r from-primary to-fuchsia-500 text-white shadow-[0_0_30px_rgba(184,80,255,0.35)] hover:shadow-[0_0_50px_rgba(184,80,255,0.65)] transition-all disabled:opacity-30 disabled:pointer-events-none">
                      Continue — {selectedDay && selectedSlot ? `${selectedDay} at ${selectedSlot}` : "select a slot"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </MagneticButton>
                </div>
              </GradientBorderCard>
            </motion.div>
          )}

          {/* ── STEP 2: contact form ── */}
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <GradientBorderCard>
                <form onSubmit={handleSend} className="p-8">
                  {/* Slot summary */}
                  <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-primary/8 border border-primary/20">
                    <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">Selected slot</p>
                      <p className="text-sm font-bold">{selectedDay}, {dayDates.find(d=>d.label===selectedDay)?.date} {dayDates.find(d=>d.label===selectedDay)?.month} · {selectedSlot}</p>
                    </div>
                    <button type="button" onClick={() => setStep("pick")}
                      className="ml-auto text-xs text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/40 px-2 py-1 rounded-lg transition-all">
                      Change
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 block">Your Name</label>
                      <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="John Smith" required
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 h-11" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 block">Email Address</label>
                      <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="john@company.com" required
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 h-11" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 block">About the Project</label>
                      <Textarea value={form.brief} onChange={e => setForm(f => ({ ...f, brief: e.target.value }))}
                        placeholder="What do you want to build? Preferred stack, timeline, estimated budget..." required rows={4}
                        className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 resize-none" />
                    </div>
                  </div>

                  <MagneticButton className="w-full mt-7" strength={0.12}>
                    <Button type="submit" disabled={sending || !form.name || !form.email || !form.brief}
                      className="w-full h-12 font-bold bg-gradient-to-r from-primary to-fuchsia-500 text-white shadow-[0_0_30px_rgba(184,80,255,0.35)] hover:shadow-[0_0_50px_rgba(184,80,255,0.65)] transition-all disabled:opacity-40">
                      {sending
                        ? <><motion.span animate={{ opacity: [1,0.4,1] }} transition={{ duration: 0.8, repeat: Infinity }}>Sending...</motion.span></>
                        : <><Send className="mr-2 h-4 w-4" />Send Session Request</>}
                    </Button>
                  </MagneticButton>
                </form>
              </GradientBorderCard>
            </motion.div>
          )}

          {/* ── STEP 3: success ── */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <GradientBorderCard>
                <div className="p-12 flex flex-col items-center gap-6">
                  <motion.div className="w-20 h-20 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                    <CheckCircle2 size={36} className="text-green-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Request sent! 🎉</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Slot <span className="text-foreground font-semibold">{selectedDay} at {selectedSlot}</span> has been reserved. I'll reply to <span className="text-primary font-semibold">{form.email}</span> within 2 hours.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-400/80">
                    <motion.span className="w-2 h-2 rounded-full bg-green-400" animate={{ scale: [1,1.5,1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    Email sent successfully
                  </div>
                  <Button variant="outline" className="border-white/10" onClick={reset}>
                    Book another session
                  </Button>
                </div>
              </GradientBorderCard>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="flex flex-wrap items-center justify-center gap-8 mt-10"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          {[
            { icon: <Send size={13} />, text: "Reply within 2 hours" },
            { icon: <Shield size={13} />, text: "No spam, no pitch" },
            { icon: <Zap size={13} />, text: "100% free" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary">{b.icon}</span>{b.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Comparison ────────────────────────────────────────────────────────────

const Comparison = () => {
  const rows = [
    { label: "Project Timeline",     agency: "3–6 months",            me: "2–4 weeks" },
    { label: "Starting Cost",        agency: "$15,000–$80,000",       me: "From $999" },
    { label: "Communication",        agency: "Project managers",      me: "Direct with me" },
    { label: "Code Quality",         agency: "Junior devs, varies",   me: "Senior, production grade" },
    { label: "AI Integration",       agency: "Rarely offered",        me: "Core competency" },
    { label: "Post-launch Support",  agency: "Billed separately",     me: "Included" },
    { label: "Revision Rounds",      agency: "Limited, extra cost",   me: "Included in scope" },
  ];

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/42" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(184,80,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(184,80,255,0.022)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(240,80,200,0.06),transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        <motion.div className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/25 text-accent text-xs font-medium tracking-[0.2em] uppercase mb-6">
            <Zap size={10} /> Why Not an Agency?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            pyKode{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">vs The Rest</span>
          </h2>
          <p className="text-muted-foreground text-lg">Stop paying 10x more for slower results and junior code.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {/* Table header */}
          <div className="grid grid-cols-3 gap-0 mb-2">
            <div className="px-5 py-3 text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground/50" />
            <div className="px-5 py-3 text-center text-sm font-bold text-muted-foreground/70 rounded-t-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none" }}>
              Agency / Freelancer
            </div>
            <div className="px-5 py-3 text-center rounded-t-xl relative"
              style={{ background: "linear-gradient(135deg, rgba(184,80,255,0.15), rgba(240,80,200,0.1))", border: "1px solid rgba(184,80,255,0.3)", borderBottom: "none" }}>
              <span className="text-sm font-bold text-primary">pyKode</span>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-fuchsia-500 text-white text-[9px] font-black px-3 py-0.5 rounded-full tracking-widest uppercase whitespace-nowrap"
                style={{ boxShadow: "0 0 16px rgba(184,80,255,0.5)" }}>Best Choice</div>
            </div>
          </div>

          {/* Table rows */}
          {rows.map((row, i) => (
            <motion.div key={i} className="grid grid-cols-3 gap-0"
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <div className={`px-5 py-4 text-sm font-medium text-muted-foreground border-b border-white/[0.04] ${i === rows.length - 1 ? "" : ""}`}>
                {row.label}
              </div>
              <div className="px-5 py-4 text-center text-sm text-muted-foreground/60 border-b border-x border-white/[0.04]"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-center gap-1.5">
                  <Minus size={12} className="text-red-400/60" />
                  {row.agency}
                </div>
              </div>
              <div className="px-5 py-4 text-center text-sm font-semibold border-b border-x"
                style={{ background: "rgba(184,80,255,0.05)", borderColor: "rgba(184,80,255,0.2)", color: "rgba(220,160,255,0.95)" }}>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={13} className="text-primary" />
                  {row.me}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Table footer - CTA */}
          <div className="grid grid-cols-3 gap-0">
            <div />
            <div className="px-5 py-4 rounded-b-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none" }} />
            <div className="px-5 py-4 rounded-b-xl" style={{ background: "rgba(184,80,255,0.08)", border: "1px solid rgba(184,80,255,0.25)", borderTop: "none" }}>
              <MagneticButton strength={0.15}>
                <Button asChild size="sm" className="w-full text-xs font-bold bg-gradient-to-r from-primary to-fuchsia-500 text-white shadow-[0_0_20px_rgba(184,80,255,0.4)] hover:shadow-[0_0_35px_rgba(184,80,255,0.7)] transition-all">
                  <a href="#contact">Choose pyKode <ArrowRight className="ml-1 h-3 w-3" /></a>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="relative overflow-hidden">
    {/* Premium glowing separator */}
    <div className="relative h-px">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400/80 to-transparent"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
    </div>
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(184,80,255,0.08),transparent_65%)]" />

    <div className="container mx-auto px-6 py-12 relative z-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.a href="#" className="text-xl font-bold flex items-center gap-0.5" whileHover={{ scale: 1.04 }}>
          <GlitchText className="text-primary" style={{ textShadow: "0 0 20px rgba(184,80,255,0.9)" }}>py</GlitchText>
          <span className="text-foreground">Kode</span>
          <motion.span className="text-primary/45" animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2, repeat: Infinity }}>.</motion.span>
        </motion.a>

        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-muted-foreground/55 tracking-wide text-center">
            &copy; {new Date().getFullYear()} pyKode · Engineered to Dominate.
          </p>
          <div className="flex items-center gap-1.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <p className="text-[10px] text-green-400/70 tracking-[0.2em] uppercase">All systems operational</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {[{ icon: <Github size={17} />, label: "GitHub" }, { icon: <Twitter size={17} />, label: "Twitter" }, { icon: <Linkedin size={17} />, label: "LinkedIn" }].map(s => (
            <motion.a key={s.label} href="#"
              className="w-9 h-9 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:border-primary/40 hover:bg-primary/8 transition-all duration-300"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.88 }}>
              {s.icon}<span className="sr-only">{s.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── Page ─────────────────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div className="relative h-px mx-auto max-w-4xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/70"
        style={{ boxShadow: "0 0 10px rgba(184,80,255,0.9)" }} />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-foreground" style={{ fontFeatureSettings: '"ss01","ss02"' }}>
      <IntroScreen />
      <ScrollProgress />
      <CodeBackground />
      <NoiseOverlay />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <TechStack />
          <StatsBar />
          <SectionDivider />
          <div className="cv-auto"><About /></div>
          <SectionDivider />
          <div className="cv-auto"><Process /></div>
          <SectionDivider />
          <div className="cv-auto"><Services /></div>
          <SectionDivider />
          <div className="cv-auto"><Work /></div>
          <SectionDivider />
          <div className="cv-auto"><Booking /></div>
          <SectionDivider />
          <div className="cv-auto"><Comparison /></div>
          <SectionDivider />
          <div className="cv-auto"><Pricing /></div>
          <SectionDivider />
          <div className="cv-auto"><Contact /></div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
