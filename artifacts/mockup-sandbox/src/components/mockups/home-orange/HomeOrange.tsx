import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Code, Zap, Smartphone, Terminal, ChevronRight, Check, Send, Star } from 'lucide-react';

// Custom Hooks for Animations
function useMagnetic(ref: React.RefObject<HTMLElement>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      x.set(distanceX * 0.2);
      y.set(distanceY * 0.2);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, x, y]);

  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  return { x: springX, y: springY };
}

function use3DTilt(ref: React.RefObject<HTMLElement>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      
      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, x, y]);

  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  return { rotateX: springRotateX, rotateY: springRotateY };
}

function AnimatedCounter({ from = 0, to, duration = 2 }: { from?: number, to: number, duration?: number }) {
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
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setValue(Math.floor(from + (to - from) * easeProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, from, to, duration]);

  return <span ref={ref}>{value}</span>;
}

export default function HomeOrange() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const navBackground = useTransform(
    scrollY,
    [0, 50],
    ["rgba(250, 250, 248, 0)", "rgba(250, 250, 248, 0.9)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 50],
    ["rgba(229, 231, 235, 0)", "rgba(229, 231, 235, 1)"]
  );
  const navBlur = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"]
  );

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const btnRef = useRef<HTMLAnchorElement>(null);
  const { x: btnX, y: btnY } = useMagnetic(btnRef);

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111] font-sans selection:bg-orange-500 selection:text-white overflow-hidden">
      
      {/* Ambient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-orange-400/20 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400/20 blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Navbar */}
      <motion.header 
        style={{ 
          backgroundColor: navBackground, 
          borderBottomColor: navBorder,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="font-bold text-2xl tracking-tighter z-10"
          >
            py<span className="text-orange-600">Kode</span>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium z-10">
            {["About", "Services", "Process", "Work", "Pricing"].map((item, i) => (
              <motion.a 
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="hover:text-orange-600 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
          </nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block z-10"
          >
            <a href="#contact" className="bg-[#111111] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium transition-colors duration-300 shadow-lg shadow-orange-500/0 hover:shadow-orange-500/25">
              Hire Me
            </a>
          </motion.div>

          <button className="md:hidden z-10 relative" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#fafaf8] border-b border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 gap-4">
                {["About", "Services", "Process", "Work", "Pricing"].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium hover:text-orange-600 py-2 border-b border-gray-100 last:border-0"
                  >
                    {item}
                  </a>
                ))}
                <a 
                  href="#contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-orange-600 text-white text-center py-3 rounded-xl font-medium mt-4"
                >
                  Hire Me
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-40 pb-24 px-6 max-w-6xl mx-auto min-h-screen flex items-center z-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-4xl w-full">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium mb-8 overflow-hidden relative"
          >
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            Available for projects
            {/* Shimmer sweep */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-8">
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: "100%", filter: "blur(10px)" }}
                animate={{ y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Build Faster.
              </motion.div>
            </div>
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: "100%", filter: "blur(10px)" }}
                animate={{ y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                Build Smarter.
              </motion.div>
            </div>
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
              className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-shadow hover:shadow-xl hover:shadow-orange-500/30"
            >
              Start a Project <ArrowRight className="w-5 h-5" />
            </motion.a>
            
            <a href="#work" className="text-[#111111] font-semibold flex items-center justify-center group relative overflow-hidden px-4 py-2">
              <span className="relative z-10">View My Work</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#fafaf8] bg-gray-200 flex items-center justify-center text-xs font-bold ${['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-yellow-100'][i-1]}`}>
                  U{i}
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

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-6 md:left-auto flex flex-col items-center gap-2 text-gray-400 text-sm font-medium tracking-widest uppercase"
        >
          <span className="-rotate-90 origin-center mb-6">Scroll</span>
          <motion.div 
            className="w-[1px] h-12 bg-gray-300 relative overflow-hidden"
          >
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-orange-500"
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Tech Marquee */}
      <div className="border-y border-gray-200 bg-white py-6 overflow-hidden flex relative z-10">
        <motion.div 
          className="flex gap-16 whitespace-nowrap px-4 font-mono text-sm text-gray-400 uppercase tracking-wider font-bold"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span>React</span> • <span>Next.js</span> • <span>TypeScript</span> • <span>Node.js</span> • 
              <span>PostgreSQL</span> • <span>Tailwind CSS</span> • <span>Python</span> • <span>AWS</span> • 
              <span>Framer Motion</span> • <span>Redis</span> •
            </React.Fragment>
          ))}
        </motion.div>
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* About Section */}
      <section id="about" className="py-32 px-6 max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter leading-tight">The difference is in the details.</h2>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              When you hire me, you don't get an account manager or a junior dev learning on your dime. You get me directly—building your product from architecture to deployment.
            </p>
            <p className="text-xl text-gray-600 leading-relaxed">
              I specialize in taking complex requirements and turning them into intuitive, blazing-fast applications that your users will actually love using.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { num: 10, suffix: "x", text: "Faster delivery" },
              { num: 100, suffix: "%", text: "Direct communication" },
              { num: 0, suffix: "", text: "Bureaucracy" },
              { num: 5, suffix: "+", text: "Years experience" }
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
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-white px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-5xl font-black mb-6 tracking-tighter">Expertise</h2>
            <p className="text-2xl text-gray-600 max-w-2xl font-light">What I can build for you.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Code className="w-8 h-8 text-orange-600" />, title: "Web Applications", desc: "Complex SPAs, dashboards, and portals built with React and modern tooling." },
              { icon: <Zap className="w-8 h-8 text-orange-600" />, title: "SaaS Products", desc: "End-to-end architecture, multi-tenant databases, authentication, and payments." },
              { icon: <Terminal className="w-8 h-8 text-orange-600" />, title: "AI Integration", desc: "LLM wrappers, RAG pipelines, and intelligent features powered by OpenAI." },
              { icon: <Smartphone className="w-8 h-8 text-orange-600" />, title: "Landing Pages", desc: "High-converting, interactive, and fully optimized marketing sites." }
            ].map((service, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-[#fafaf8] border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="mb-8 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-32 px-6 max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-5xl font-black mb-6 tracking-tighter">How we work</h2>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto font-light">A streamlined process focused on shipping.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          {[
            { step: "01", title: "Discover", desc: "We define the scope, goals, and technical architecture." },
            { step: "02", title: "Design", desc: "I create high-fidelity prototypes and UI components." },
            { step: "03", title: "Build", desc: "Clean, testable code written with modern best practices." },
            { step: "04", title: "Ship", desc: "Deployment, optimization, and post-launch support." }
          ].map((phase, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              <div className="text-8xl font-black text-gray-200/50 mb-6 group-hover:text-orange-100 transition-colors">{phase.step}</div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">{phase.title}</h3>
              <p className="text-gray-600 leading-relaxed">{phase.desc}</p>
              {i < 3 && (
                <div className="hidden md:block absolute top-12 right-[-50%] w-full h-[2px] bg-gradient-to-r from-gray-200 to-transparent -z-10"></div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Work / Portfolio */}
      <section id="work" className="py-32 bg-white px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6"
          >
            <div>
              <h2 className="text-5xl font-black mb-6 tracking-tighter">Selected Work</h2>
              <p className="text-2xl text-gray-600 max-w-2xl font-light">Recent projects I've built.</p>
            </div>
            <a href="#" className="flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700 group pb-2 border-b border-orange-200 hover:border-orange-600 transition-colors">
              View GitHub <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Fintech Dashboard", tag: "SaaS", gradient: "from-orange-400 to-amber-300" },
              { title: "AI Writing Assistant", tag: "AI Integration", gradient: "from-gray-800 to-gray-900" },
              { title: "E-Commerce Platform", tag: "Web App", gradient: "from-orange-100 to-stone-200" }
            ].map((project, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] rounded-3xl mb-8 overflow-hidden relative shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} transition-transform duration-700 group-hover:scale-105`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg flex items-center justify-center transform group-hover:-translate-y-4 transition-transform duration-500">
                      <span className="font-mono text-sm text-white font-medium px-4 py-2 bg-black/20 rounded-full">Coming Soon</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-[1px] w-8 bg-orange-600"></div>
                  <div className="text-sm font-bold text-orange-600 uppercase tracking-widest">{project.tag}</div>
                </div>
                <h3 className="text-2xl font-bold group-hover:text-orange-600 transition-colors tracking-tight">{project.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-5xl font-black mb-6 tracking-tighter">Transparent Pricing</h2>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto font-light">Simple, predictable rates for high-quality engineering.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Starter", price: "$2,500", desc: "Perfect for landing pages and simple MVPs.", features: ["Responsive design", "SEO optimization", "Contact forms", "1 week delivery"] },
            { name: "Growth", price: "$6,500", desc: "For fully functional web applications.", popular: true, features: ["Database setup", "Authentication", "Payment integration", "3-4 weeks delivery"] },
            { name: "Scale", price: "Custom", desc: "Complex SaaS products and AI integrations.", features: ["Custom architecture", "Scalable infrastructure", "Ongoing support", "Timeline varies"] }
          ].map((tier, i) => {
            const cardRef = useRef<HTMLDivElement>(null);
            const { rotateX, rotateY } = tier.popular ? use3DTilt(cardRef) : { rotateX: 0, rotateY: 0 };

            return (
              <motion.div 
                ref={cardRef}
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={tier.popular ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
                className={`rounded-[2rem] p-10 flex flex-col ${tier.popular ? 'bg-[#111111] text-white shadow-2xl relative' : 'bg-white border border-gray-100 shadow-sm'}`}
              >
                {tier.popular && (
                  <div style={{ transform: "translateZ(30px)" }} className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg shadow-orange-500/30">
                    Most Popular
                  </div>
                )}
                
                <div style={tier.popular ? { transform: "translateZ(20px)" } : {}}>
                  <h3 className={`text-2xl font-bold mb-4 ${tier.popular ? 'text-gray-300' : 'text-gray-600'}`}>{tier.name}</h3>
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter">{tier.price}</span>
                    {tier.price !== "Custom" && <span className={tier.popular ? 'text-gray-400' : 'text-gray-500'}>/project</span>}
                  </div>
                  <p className={`mb-10 min-h-[3rem] ${tier.popular ? 'text-gray-400' : 'text-gray-600'}`}>{tier.desc}</p>
                  
                  <ul className="space-y-5 mb-10 flex-grow">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-4">
                        <div className={`mt-1 p-1 rounded-full shrink-0 ${tier.popular ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                          <Check className="w-3 h-3" strokeWidth={4} />
                        </div>
                        <span className={`font-medium ${tier.popular ? 'text-gray-300' : 'text-gray-700'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-5 rounded-2xl font-bold transition-all duration-300 mt-auto ${tier.popular ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                    Choose {tier.name}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-[#111111] text-white px-6 relative z-10 overflow-hidden">
        {/* Contact ambient blob */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">Let's build<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">something great.</span></h2>
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
            className="bg-white/5 p-10 rounded-[2rem] border border-white/10 backdrop-blur-sm relative"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Name</label>
                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors focus:bg-white/5" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Email</label>
                <input type="email" className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors focus:bg-white/5" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Message</label>
                <textarea rows={4} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors focus:bg-white/5 resize-none" placeholder="Tell me about your project..."></textarea>
              </div>
              <button className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 mt-4 group">
                Send Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] pt-10 pb-16 px-6 text-gray-500 text-sm border-t border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-bold text-2xl text-white tracking-tighter">
            py<span className="text-orange-500">Kode</span>
          </div>
          <div className="font-medium">© {new Date().getFullYear()} pyKode. All rights reserved.</div>
          <div className="flex gap-8 font-semibold tracking-wide uppercase text-xs">
            <a href="#" className="hover:text-orange-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-orange-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-orange-400 transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
