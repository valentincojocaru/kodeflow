import React from 'react';
import { ArrowRight, Code, Database, Layout, Smartphone, Star, CheckCircle2, Mail, Github, Twitter, Linkedin, ChevronRight } from 'lucide-react';

export default function HomeRed() {
  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] font-sans selection:bg-red-600 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center font-bold text-xl rounded">
              pK
            </div>
            <span className="font-bold text-xl tracking-tight">pyKode.</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
            <a href="#about" className="hover:text-red-600 transition-colors">About</a>
            <a href="#services" className="hover:text-red-600 transition-colors">Services</a>
            <a href="#work" className="hover:text-red-600 transition-colors">Work</a>
            <a href="#pricing" className="hover:text-red-600 transition-colors">Pricing</a>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded text-sm font-semibold transition-colors">
            Hire Me
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Available for new projects
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8 text-[#0f0f0f]">
            Building digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-coral-400" style={{ backgroundImage: 'linear-gradient(to right, #dc2626, #f87171)' }}>
              experiences that scale.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            I'm a full-stack developer specializing in high-performance web applications, SaaS platforms, and AI integrations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded font-bold text-lg transition-colors flex items-center justify-center gap-2">
              Start a Project <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 px-8 py-4 rounded font-bold text-lg transition-colors">
              View Portfolio
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <span className="text-gray-900 font-bold">5.0</span>
              <span>(40+ reviews)</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
            <div>
              <span className="text-gray-900 font-bold">50+</span> Happy Clients
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="py-10 border-y border-gray-100 bg-gray-50 overflow-hidden">
        <div className="flex gap-4 whitespace-nowrap animate-marquee">
          {['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Tailwind CSS', 'AWS', 'Python', 'GraphQL', 'Docker', 'React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL'].map((tech, i) => (
            <span key={i} className="px-6 py-2 bg-white border border-gray-200 rounded-full text-gray-600 font-medium">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Engineering with purpose.</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              I don't just write code; I build businesses. With over 8 years of experience engineering scalable systems from zero to production, I help startups and enterprises turn complex requirements into elegant, high-performance software.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-5xl font-black text-red-600 mb-2">8+</div>
                <div className="font-medium text-gray-500">Years Experience</div>
              </div>
              <div>
                <div className="text-5xl font-black text-red-600 mb-2">100%</div>
                <div className="font-medium text-gray-500">Client Satisfaction</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 translate-x-4 translate-y-4 rounded"></div>
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=600" 
              alt="Developer workspace" 
              className="relative z-10 w-full h-auto object-cover rounded border border-gray-200"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Expertise</h2>
            <p className="text-lg text-gray-600">Specialized solutions tailored to your business goals.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Web Applications', desc: 'Custom, high-performance web apps built with modern frameworks like React and Next.js.', icon: <Layout className="w-8 h-8" /> },
              { title: 'SaaS Platforms', desc: 'End-to-end SaaS development including architecture, payment integration, and multi-tenancy.', icon: <Database className="w-8 h-8" /> },
              { title: 'AI Integration', desc: 'Leveraging LLMs and machine learning APIs to build intelligent features into your product.', icon: <Code className="w-8 h-8" /> },
              { title: 'Mobile-First Landing Pages', desc: 'High-converting, accessible landing pages optimized for speed and SEO.', icon: <Smartphone className="w-8 h-8" /> },
            ].map((service, i) => (
              <div key={i} className="bg-white p-10 rounded-lg border border-gray-100 hover:border-red-600 transition-colors group">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">The Process</h2>
            <p className="text-lg text-gray-600">How we get from concept to deployment.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Discovery', desc: 'Understanding your goals, requirements, and tech stack.' },
              { num: '02', title: 'Architecture', desc: 'Designing the system, database, and API structures.' },
              { num: '03', title: 'Development', desc: 'Iterative building with regular updates and feedback.' },
              { num: '04', title: 'Launch', desc: 'Testing, optimization, and seamless deployment.' }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-black text-gray-100 mb-6">{step.num}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
                {i !== 3 && <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gray-200 -z-10"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="py-32 px-6 bg-[#0f0f0f] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Selected Work</h2>
              <p className="text-lg text-gray-400 max-w-2xl">A showcase of recent projects, spanning from complex SaaS products to high-converting marketing sites.</p>
            </div>
            <button className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold transition-colors">
              View All Projects <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { title: 'Fintech Dashboard', category: 'Web App', color: 'bg-blue-600' },
              { title: 'AI Content Generator', category: 'SaaS Platform', color: 'bg-emerald-600' },
              { title: 'E-commerce Storefront', category: 'Architecture', color: 'bg-purple-600' }
            ].map((project, i) => (
              <div key={i} className="group cursor-pointer">
                <div className={`aspect-[4/3] ${project.color} rounded mb-6 overflow-hidden relative`}>
                   {/* Placeholder for actual project image */}
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                   <div className="absolute bottom-6 left-6 right-6">
                     <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded text-sm font-medium text-white mb-3">
                       {project.category}
                     </span>
                     <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Transparent Pricing</h2>
            <p className="text-lg text-gray-600">No surprises. Just high-quality code delivered on time.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-gray-500 text-sm mb-6">Perfect for MVPs and landing pages</p>
              <div className="text-4xl font-black mb-8">$2,500+</div>
              <ul className="space-y-4 mb-8">
                {['Single page app / Landing page', 'Responsive design', 'Basic animations', '1 week delivery'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 border-2 border-gray-900 rounded font-bold hover:bg-gray-900 hover:text-white transition-colors">
                Get Started
              </button>
            </div>
            
            {/* Growth - Highlighted */}
            <div className="bg-[#0f0f0f] p-8 rounded-xl border border-gray-800 text-white relative transform md:-translate-y-4 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Growth</h3>
              <p className="text-gray-400 text-sm mb-6">For complete SaaS applications</p>
              <div className="text-4xl font-black mb-8">$7,500+</div>
              <ul className="space-y-4 mb-8">
                {['Full-stack web application', 'Authentication & Database', 'Payment integration', 'API development', '3-4 weeks delivery'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-bold transition-colors">
                Get Started
              </button>
            </div>
            
            {/* Scale */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2">Scale</h3>
              <p className="text-gray-500 text-sm mb-6">For enterprise-grade systems</p>
              <div className="text-4xl font-black mb-8">Custom</div>
              <ul className="space-y-4 mb-8">
                {['Complex architecture', 'AI/LLM integrations', 'High availability setup', 'Ongoing maintenance', 'Custom timeline'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 border-2 border-gray-900 rounded font-bold hover:bg-gray-900 hover:text-white transition-colors">
                Contact Me
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl p-8 md:p-16 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">Let's build something great.</h2>
            <p className="text-gray-600">Fill out the form below or email me directly at <a href="mailto:hello@pykode.com" className="text-red-600 font-semibold hover:underline">hello@pykode.com</a></p>
          </div>
          
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Name</label>
                <input type="text" className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Project Details</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow resize-none" placeholder="Tell me about your project..."></textarea>
            </div>
            <button type="button" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded transition-colors flex items-center justify-center gap-2">
              Send Message <Mail className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 text-white flex items-center justify-center font-bold text-xs rounded">
              pK
            </div>
            <span className="font-bold tracking-tight text-gray-900">pyKode.</span>
          </div>
          
          <div className="text-sm text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} pyKode. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4 text-gray-400">
            <a href="#" className="hover:text-red-600 transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-red-600 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-red-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}} />
    </div>
  );
}
