import React, { useState } from 'react';
import { Menu, X, ArrowRight, Code, Zap, Smartphone, Terminal, ChevronRight, Check, Send } from 'lucide-react';

export default function HomeOrange() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafaf8] text-gray-900 font-sans selection:bg-orange-500 selection:text-white pb-24">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#fafaf8]/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tighter">
            py<span className="text-orange-600">Kode</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className="hover:text-orange-600 transition-colors">About</a>
            <a href="#services" className="hover:text-orange-600 transition-colors">Services</a>
            <a href="#process" className="hover:text-orange-600 transition-colors">Process</a>
            <a href="#work" className="hover:text-orange-600 transition-colors">Work</a>
            <a href="#pricing" className="hover:text-orange-600 transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:block">
            <a href="#contact" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-200">
              Hire Me
            </a>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Engineering digital experiences with <span className="text-orange-600">precision.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
            I'm a freelance full-stack engineer building fast, scalable, and premium web applications for ambitious brands and startups. 100% direct, 0 bureaucracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all">
              Start a Project <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#work" className="bg-white border border-gray-300 hover:border-gray-400 text-gray-900 px-8 py-4 rounded-full font-semibold flex items-center justify-center transition-all">
              View My Work
            </a>
          </div>
        </div>
      </section>

      {/* Tech Marquee (CSS only visual) */}
      <div className="border-y border-gray-200 bg-white py-6 overflow-hidden flex relative">
        <div className="flex gap-12 animate-marquee whitespace-nowrap px-4 font-mono text-sm text-gray-400 uppercase tracking-wider">
          <span>React</span> • <span>Next.js</span> • <span>TypeScript</span> • <span>Node.js</span> • <span>PostgreSQL</span> • <span>Tailwind CSS</span> • <span>Python</span> • <span>AWS</span> • <span>React</span> • <span>Next.js</span> • <span>TypeScript</span> • <span>Node.js</span>
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* About Section */}
      <section id="about" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">The difference is in the details.</h2>
            <p className="text-lg text-gray-600 mb-6">
              When you hire me, you don't get an account manager or a junior dev learning on your dime. You get me directly—building your product from architecture to deployment.
            </p>
            <p className="text-lg text-gray-600">
              I specialize in taking complex requirements and turning them into intuitive, blazing-fast applications that your users will actually love using.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-4xl font-black text-orange-600 mb-2">10x</div>
              <div className="font-medium text-gray-900">Faster delivery</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-4xl font-black text-orange-600 mb-2">100%</div>
              <div className="font-medium text-gray-900">Direct communication</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-4xl font-black text-orange-600 mb-2">0</div>
              <div className="font-medium text-gray-900">Bureaucracy</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-4xl font-black text-orange-600 mb-2">5+</div>
              <div className="font-medium text-gray-900">Years experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Expertise</h2>
            <p className="text-xl text-gray-600 max-w-2xl">What I can build for you.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Code className="w-8 h-8 text-orange-600" />, title: "Web Applications", desc: "Complex SPAs, dashboards, and portals built with React and modern tooling." },
              { icon: <Zap className="w-8 h-8 text-orange-600" />, title: "SaaS Products", desc: "End-to-end architecture, multi-tenant databases, authentication, and payments." },
              { icon: <Terminal className="w-8 h-8 text-orange-600" />, title: "AI Integration", desc: "LLM wrappers, RAG pipelines, and intelligent features powered by OpenAI/Anthropic." },
              { icon: <Smartphone className="w-8 h-8 text-orange-600" />, title: "Landing Pages", desc: "High-converting, interactive, and fully optimized marketing sites." }
            ].map((service, i) => (
              <div key={i} className="p-8 rounded-2xl bg-[#fafaf8] border border-gray-100 hover:border-orange-200 transition-colors">
                <div className="mb-6 bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">How we work</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">A streamlined process focused on shipping.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Discover", desc: "We define the scope, goals, and technical architecture." },
            { step: "02", title: "Design", desc: "I create high-fidelity prototypes and UI components." },
            { step: "03", title: "Build", desc: "Clean, testable code written with modern best practices." },
            { step: "04", title: "Ship", desc: "Deployment, optimization, and post-launch support." }
          ].map((phase, i) => (
            <div key={i} className="relative">
              <div className="text-6xl font-black text-gray-100 mb-4">{phase.step}</div>
              <h3 className="text-xl font-bold mb-2">{phase.title}</h3>
              <p className="text-gray-600">{phase.desc}</p>
              {i < 3 && <div className="hidden md:block absolute top-10 right-0 w-full h-[2px] bg-gray-100 -z-10 translate-x-1/2"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Work / Portfolio */}
      <section id="work" className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Selected Work</h2>
              <p className="text-xl text-gray-600 max-w-2xl">Recent projects I've built.</p>
            </div>
            <a href="#" className="hidden md:flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700">
              View GitHub <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Fintech Dashboard", tag: "SaaS", gradient: "from-orange-100 to-amber-200" },
              { title: "AI Writing Assistant", tag: "AI Integration", gradient: "from-stone-200 to-orange-100" },
              { title: "E-Commerce Platform", tag: "Web App", gradient: "from-orange-50 to-stone-200" }
            ].map((project, i) => (
              <div key={i} className="group cursor-pointer">
                <div className={`aspect-[4/3] rounded-2xl mb-6 bg-gradient-to-br ${project.gradient} border border-gray-100 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:-translate-y-2`}>
                  {/* Decorative internal card */}
                  <div className="w-3/4 h-3/4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm flex items-center justify-center">
                    <span className="font-mono text-sm text-gray-500">Project Thumbnail</span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wider">{project.tag}</div>
                <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors">{project.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simple, predictable rates for high-quality engineering.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Starter", price: "$2,500", desc: "Perfect for landing pages and simple MVPs.", features: ["Responsive design", "SEO optimization", "Contact forms", "1 week delivery"] },
            { name: "Growth", price: "$6,500", desc: "For fully functional web applications.", popular: true, features: ["Database setup", "Authentication", "Payment integration", "3-4 weeks delivery"] },
            { name: "Scale", price: "Custom", desc: "Complex SaaS products and AI integrations.", features: ["Custom architecture", "Scalable infrastructure", "Ongoing support", "Timeline varies"] }
          ].map((tier, i) => (
            <div key={i} className={`rounded-3xl p-8 border ${tier.popular ? 'border-orange-600 border-2 shadow-xl relative' : 'border-gray-200 bg-white'}`}>
              {tier.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">MOST POPULAR</div>}
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-black">{tier.price}</span>
                {tier.price !== "Custom" && <span className="text-gray-500">/project</span>}
              </div>
              <p className="text-gray-600 mb-8 h-12">{tier.desc}</p>
              
              <ul className="space-y-4 mb-8">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className="bg-orange-100 p-1 rounded-full text-orange-600"><Check className="w-3 h-3" strokeWidth={3} /></div>
                    <span className="text-gray-700 font-medium">{f}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-4 rounded-xl font-bold transition-colors ${tier.popular ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                Choose {tier.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-900 text-white px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Let's build something great.</h2>
            <p className="text-lg text-gray-400 mb-8">
              Have a project in mind? Fill out the form and I'll get back to you within 24 hours.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-semibold text-white">Email me</div>
                  <div className="text-sm">hello@pykode.dev</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" placeholder="Tell me about your project..."></textarea>
              </div>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-white/10 py-10 px-6 text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-xl text-white tracking-tighter">
            py<span className="text-orange-500">Kode</span>
          </div>
          <div>© {new Date().getFullYear()} pyKode. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
