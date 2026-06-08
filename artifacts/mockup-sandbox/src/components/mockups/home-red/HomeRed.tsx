import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, Code, Database, Layout, Smartphone, Star, CheckCircle2, Mail, Github, Twitter, Linkedin, ChevronDown } from 'lucide-react';

// Floating Blobs Component
const AmbientBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-30 blur-[100px] animate-blob" style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, rgba(255,255,255,0) 70%)' }} />
    <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full opacity-20 blur-[100px] animate-blob animation-delay-2000" style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.4) 0%, rgba(255,255,255,0) 70%)' }} />
    <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px] animate-blob animation-delay-4000" style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.3) 0%, rgba(255,255,255,0) 70%)' }} />
  </div>
);

// Magnetic Button
const MagneticButton = ({ children, className, ...props }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current?.getBoundingClientRect() || { height: 0, width: 0, left: 0, top: 0 };
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Counter Number
const AnimatedCounter = ({ value, label, suffix = "" }: { value: number, label: string, suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const spring = useSpring(0, { duration: 2000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    return spring.onChange((v) => {
      setDisplay(Math.floor(v));
    });
  }, [spring]);

  return (
    <div ref={ref} className="flex flex-col">
      <div className="text-5xl md:text-7xl font-black text-[#dc2626] mb-2 tracking-tighter">
        {display}{suffix}
      </div>
      <div className="font-semibold text-gray-500 uppercase tracking-widest text-sm">{label}</div>
    </div>
  );
};

// 3D Tilt Card
const TiltCard = ({ children, className, popular = false }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
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

  return (
    <motion.div
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl ${popular ? 'bg-[#0a0a0a] text-white shadow-2xl' : 'bg-white border border-gray-200'} p-8 transition-colors ${className}`}
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default function HomeRed() {
  const { scrollY } = useScroll();
  const navBackground = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]);
  const navBackdropBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"]);
  const navBorder = useTransform(scrollY, [0, 50], ["rgba(229, 231, 235, 0)", "rgba(229, 231, 235, 1)"]);
  const navShadow = useTransform(scrollY, [0, 50], ["none", "0 4px 6px -1px rgba(0, 0, 0, 0.05)"]);

  const heroVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: i * 0.15, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    })
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const services = [
    { title: 'Web Apps', desc: 'Custom, high-performance web apps built with modern frameworks.', icon: <Layout className="w-8 h-8" /> },
    { title: 'SaaS Platforms', desc: 'End-to-end SaaS development including architecture & payment.', icon: <Database className="w-8 h-8" /> },
    { title: 'AI Integration', desc: 'Leveraging LLMs and APIs to build intelligent features.', icon: <Code className="w-8 h-8" /> },
    { title: 'Landing Pages', desc: 'High-converting, accessible pages optimized for speed.', icon: <Smartphone className="w-8 h-8" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#0a0a0a] font-sans selection:bg-[#dc2626] selection:text-white overflow-hidden">
      <AmbientBlobs />

      {/* Navbar */}
      <motion.nav 
        style={{ 
          backgroundColor: navBackground, 
          backdropFilter: navBackdropBlur, 
          borderBottomColor: navBorder,
          borderBottomWidth: "1px",
          boxShadow: navShadow
        }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-[#dc2626] text-white flex items-center justify-center font-black text-xl rounded-lg group-hover:bg-[#b91c1c] transition-colors">
              pK
            </div>
            <span className="font-black text-2xl tracking-tighter">pyKode.</span>
          </div>
          <div className="hidden md:flex items-center gap-10 font-bold text-sm tracking-wide text-gray-800">
            {['About', 'Services', 'Work', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="relative group overflow-hidden">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">{item}</span>
                <span className="absolute top-0 left-0 block translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-[#dc2626]">{item}</span>
              </a>
            ))}
          </div>
          <MagneticButton className="hidden md:flex bg-[#0a0a0a] hover:bg-[#dc2626] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors shadow-lg">
            Hire Me
          </MagneticButton>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-6xl mx-auto text-center z-10">
          
          <motion.div 
            custom={0} initial="hidden" animate="visible" variants={heroVariants}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-50 text-[#dc2626] text-sm font-bold tracking-wide mb-10 relative overflow-hidden group border border-red-100 shadow-sm"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-200/50 to-transparent group-hover:animate-shimmer" />
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#dc2626]"></span>
            </span>
            Available for new projects
          </motion.div>

          <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.95] mb-8 text-[#0a0a0a]">
            <motion.div custom={1} initial="hidden" animate="visible" variants={heroVariants} className="overflow-hidden">
              Build Faster.
            </motion.div>
            <motion.div custom={2} initial="hidden" animate="visible" variants={heroVariants} className="overflow-hidden">
              Build Smarter.
            </motion.div>
            <motion.div custom={3} initial="hidden" animate="visible" variants={heroVariants} className="overflow-hidden">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc2626] to-[#ef4444]">
                Dominate.
              </span>
            </motion.div>
          </h1>
          
          <motion.p 
            custom={4} initial="hidden" animate="visible" variants={heroVariants}
            className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
          >
            I'm a full-stack developer specializing in high-performance web applications, SaaS platforms, and AI integrations.
          </motion.p>
          
          <motion.div 
            custom={5} initial="hidden" animate="visible" variants={heroVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          >
            <MagneticButton className="w-full sm:w-auto bg-[#dc2626] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#b91c1c] transition-colors flex items-center justify-center gap-3 shadow-xl shadow-red-600/20">
              Start a Project <ArrowRight className="w-5 h-5" />
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto bg-white border-2 border-gray-200 text-[#0a0a0a] px-10 py-5 rounded-full font-bold text-lg hover:border-[#0a0a0a] transition-colors">
              View Portfolio
            </MagneticButton>
          </motion.div>
          
          <motion.div 
            custom={6} initial="hidden" animate="visible" variants={heroVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-bold text-gray-500"
          >
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden z-[${10-i}]`}>
                     <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start">
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span><strong className="text-[#0a0a0a]">12+</strong> satisfied clients</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Scroll</span>
            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="py-12 border-y border-gray-100 bg-white overflow-hidden relative shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="flex w-max animate-marquee text-2xl md:text-4xl font-black text-gray-200 tracking-tighter uppercase opacity-60 hover:opacity-100 transition-opacity duration-500">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex gap-12 px-6 items-center">
              {['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Tailwind', 'AWS', 'Python', 'GraphQL', 'Docker'].map((tech, i) => (
                <span key={`${j}-${i}`} className="hover:text-[#dc2626] transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <motion.section 
        id="about" 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
        className="py-32 px-6"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-8">Engineering<br/><span className="text-[#dc2626]">with purpose.</span></h2>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed font-medium">
              I don't just write code; I build businesses. With over 8 years of experience engineering scalable systems from zero to production, I help startups and enterprises turn complex requirements into elegant, high-performance software.
            </p>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed font-medium">
              Every project is an opportunity to craft something exceptional. No bloated architecture, no unnecessary abstractions. Just clean, maintainable code that delivers real business value.
            </p>
            <div className="grid grid-cols-3 gap-8 border-t border-gray-200 pt-10">
              <AnimatedCounter value={10} label="Faster" suffix="x" />
              <AnimatedCounter value={100} label="Direct" suffix="%" />
              <AnimatedCounter value={0} label="Bureaucracy" suffix="" />
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-[#dc2626] translate-x-6 translate-y-6 rounded-2xl transition-transform duration-500 group-hover:translate-x-8 group-hover:translate-y-8" />
            <div className="relative z-10 aspect-[4/5] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                {/* Abstract CSS composition instead of image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300" />
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-xl shadow-xl flex items-center justify-center text-[#dc2626] font-black text-4xl transform -rotate-12">{'</>'}</div>
                <div className="absolute bottom-20 right-10 w-48 h-24 bg-white rounded-xl shadow-xl flex items-center px-6 gap-4 transform rotate-6">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-[#dc2626]"><CheckCircle2/></div>
                    <div className="h-3 w-16 bg-gray-200 rounded-full" />
                </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Services */}
      <section id="services" className="py-32 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">Expertise</h2>
            <p className="text-xl text-gray-600 font-medium">Specialized solutions tailored to your business goals.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="bg-white p-12 rounded-3xl border border-gray-200 hover:border-[#dc2626] hover:shadow-2xl hover:shadow-red-900/5 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-red-50 text-[#dc2626] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#dc2626] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
        className="py-32 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">The Process</h2>
              <p className="text-xl text-gray-600 font-medium max-w-xl">A streamlined, transparent approach to moving from concept to production.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-12 relative">
             <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gray-200" />
            {[
              { num: '01', title: 'Discovery', desc: 'Understanding your goals, requirements, and tech stack.' },
              { num: '02', title: 'Architecture', desc: 'Designing the system, database, and API structures.' },
              { num: '03', title: 'Development', desc: 'Iterative building with regular updates and feedback.' },
              { num: '04', title: 'Launch', desc: 'Testing, optimization, and seamless deployment.' }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                className="relative pt-8"
              >
                <div className="absolute top-[-10px] left-0 w-6 h-6 bg-white border-4 border-[#dc2626] rounded-full z-10 shadow-[0_0_0_8px_rgba(255,255,255,1)]" />
                <div className="text-6xl font-black text-gray-200 mb-6 tracking-tighter">{step.num}</div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Work */}
      <section id="work" className="py-32 px-6 bg-[#0a0a0a] text-white overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px] bg-[#dc2626]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
            className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8"
          >
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">Selected Work</h2>
              <p className="text-xl text-gray-400 max-w-2xl font-medium">A showcase of recent projects, spanning from complex SaaS products to high-converting marketing sites.</p>
            </div>
            <MagneticButton className="flex items-center gap-2 text-[#ef4444] hover:text-white font-bold text-lg transition-colors group">
              View All Projects <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { title: 'Fintech Dashboard', category: 'Web App', gradient: 'from-blue-600 to-cyan-400' },
              { title: 'AI Content Generator', category: 'SaaS Platform', gradient: 'from-emerald-600 to-teal-400' },
              { title: 'E-commerce Store', category: 'Architecture', gradient: 'from-purple-600 to-pink-400' }
            ].map((project, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group cursor-pointer block"
              >
                <div className="aspect-[4/5] rounded-3xl mb-8 overflow-hidden relative shadow-2xl">
                   <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} transition-transform duration-700 group-hover:scale-110`} />
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                   
                   {/* Abstract composition inside card */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay">
                      <div className="w-32 h-32 border-4 border-white rounded-full absolute" />
                      <div className="w-48 h-48 border-2 border-white rounded-full absolute translate-x-10 translate-y-10" />
                   </div>

                   <div className="absolute bottom-8 left-8 right-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                     <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold text-white mb-4 border border-white/20">
                       {project.category}
                     </span>
                     <h3 className="text-3xl font-black text-white">{project.title}</h3>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-white relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <motion.div 
             initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
             className="text-center max-w-3xl mx-auto mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">Transparent Pricing</h2>
            <p className="text-xl text-gray-600 font-medium">No surprises. Just high-quality code delivered on time.</p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center perspective-1000">
            {/* Starter */}
            <TiltCard>
              <h3 className="text-2xl font-black mb-2">Starter</h3>
              <p className="text-gray-500 font-medium mb-8">Perfect for MVPs and landing pages</p>
              <div className="text-5xl font-black mb-10 tracking-tighter">$2,500<span className="text-2xl text-gray-400 font-bold">+</span></div>
              <ul className="space-y-5 mb-10">
                {['Single page app', 'Responsive design', 'Basic animations', '1 week delivery'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-700 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-[#dc2626] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 border-2 border-[#0a0a0a] text-[#0a0a0a] rounded-xl font-bold text-lg hover:bg-[#0a0a0a] hover:text-white transition-colors">
                Get Started
              </button>
            </TiltCard>
            
            {/* Growth - Highlighted */}
            <TiltCard popular={true} className="lg:scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white px-6 py-1.5 rounded-full text-sm font-black uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
              <h3 className="text-2xl font-black mb-2">Growth</h3>
              <p className="text-gray-400 font-medium mb-8">For complete SaaS applications</p>
              <div className="text-6xl font-black mb-10 tracking-tighter text-[#dc2626]">$7,500<span className="text-2xl text-red-800 font-bold">+</span></div>
              <ul className="space-y-5 mb-10">
                {['Full-stack web application', 'Authentication & Database', 'Payment integration', 'API development', '3-4 weeks delivery'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-200 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-[#dc2626] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-[#dc2626] text-white rounded-xl font-bold text-lg hover:bg-[#b91c1c] transition-colors shadow-lg shadow-red-600/20">
                Get Started
              </button>
            </TiltCard>
            
            {/* Scale */}
            <TiltCard>
              <h3 className="text-2xl font-black mb-2">Scale</h3>
              <p className="text-gray-500 font-medium mb-8">For enterprise-grade systems</p>
              <div className="text-5xl font-black mb-10 tracking-tighter">Custom</div>
              <ul className="space-y-5 mb-10">
                {['Complex architecture', 'AI/LLM integrations', 'High availability setup', 'Ongoing maintenance', 'Custom timeline'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-700 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-[#dc2626] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 border-2 border-[#0a0a0a] text-[#0a0a0a] rounded-xl font-bold text-lg hover:bg-[#0a0a0a] hover:text-white transition-colors">
                Contact Me
              </button>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Contact */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}
        className="py-32 px-6"
      >
        <div className="max-w-5xl mx-auto bg-gray-50 rounded-[2.5rem] p-10 md:p-20 border border-gray-200 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px] bg-[#dc2626] pointer-events-none" />
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">Let's build something <span className="text-[#dc2626]">great.</span></h2>
            <p className="text-xl text-gray-600 font-medium">Fill out the form below or email me directly at <a href="mailto:hello@pykode.com" className="text-[#dc2626] font-bold hover:underline">hello@pykode.com</a></p>
          </div>
          
          <form className="space-y-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Name</label>
                <input type="text" className="w-full px-6 py-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent transition-all shadow-sm" placeholder="John Doe" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Email</label>
                <input type="email" className="w-full px-6 py-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent transition-all shadow-sm" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Project Details</label>
              <textarea rows={5} className="w-full px-6 py-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent transition-all shadow-sm resize-none" placeholder="Tell me about your project, timeline, and budget..."></textarea>
            </div>
            <MagneticButton type="button" className="w-full bg-[#0a0a0a] hover:bg-[#dc2626] text-white font-black text-xl py-6 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-xl">
              Send Message <Mail className="w-6 h-6" />
            </MagneticButton>
          </form>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] pt-20 pb-10 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#dc2626] text-white flex items-center justify-center font-black text-xl rounded-xl">
              pK
            </div>
            <span className="font-black text-3xl tracking-tighter text-white">pyKode.</span>
          </div>
          
          <div className="text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} pyKode. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-gray-400">
            <a href="#" className="p-3 bg-gray-900 rounded-full hover:bg-[#dc2626] hover:text-white transition-all"><Github className="w-5 h-5" /></a>
            <a href="#" className="p-3 bg-gray-900 rounded-full hover:bg-[#dc2626] hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="p-3 bg-gray-900 rounded-full hover:bg-[#dc2626] hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}} />
    </div>
  );
}
