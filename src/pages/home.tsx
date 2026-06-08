import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Code2, Terminal, Cpu, Globe, Zap, Server, Layers, Rocket,
  CheckCircle2, Send, Github, Twitter, Linkedin, ArrowRight,
  Menu, X, Star, Shield, Clock, MessageSquare, Settings, Blocks,
  TrendingUp, Award, Users, ExternalLink, ChevronRight, Minus,
  Code, Smartphone
} from "lucide-react";
import ScrollProgress from "@/components/ScrollProgress";

// ─── Magnetic Button ──────────────────────────────────────────────────────

function useMagnetic(ref: React.RefObject<HTMLElement>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
    };
    const handleMouseLeave = () => { x.set(0); y.set(0); };
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref, x, y]);

  return {
    x: useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 }),
    y: useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 }),
  };
}

function MagneticButton({ children, className = "", href, type, onClick, disabled }: {
  children: React.ReactNode; className?: string; href?: string;
  type?: "button" | "submit"; onClick?: () => void; disabled?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { x, y } = useMagnetic(ref as React.RefObject<HTMLElement>);
  const Tag = href ? "a" : "button";
  return (
    <Tag
      ref={ref as any}
      href={href}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      <motion.span style={{ x, y }} className="block">{children}</motion.span>
    </Tag>
  );
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────

function TiltCard({ children, className = "", intensity = 8 }: {
  children: React.ReactNode; className?: string; intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 300, damping: 30 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 300, damping: 30 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  return (
    <div ref={ref} className={`perspective-[1000px] ${className}`}
      onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────

function AnimatedCounter({ from = 0, to, duration = 2 }: { from?: number; to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(from + (to - from) * easeProgress));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, from, to, duration]);

  return <span ref={ref}>{value}</span>;
}

// ─── Animated Number (interval style) ───────────────────────────────────

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

// ─── Navbar ──────────────────────────────────────────────────────────────

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 60], ["rgba(250,250,248,0)", "rgba(250,250,248,0.95)"]);
  const navBorder = useTransform(scrollY, [0, 60], ["rgba(229,231,235,0)", "rgba(229,231,235,1)"]);
  const navBlur = useTransform(scrollY, [0, 60], ["blur(0px)", "blur(14px)"]);

  const links = ["About", "Services", "Process", "Work", "Pricing"];

  return (
    <motion.header
      style={{
        backgroundColor: navBg,
        borderBottomColor: navBorder,
        backdropFilter: navBlur,
        WebkitBackdropFilter: navBlur,
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-bold text-2xl tracking-tighter text-[#111111] z-10"
        >
          py<span className="text-orange-600">Kode</span>
        </motion.a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium z-10">
          {links.map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * i }}
              className="text-gray-600 hover:text-orange-600 transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
          <a
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1.5 border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-lg"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Client Portal
          </a>
        </nav>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block z-10"
        >
          <a href="#contact" className="bg-[#111111] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-lg shadow-orange-500/0 hover:shadow-orange-500/25">
            Hire Me
          </a>
        </motion.div>

        <button className="md:hidden z-10 text-[#111111]" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#fafaf8] border-b border-gray-200 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {links.map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setOpen(false)}
                  className="text-lg font-medium text-gray-700 hover:text-orange-600 py-2 border-b border-gray-100 last:border-0">
                  {item}
                </a>
              ))}
              <a href="/login" onClick={() => setOpen(false)}
                className="text-lg font-medium text-gray-700 hover:text-orange-600">
                Client Portal
              </a>
              <a href="#contact" onClick={() => setOpen(false)}
                className="bg-orange-600 text-white text-center py-3 rounded-xl font-medium mt-4">
                Hire Me
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const btnRef = useRef<HTMLAnchorElement>(null);
  const { x: btnX, y: btnY } = useMagnetic(btnRef as React.RefObject<HTMLElement>);

  return (
    <section ref={heroRef} className="relative pt-40 pb-24 px-6 max-w-6xl mx-auto min-h-screen flex items-center z-10">
      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-4xl w-full">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium mb-8 overflow-hidden relative"
        >
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Available for projects
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-8 text-[#111111]">
          {["Build Faster.", "Build Smarter.", null].map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.div
                initial={{ y: "100%", filter: "blur(10px)" }}
                animate={{ y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 * i }}
              >
                {i === 2 ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Dominate.</span>
                ) : line}
              </motion.div>
            </div>
          ))}
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: "100%", filter: "blur(10px)" }}
              animate={{ y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400"
            >
              Dominate.
            </motion.div>
          </div>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl leading-relaxed font-light"
        >
          I'm a freelance full-stack engineer building fast, scalable, and premium web applications for ambitious brands.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 items-start sm:items-center"
        >
          <motion.a
            ref={btnRef}
            style={{ x: btnX, y: btnY }}
            href="#contact"
            className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-shadow hover:shadow-xl hover:shadow-orange-500/30 hover:bg-orange-700"
          >
            Start a Project <ArrowRight className="w-5 h-5" />
          </motion.a>
          <a href="#work" className="text-[#111111] font-semibold flex items-center justify-center group relative overflow-hidden px-4 py-2">
            <span className="relative z-10">View My Work</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#111111] transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center gap-6"
        >
          <div className="flex -space-x-3">
            {[
              ["bg-blue-100", "text-blue-600"],
              ["bg-green-100", "text-green-600"],
              ["bg-purple-100", "text-purple-600"],
              ["bg-yellow-100", "text-yellow-600"],
            ].map(([bg, text], i) => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#fafaf8] ${bg} ${text} flex items-center justify-center text-xs font-bold`}>
                U{i + 1}
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-1 text-orange-500 mb-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <div className="text-sm text-gray-500 font-medium">Trusted by 50+ founders</div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-6 md:left-auto flex flex-col items-center gap-2 text-gray-400 text-sm font-medium tracking-widest uppercase"
      >
        <span className="-rotate-90 origin-center mb-6">Scroll</span>
        <div className="w-[1px] h-12 bg-gray-300 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-orange-500"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

// ─── Tech Marquee ────────────────────────────────────────────────────────

const TECHS = ["React", "TypeScript", "Node.js", "Python", "Next.js", "PostgreSQL",
  "Tailwind CSS", "OpenAI API", "AWS", "Vite", "Redis", "Stripe", "Docker", "Framer Motion"];

const TechStack = () => (
  <div className="border-y border-gray-200 bg-white py-6 overflow-hidden flex relative z-10">
    <motion.div
      className="flex gap-16 whitespace-nowrap px-4 font-mono text-sm text-gray-400 uppercase tracking-wider font-bold"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
    >
      {[...Array(2)].map((_, i) => (
        <React.Fragment key={i}>
          {TECHS.map((t, j) => <span key={j}>{t} •&nbsp;</span>)}
        </React.Fragment>
      ))}
    </motion.div>
    <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
    <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
  </div>
);

// ─── Stats Bar ────────────────────────────────────────────────────────────

const StatsBar = () => {
  const stats = [
    { num: 47, suffix: "+", label: "Projects Shipped", icon: <Rocket size={18} /> },
    { num: 3, suffix: "+", label: "Years Engineering", icon: <Award size={18} /> },
    { num: 12, suffix: "+", label: "Happy Clients", icon: <Users size={18} /> },
    { num: 99, suffix: ".9%", label: "Uptime Average", icon: <TrendingUp size={18} /> },
  ];
  return (
    <div className="bg-[#111111] py-14 px-6 relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 text-orange-400 group-hover:bg-orange-500/20 transition-all duration-300">
              {s.icon}
            </div>
            <div className="text-5xl font-black text-white tracking-tighter mb-1">
              <AnimatedNumber target={s.num} suffix={s.suffix} />
            </div>
            <div className="text-sm font-medium text-gray-400">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── About ────────────────────────────────────────────────────────────────

const TERMINAL_LINES = [
  { delay: 0,    type: "cmd",     text: "$ ai-dev init --client=\"TechStartup\" --stack=nextjs" },
  { delay: 600,  type: "ok",      text: "✓ Environment configured in 0.3s" },
  { delay: 1000, type: "ok",      text: "✓ TypeScript strict mode enabled" },
  { delay: 1400, type: "blank",   text: "" },
  { delay: 1500, type: "cmd",     text: "$ ai --generate components --smart --count=18" },
  { delay: 2200, type: "ok",      text: "✓ 18 components generated" },
  { delay: 2600, type: "ok",      text: "✓ Types inferred — 0 errors" },
  { delay: 3000, type: "ok",      text: "✓ Unit tests written automatically" },
  { delay: 3400, type: "blank",   text: "" },
  { delay: 3500, type: "cmd",     text: "$ ai --build --optimize --target=production" },
  { delay: 4200, type: "ok",      text: "✓ Bundle: 87kb (gzip) — 68% smaller than avg" },
  { delay: 4700, type: "ok",      text: "✓ Core Web Vitals: 99 / 100 / 100" },
  { delay: 5200, type: "blank",   text: "" },
  { delay: 5300, type: "cmd",     text: "$ deploy --provider=vercel --regions=global" },
  { delay: 6000, type: "ok",      text: "✓ CDN deployed — 23 edge regions" },
  { delay: 6500, type: "ok",      text: "✓ SSL + DDoS protection enabled" },
  { delay: 7000, type: "success", text: "🚀 LIVE → client-app.vercel.app" },
  { delay: 7400, type: "metric",  text: "   Response: 61ms  |  Uptime: 99.9%  |  Time: 11 days" },
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
    const resetTimer = setTimeout(() => { setVisibleLines([]); setRestartKey(k => k + 1); }, 11000);
    timers.push(resetTimer);
    return () => timers.forEach(t => clearTimeout(t));
  }, [inView, restartKey]);

  return (
    <div ref={ref} className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/20"
      style={{ background: "rgba(4,2,14,0.97)", border: "1px solid rgba(234,88,12,0.2)" }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]"
        style={{ background: "rgba(8,4,24,0.95)" }}>
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-[11px] text-gray-500 font-mono">AI-DEV — zsh — 80×24</span>
        <div className="ml-auto flex items-center gap-1.5">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[10px] text-green-400/70 font-mono">LIVE</span>
        </div>
      </div>
      <div className="p-5 font-mono text-[12px] leading-[1.7] min-h-[280px] space-y-0.5">
        <AnimatePresence>
          {TERMINAL_LINES.map((line, i) =>
            visibleLines.includes(i) ? (
              <motion.div key={`${restartKey}-${i}`}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={
                  line.type === "cmd" ? "text-orange-400 font-semibold" :
                    line.type === "ok" ? "text-green-400/90" :
                      line.type === "success" ? "text-amber-300 font-bold text-[13px]" :
                        line.type === "metric" ? "text-blue-300/70 text-[11px]" :
                          "h-2"
                }>
                {line.text}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        <motion.span className="inline-block w-2 h-4 bg-orange-500/70 ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
      </div>
    </div>
  );
}

const About = () => (
  <section id="about" className="py-32 px-6 max-w-6xl mx-auto relative z-10">
    <div className="grid md:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter leading-tight text-[#111111]">
          The difference is in the details.
        </h2>
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          When you hire me, you don't get an account manager or a junior dev learning on your dime. You get me directly — building your product from architecture to deployment.
        </p>
        <p className="text-xl text-gray-600 leading-relaxed">
          I specialize in taking complex requirements and turning them into intuitive, blazing-fast applications that your users will actually love using.
        </p>
      </motion.div>

      <div className="space-y-8">
        <LiveTerminal />
        <div className="grid grid-cols-2 gap-6">
          {[
            { num: 10, suffix: "x", text: "Faster delivery" },
            { num: 100, suffix: "%", text: "Direct communication" },
            { num: 0, suffix: "", text: "Bureaucracy" },
            { num: 5, suffix: "+", text: "Years experience" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="text-5xl font-black text-orange-600 mb-3 group-hover:scale-110 transition-transform origin-left">
                <AnimatedCounter to={stat.num} />{stat.suffix}
              </div>
              <div className="font-medium text-gray-900">{stat.text}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── Process ──────────────────────────────────────────────────────────────

const Process = () => {
  const steps = [
    { step: "01", icon: <MessageSquare size={22} />, title: "Discovery Call", desc: "We map your vision, goals, and constraints. I ask the right questions, identify risks early, and confirm the scope before a single line of code is written.", time: "~45 min" },
    { step: "02", icon: <Settings size={22} />, title: "Architecture & Plan", desc: "I design the full technical blueprint — stack selection, database schema, API contracts, auth model, and deployment strategy — delivered as a spec doc.", time: "1–2 days" },
    { step: "03", icon: <Code2 size={22} />, title: "AI-Powered Build", desc: "Focused sprints with daily progress updates and a live preview link from day 1. AI tooling accelerates iteration without cutting corners on quality.", time: "1–4 weeks" },
    { step: "04", icon: <Rocket size={22} />, title: "Launch & Handover", desc: "Zero-downtime deploy, full code walkthrough, and documentation handover. Post-launch bug fixes included. Ongoing maintenance available on retainer.", time: "1 day" },
  ];

  return (
    <section id="process" className="py-32 px-6 bg-white relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-5xl font-black mb-6 tracking-tighter text-[#111111]">How we work</h2>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto font-light">A streamlined process focused on shipping.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-[1px] z-0">
            <motion.div className="h-full bg-gradient-to-r from-orange-300 to-amber-200"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ transformOrigin: "left" }} />
            <motion.div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.8)]"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          </div>

          {steps.map((phase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group z-10"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center mb-6 text-white shadow-lg shadow-orange-500/30">
                {phase.icon}
              </div>
              <div className="text-6xl font-black text-gray-100 mb-4 select-none group-hover:text-orange-100 transition-colors">{phase.step}</div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold tracking-tight text-[#111111]">{phase.title}</h3>
                <span className="text-[10px] text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full font-mono">{phase.time}</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">{phase.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Services ─────────────────────────────────────────────────────────────

const Services = () => {
  const services = [
    { icon: <Code className="w-8 h-8 text-orange-600" />, title: "Web Applications", desc: "Complex SPAs, dashboards, and portals built with React and modern tooling." },
    { icon: <Zap className="w-8 h-8 text-orange-600" />, title: "SaaS Products", desc: "End-to-end architecture, multi-tenant databases, authentication, and payments." },
    { icon: <Terminal className="w-8 h-8 text-orange-600" />, title: "AI Integration", desc: "LLM wrappers, RAG pipelines, and intelligent features powered by OpenAI." },
    { icon: <Smartphone className="w-8 h-8 text-orange-600" />, title: "Landing Pages", desc: "High-converting, interactive, and fully optimized marketing sites." },
    { icon: <Server className="w-8 h-8 text-orange-600" />, title: "DevOps & Infra", desc: "AWS / GCP / Vercel setup, Docker containers, CI/CD pipelines, and autoscaling." },
    { icon: <Globe className="w-8 h-8 text-orange-600" />, title: "API Development", desc: "Robust REST and GraphQL APIs with authentication, rate limiting, and monitoring." },
    { icon: <Layers className="w-8 h-8 text-orange-600" />, title: "E-Commerce", desc: "Headless storefronts, Stripe integrations, and conversion-optimized checkout flows." },
    { icon: <Blocks className="w-8 h-8 text-orange-600" />, title: "Custom Tooling", desc: "Internal dashboards, admin panels, and developer tools built exactly for your workflow." },
  ];

  return (
    <section id="services" className="py-32 px-6 relative z-10 bg-[#fafaf8]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-5xl font-black mb-6 tracking-tighter text-[#111111]">Expertise</h2>
          <p className="text-2xl text-gray-600 max-w-2xl font-light">What I can build for you.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.1 }}
              className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="mb-6 bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-tight text-[#111111]">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{service.desc}</p>
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
    { title: "Fintech Dashboard", tag: "SaaS · Full-Stack", gradient: "from-orange-400 to-amber-300", desc: "Real-time analytics SaaS with multi-tenant architecture, role-based access, Stripe billing, and live WebSocket data streaming. Shipped in 18 days.", tech: ["React", "Node.js", "PostgreSQL", "Redis", "Stripe"], stat: "18 days" },
    { title: "AI Writing Assistant", tag: "AI Integration", gradient: "from-gray-800 to-gray-900", desc: "Enterprise AI document intelligence platform: GPT-4, vector search, streaming, function-calling — all production-ready.", tech: ["Python", "React", "OpenAI", "Pinecone", "FastAPI"], stat: "1M+ docs" },
    { title: "E-Commerce Platform", tag: "Web App", gradient: "from-orange-100 to-stone-200", desc: "High-conversion storefront with AI recommendations, one-click checkout, abandoned cart recovery, and headless CMS integration.", tech: ["Next.js", "Postgres", "Stripe", "Sanity", "Vercel"], stat: "+34% CVR" },
  ];

  return (
    <section id="work" className="py-32 px-6 bg-white relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6"
        >
          <div>
            <h2 className="text-5xl font-black mb-6 tracking-tighter text-[#111111]">Selected Work</h2>
            <p className="text-2xl text-gray-600 font-light">Recent projects I've built.</p>
          </div>
          <a href="#" className="flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700 group pb-2 border-b border-orange-200 hover:border-orange-600 transition-colors">
            View GitHub <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-3xl mb-8 overflow-hidden relative shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} transition-transform duration-700 group-hover:scale-105`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg flex items-center justify-center transform group-hover:-translate-y-4 transition-transform duration-500">
                    <span className="font-mono text-sm text-white font-medium px-4 py-2 bg-black/20 rounded-full">Coming Soon</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                  {project.stat}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-8 bg-orange-600" />
                <div className="text-sm font-bold text-orange-600 uppercase tracking-widest">{project.tag}</div>
              </div>
              <h3 className="text-2xl font-bold group-hover:text-orange-600 transition-colors tracking-tight text-[#111111] mb-3">{project.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{project.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 bg-gray-50">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Comparison ────────────────────────────────────────────────────────────

const Comparison = () => {
  const rows = [
    { label: "Project Timeline",    agency: "3–6 months",           me: "2–4 weeks" },
    { label: "Starting Cost",       agency: "$15,000–$80,000",      me: "From $300" },
    { label: "Communication",       agency: "Project managers",     me: "Direct with me" },
    { label: "Code Quality",        agency: "Junior devs, varies",  me: "Senior, production grade" },
    { label: "AI Integration",      agency: "Rarely offered",       me: "Core competency" },
    { label: "Post-launch Support", agency: "Billed separately",    me: "Included" },
    { label: "Revision Rounds",     agency: "Limited, extra cost",  me: "Included in scope" },
  ];

  return (
    <section className="py-32 px-6 bg-[#fafaf8] relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-black mb-6 tracking-tighter text-[#111111]">
            pyKode <span className="text-orange-600">vs The Rest</span>
          </h2>
          <p className="text-xl text-gray-600 font-light">Stop paying 10x more for slower results and junior code.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="grid grid-cols-3 gap-0 mb-2">
            <div className="px-5 py-3" />
            <div className="px-5 py-3 text-center text-sm font-bold text-gray-500 rounded-t-xl"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none" }}>
              Agency / Freelancer
            </div>
            <div className="px-5 py-3 text-center rounded-t-xl relative"
              style={{ background: "linear-gradient(135deg, rgba(234,88,12,0.12), rgba(251,146,60,0.08))", border: "1px solid rgba(234,88,12,0.3)", borderBottom: "none" }}>
              <span className="text-sm font-bold text-orange-600">pyKode</span>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[9px] font-black px-3 py-0.5 rounded-full tracking-widest uppercase whitespace-nowrap shadow-lg shadow-orange-500/30">
                Best Choice
              </div>
            </div>
          </div>

          {rows.map((row, i) => (
            <motion.div key={i} className="grid grid-cols-3 gap-0"
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <div className="px-5 py-4 text-sm font-medium text-gray-700 border-b border-gray-100">{row.label}</div>
              <div className="px-5 py-4 text-center text-sm text-gray-500 border-b border-x border-gray-100"
                style={{ background: "rgba(0,0,0,0.015)" }}>
                <div className="flex items-center justify-center gap-1.5">
                  <Minus size={12} className="text-red-400" />{row.agency}
                </div>
              </div>
              <div className="px-5 py-4 text-center text-sm font-semibold border-b border-x"
                style={{ background: "rgba(234,88,12,0.04)", borderColor: "rgba(234,88,12,0.2)", color: "#c2410c" }}>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={13} className="text-orange-500" />{row.me}
                </div>
              </div>
            </motion.div>
          ))}

          <div className="grid grid-cols-3 gap-0">
            <div />
            <div className="px-5 py-4 rounded-b-xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderTop: "none" }} />
            <div className="px-5 py-4 rounded-b-xl" style={{ background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.25)", borderTop: "none" }}>
              <a href="#contact" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-orange-500/20">
                Choose pyKode <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Pricing ──────────────────────────────────────────────────────────────

const Pricing = () => {
  const tiers = [
    {
      name: "Starter", price: "$300", period: "one-time",
      desc: "Landing page or portfolio site — clean, fast, and ready to go live.",
      features: ["1–3 Pages", "Mobile Responsive", "Basic SEO", "Contact Form", "5–7 Day Delivery", "1 Revision Round"],
      popular: false,
    },
    {
      name: "Pro", price: "$800", period: "one-time",
      desc: "A complete web app with backend, auth, and everything you need to launch.",
      features: ["Full-Stack Web App", "User Authentication", "Database (PostgreSQL)", "REST API", "2–3 Week Delivery", "2 Revision Rounds", "30-Day Bug Support"],
      popular: true,
    },
    {
      name: "Custom", price: "Let's talk", period: "scoped",
      desc: "Bigger project? AI features, complex infra, or ongoing work — we'll scope it together.",
      features: ["Custom Scope & Timeline", "AI / LLM Integration", "Third-party Integrations", "Priority Support", "Unlimited Revisions"],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 px-6 bg-white relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-5xl font-black mb-6 tracking-tighter text-[#111111]">Transparent Pricing</h2>
          <p className="text-2xl text-gray-600 font-light">Simple, predictable rates for high-quality engineering.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier, i) => {
            const cardRef = useRef<HTMLDivElement>(null);
            const { x: tiltX, y: tiltY } = tier.popular
              ? (() => {
                const tx = useMotionValue(0), ty = useMotionValue(0);
                useEffect(() => {
                  const el = cardRef.current;
                  if (!el) return;
                  const onMove = (e: MouseEvent) => {
                    const r = el.getBoundingClientRect();
                    tx.set((e.clientX - r.left) / r.width - 0.5);
                    ty.set((e.clientY - r.top) / r.height - 0.5);
                  };
                  const onLeave = () => { tx.set(0); ty.set(0); };
                  el.addEventListener("mousemove", onMove);
                  el.addEventListener("mouseleave", onLeave);
                  return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
                }, []);
                return {
                  x: useSpring(useTransform(tx, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 }),
                  y: useSpring(useTransform(ty, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 }),
                };
              })()
              : { x: 0, y: 0 };

            return (
              <motion.div
                ref={cardRef}
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={tier.popular ? { rotateX: tiltY as any, rotateY: tiltX as any, transformStyle: "preserve-3d" } : {}}
                className={`rounded-[2rem] p-10 flex flex-col relative ${
                  tier.popular
                    ? "bg-[#111111] text-white shadow-2xl shadow-black/25 md:scale-105 z-10"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg shadow-orange-500/30">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-4 ${tier.popular ? "text-gray-300" : "text-gray-600"}`}>{tier.name}</h3>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className={`text-5xl font-black tracking-tighter ${tier.popular ? "text-orange-400" : "text-[#111111]"}`}>{tier.price}</span>
                  <span className={tier.popular ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>/ {tier.period}</span>
                </div>
                <p className={`mb-8 text-sm leading-relaxed ${tier.popular ? "text-gray-400" : "text-gray-600"}`}>{tier.desc}</p>
                <ul className="space-y-4 mb-10 flex-grow">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1 rounded-full shrink-0 ${tier.popular ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"}`}>
                        <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className={`font-medium text-sm ${tier.popular ? "text-gray-300" : "text-gray-700"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#contact"
                  className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 text-center text-sm ${
                    tier.popular
                      ? "bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-500/25"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}>
                  {tier.name === "Custom" ? "Contact Me" : "Get Started"}
                </a>
              </motion.div>
            );
          })}
        </div>

        <motion.div className="flex flex-wrap items-center justify-center gap-8 mt-16"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          {[
            { icon: <Shield size={14} />, text: "Satisfaction Guarantee" },
            { icon: <Clock size={14} />, text: "On-Time Delivery" },
            { icon: <Star size={14} />, text: "5-Star Rated" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-orange-500">{b.icon}</span>{b.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Booking ───────────────────────────────────────────────────────────────

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOTS = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const TAKEN = new Set(["Mon-9:00", "Mon-10:00", "Wed-11:00", "Thu-14:00", "Fri-9:00"]);

const Booking = () => {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", brief: "" });

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
          from_name: form.name,
          from_email: form.email,
          message: `📅 BOOKING REQUEST\n\nZi: ${selectedDay} · Ora: ${selectedSlot}\n\nProiect:\n${form.brief}`,
          booking_day: selectedDay,
          booking_slot: selectedSlot,
          reply_to: form.email,
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
    <section className="py-32 px-6 bg-[#fafaf8] relative z-10">
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black mb-6 tracking-tighter text-[#111111]">
            Pick a slot. <span className="text-orange-600">Let's talk.</span>
          </h2>
          <p className="text-xl text-gray-600 font-light">Select a day and time, share project details — I'll reply within 2 hours.</p>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-10">
          {["Pick a slot", "Project details", "Confirmed"].map((label, i) => {
            const stepIdx = step === "pick" ? 0 : step === "form" ? 1 : 2;
            return (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${i <= stepIdx ? "text-orange-600" : "text-gray-400"}`}>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${i < stepIdx ? "bg-orange-600 border-orange-600 text-white" : i === stepIdx ? "border-orange-600 text-orange-600" : "border-gray-200 text-gray-400"}`}>
                    {i < stepIdx ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 max-w-[60px] h-px transition-colors ${i < stepIdx ? "bg-orange-400" : "bg-gray-200"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === "pick" && (
            <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-semibold text-[#111111]">Pick a day — next week</p>
                  <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full font-mono">EET · UTC+2</span>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-8">
                  {dayDates.map((d) => (
                    <motion.button key={d.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => { setSelectedDay(d.label); setSelectedSlot(null); }}
                      className={`flex flex-col items-center py-3 rounded-xl border transition-all duration-200 ${
                        selectedDay === d.label
                          ? "border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10"
                          : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50"
                      }`}>
                      <span className="text-[10px] text-gray-500 tracking-wider uppercase mb-1">{d.label}</span>
                      <span className={`text-xl font-bold ${selectedDay === d.label ? "text-orange-600" : "text-[#111111]"}`}>{d.date}</span>
                      <span className="text-[10px] text-gray-400">{d.month}</span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedDay && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <p className="text-sm font-semibold mb-4 text-[#111111]">
                        Pick a time — <span className="text-gray-500 font-normal">{selectedDay}, {dayDates.find(d => d.label === selectedDay)?.date} {dayDates.find(d => d.label === selectedDay)?.month}</span>
                      </p>
                      <div className="grid grid-cols-3 gap-2 mb-8">
                        {SLOTS.map((slot) => {
                          const taken = TAKEN.has(`${selectedDay}-${slot}`);
                          return (
                            <motion.button key={slot} whileHover={taken ? {} : { scale: 1.03 }} whileTap={taken ? {} : { scale: 0.97 }}
                              disabled={taken} onClick={() => !taken && setSelectedSlot(slot)}
                              className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                taken ? "border-gray-100 text-gray-300 cursor-not-allowed" :
                                  selectedSlot === slot ? "border-orange-500 bg-orange-50 text-orange-600 shadow-md shadow-orange-500/10" :
                                    "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50 text-[#111111]"
                              }`}>
                              {taken ? <span className="text-[11px] line-through">Taken</span> : slot}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setStep("form")} disabled={!selectedDay || !selectedSlot}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all bg-[#111111] hover:bg-orange-600 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue — {selectedDay && selectedSlot ? `${selectedDay} at ${selectedSlot}` : "select a slot"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
                <form onSubmit={handleSend} className="p-8">
                  <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-orange-50 border border-orange-200">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Selected slot</p>
                      <p className="text-sm font-bold text-[#111111]">{selectedDay}, {dayDates.find(d => d.label === selectedDay)?.date} {dayDates.find(d => d.label === selectedDay)?.month} · {selectedSlot}</p>
                    </div>
                    <button type="button" onClick={() => setStep("pick")}
                      className="ml-auto text-xs text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-400 px-2 py-1 rounded-lg transition-all">
                      Change
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Your Name</label>
                      <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="John Smith" required
                        className="border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 h-11 bg-white text-[#111111]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
                      <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="john@company.com" required
                        className="border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 h-11 bg-white text-[#111111]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">About the Project</label>
                      <Textarea value={form.brief} onChange={e => setForm(f => ({ ...f, brief: e.target.value }))}
                        placeholder="What do you want to build? Timeline, budget, stack preferences..." required rows={4}
                        className="border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 bg-white text-[#111111] resize-none" />
                    </div>
                  </div>

                  <button type="submit" disabled={sending || !form.name || !form.email || !form.brief}
                    className="w-full mt-7 py-4 rounded-2xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                    {sending
                      ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>Sending...</motion.span>
                      : <><Send className="w-4 h-4" />Send Session Request</>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="p-12 flex flex-col items-center gap-6">
                  <motion.div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                    <CheckCircle2 size={36} className="text-green-500" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-[#111111]">Request sent! 🎉</h3>
                    <p className="text-gray-600 max-w-sm mx-auto text-sm">
                      Slot <span className="text-[#111111] font-semibold">{selectedDay} at {selectedSlot}</span> has been reserved. I'll reply to <span className="text-orange-600 font-semibold">{form.email}</span> within 2 hours.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <motion.span className="w-2 h-2 rounded-full bg-green-500" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    Email sent successfully
                  </div>
                  <button onClick={reset} className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-all">
                    Book another session
                  </button>
                </div>
              </div>
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
            <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-orange-500">{b.icon}</span>{b.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Contact ──────────────────────────────────────────────────────────────

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
        toast({ title: "✦ Message Sent!", description: "I'll respond within 24 hours." });
      } else {
        await new Promise(r => setTimeout(r, 1200));
        toast({ title: "✦ Demo Mode", description: "Configure VITE_EMAILJS_* env vars to enable real email." });
      }
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast({ title: "Failed to send", description: "Please try again or reach out directly.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-[#111111] text-white px-6 relative z-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/8 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
            Let's build<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">something great.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 font-light leading-relaxed">
            Have a project in mind? Fill out the form and I'll get back to you within 24 hours.
          </p>
          <div className="space-y-8">
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:border-orange-500/50 transition-all duration-300">
                <Terminal className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Email me</div>
                <div className="text-2xl font-bold group-hover:text-orange-400 transition-colors">hello@pykode.dev</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 p-10 rounded-[2rem] border border-white/10 backdrop-blur-sm"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors focus:bg-white/5"
                placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors focus:bg-white/5"
                placeholder="john@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Message</label>
              <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors focus:bg-white/5 resize-none"
                placeholder="Tell me about your project..." required></textarea>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 mt-4 group disabled:opacity-60">
              {isSubmitting
                ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>Sending...</motion.span>
                : <><Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />Send Message</>}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="bg-[#111111] pt-10 pb-16 px-6 text-gray-500 text-sm border-t border-white/10 relative z-10">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="font-bold text-2xl text-white tracking-tighter">
        py<span className="text-orange-500">Kode</span>
      </div>
      <div className="font-medium">© {new Date().getFullYear()} pyKode. All rights reserved.</div>
      <div className="flex items-center gap-4">
        {[{ icon: <Github size={17} />, label: "GitHub" }, { icon: <Twitter size={17} />, label: "Twitter" }, { icon: <Linkedin size={17} />, label: "LinkedIn" }].map(s => (
          <motion.a key={s.label} href="#"
            className="w-9 h-9 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-gray-500 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/8 transition-all duration-300"
            whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.88 }}>
            {s.icon}<span className="sr-only">{s.label}</span>
          </motion.a>
        ))}
      </div>
    </div>
  </footer>
);

// ─── Ambient Blobs ────────────────────────────────────────────────────────

const AmbientBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-orange-400/15 blur-[100px]"
      animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, 50, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-[30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400/15 blur-[100px]"
      animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, -30, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    <motion.div
      className="absolute top-[60%] right-[-5%] w-[400px] h-[400px] rounded-full bg-orange-300/10 blur-[80px]"
      animate={{ scale: [1, 1.15, 1], y: [0, -40, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
    />
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]" style={{ fontFeatureSettings: '"ss01","ss02"' }}>
      <ScrollProgress />
      <AmbientBlobs />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <TechStack />
          <StatsBar />
          <About />
          <Process />
          <Services />
          <Work />
          <Comparison />
          <Pricing />
          <Booking />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}
