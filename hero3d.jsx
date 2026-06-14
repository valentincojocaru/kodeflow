const { useRef, useEffect, useState, useContext, createContext } = React;

// ════════════════════════════════════════════════════════════
//  AI CORE — original Three.js scene (neural agent)
// ════════════════════════════════════════════════════════════
function AICore() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !window.THREE) return;
    const THREE = window.THREE;

    const W = () => mount.clientWidth || (mount.parentElement && mount.parentElement.clientWidth) || window.innerWidth || 1;
    const H = () => mount.clientHeight || (mount.parentElement && mount.parentElement.clientHeight) || Math.round(window.innerHeight * 0.7) || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(W(), H());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ── Core crystal (icosahedron) — glassy faceted gem ──
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1c150d, metalness: 0.9, roughness: 0.28,
      emissive: 0xff7a18, emissiveIntensity: 0.18,
      flatShading: true, transparent: true, opacity: 0.92,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // glowing wireframe over the crystal
    const wireGeo = new THREE.IcosahedronGeometry(1.53, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffae5a, wireframe: true, transparent: true, opacity: 0.32 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    // inner bright kernel
    const kernel = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 0),
      new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.9 })
    );
    group.add(kernel);

    // ── Neural nodes orbiting (the "agents") ──
    const NODES = 26;
    const nodeGroup = new THREE.Group();
    group.add(nodeGroup);
    const nodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffc06a });
    const nodeMat2 = new THREE.MeshBasicMaterial({ color: 0x8f7bff });
    for (let i = 0; i < NODES; i++) {
      const m = new THREE.Mesh(nodeGeo, i % 5 === 0 ? nodeMat2 : nodeMat);
      // fibonacci sphere distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / NODES);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.6 + (i % 3) * 0.35;
      m.userData = { phi, theta, r, speed: 0.12 + (i % 4) * 0.04, base: r };
      m.position.setFromSphericalCoords(r, phi, theta);
      nodeGroup.add(m);
      nodes.push(m);
    }

    // ── Connection lines (neural links) ──
    const linePositions = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].position.distanceTo(nodes[j].position) < 1.5 && Math.random() > 0.55) {
          linePositions.push(nodes[i], nodes[j]);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    const linePosAttr = new Float32Array(linePositions.length * 3);
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePosAttr, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff8a30, transparent: true, opacity: 0.18 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // ── Ambient particle dust ──
    const dustCount = 320;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = 3.4 + Math.random() * 3.2;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(b) * Math.cos(a);
      dustPos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
      dustPos[i * 3 + 2] = r * Math.cos(b);
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffb366, size: 0.028, transparent: true, opacity: 0.5 }));
    scene.add(dust);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x402810, 1.1));
    const p1 = new THREE.PointLight(0xff7a18, 2.4, 30); p1.position.set(5, 4, 5); scene.add(p1);
    const p2 = new THREE.PointLight(0x5a4bff, 1.4, 30); p2.position.set(-6, -3, 2); scene.add(p2);
    const p3 = new THREE.PointLight(0xffc06a, 1.2, 30); p3.position.set(0, -5, 4); scene.add(p3);

    // ── Mouse parallax ──
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    let raf, t = 0;
    const tmp = new THREE.Vector3();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.01;
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;

      const sp = reduce ? 0.2 : 1;
      group.rotation.y += 0.0024 * sp;
      group.rotation.x = cur.y * 0.4;
      group.rotation.y += (cur.x * 0.4 - group.rotation.y * 0) * 0; // keep spin
      group.rotation.z = cur.x * 0.08;
      wire.rotation.y -= 0.004 * sp;
      wire.rotation.x += 0.002 * sp;
      core.rotation.y -= 0.0012 * sp;
      kernel.rotation.x += 0.02 * sp;
      kernel.rotation.y += 0.016 * sp;
      const pulse = 0.9 + Math.sin(t * 2.2) * 0.12;
      kernel.scale.setScalar(pulse);

      // breathe nodes
      nodes.forEach((m, i) => {
        const u = m.userData;
        const rr = u.base + Math.sin(t * u.speed * 6 + i) * 0.12;
        m.position.setFromSphericalCoords(rr, u.phi + Math.sin(t * 0.3 + i) * 0.04, u.theta + t * u.speed * 0.4);
      });
      nodeGroup.rotation.y = t * 0.06;

      // update links
      const pa = lineGeo.attributes.position.array;
      for (let k = 0; k < linePositions.length; k++) {
        linePositions[k].getWorldPosition(tmp);
        group.worldToLocal(tmp);
        pa[k * 3] = linePositions[k].position.x;
        pa[k * 3 + 1] = linePositions[k].position.y;
        pa[k * 3 + 2] = linePositions[k].position.z;
      }
      lineGeo.attributes.position.needsUpdate = true;

      dust.rotation.y = -t * 0.02;
      dust.rotation.x = t * 0.01;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = W(), h = H();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);
    if (mount.parentElement) ro.observe(mount.parentElement);
    window.addEventListener("resize", onResize);
    const rt0 = setTimeout(onResize, 60);
    const rt1 = setTimeout(onResize, 300);
    const rt2 = setTimeout(onResize, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt0); clearTimeout(rt1); clearTimeout(rt2);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true" />;
}

// ════════════════════════════════════════════════════════════
//  NAVBAR
// ════════════════════════════════════════════════════════════
function Navbar({ onHire }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["About", "Services", "Process", "Work", "Pricing"];
  const ids = ["about", "services", "process", "work", "pricing"];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      transition: "all .4s ease",
    }}>
      <div style={{
        margin: scrolled ? "12px auto" : "20px auto", maxWidth: "var(--maxw)",
        padding: scrolled ? "0 10px" : "0 24px", transition: "all .4s ease",
      }}>
        <div className="glass" style={{
          borderRadius: 999, height: 62, padding: "0 14px 0 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: scrolled ? undefined : "none",
          background: scrolled ? "var(--glass-bg-2)" : "rgba(255,255,255,0.02)",
          transition: "background .4s ease",
        }}>
          <a href="#top" style={{ fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em", color: "var(--ink)", textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "linear-gradient(var(--amber),var(--orange))", boxShadow: "0 0 14px rgba(255,122,24,0.9)" }}></span>
            py<span className="grad-orange">Kode</span>
          </a>

          <nav style={{ display: "flex", alignItems: "center", gap: 30 }} className="nav-links">
            {links.map((l, i) => (
              <a key={l} href={"#" + ids[i]} style={{ fontSize: 14, color: "var(--ink-mute)", textDecoration: "none", fontWeight: 500, transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--ink-mute)"}>{l}</a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="#contact" className="portal-link" style={{ fontSize: 13, color: "var(--ink-soft)", textDecoration: "none", padding: "9px 15px", borderRadius: 999, border: "1px solid var(--glass-brd-soft)", display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span className="mono" style={{ fontSize: 11 }}>↗</span> Client Portal
            </a>
            <button onClick={onHire} className="btn-primary nav-cta" style={{ padding: "11px 20px", fontSize: 14 }}>Start a Project</button>
            <button onClick={() => setOpen(o => !o)} className="nav-burger" aria-label="Menu" style={{ display: "none", width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", cursor: "pointer", background: "var(--glass-bg)", border: "1px solid var(--glass-brd-soft)", color: "var(--ink)" }}>
              <div style={{ position: "relative", width: 18, height: 12 }}>
                <span style={{ position: "absolute", left: 0, top: open ? 5 : 0, width: 18, height: 2, borderRadius: 2, background: "currentColor", transition: "all .3s", transform: open ? "rotate(45deg)" : "none" }}></span>
                <span style={{ position: "absolute", left: 0, top: 5, width: 18, height: 2, borderRadius: 2, background: "currentColor", transition: "opacity .2s", opacity: open ? 0 : 1 }}></span>
                <span style={{ position: "absolute", left: 0, top: open ? 5 : 10, width: 18, height: 2, borderRadius: 2, background: "currentColor", transition: "all .3s", transform: open ? "rotate(-45deg)" : "none" }}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="nav-mobile" style={{ display: "none", overflow: "hidden", maxHeight: open ? 460 : 0, opacity: open ? 1 : 0, transition: "max-height .42s cubic-bezier(.16,1,.3,1), opacity .3s, margin .3s", marginTop: open ? 10 : 0 }}>
          <div className="glass-2" style={{ borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", gap: 4 }}>
            {links.map((l, i) => (
              <a key={l} href={"#" + ids[i]} onClick={() => setOpen(false)} style={{ fontSize: 16, color: "var(--ink-soft)", textDecoration: "none", fontWeight: 500, padding: "13px 16px", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {l} <span className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>0{i + 1}</span>
              </a>
            ))}
            <div style={{ height: 1, margin: "6px 8px", background: "var(--glass-brd-soft)" }}></div>
            <a href="#contact" onClick={() => setOpen(false)} style={{ fontSize: 15, color: "var(--ink-soft)", textDecoration: "none", fontWeight: 500, padding: "13px 16px", borderRadius: 13, display: "inline-flex", alignItems: "center", gap: 9 }}>
              <span className="mono" style={{ fontSize: 12 }}>↗</span> Client Portal
            </a>
            <button onClick={() => { setOpen(false); onHire(); }} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Start a Project →</button>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px){
          .nav-links{ display:none !important; }
          .portal-link{ display:none !important; }
          .nav-cta{ display:none !important; }
          .nav-burger{ display:inline-flex !important; }
          .nav-mobile{ display:block !important; }
        }
      `}</style>
    </header>
  );
}

// ════════════════════════════════════════════════════════════
//  HERO
// ════════════════════════════════════════════════════════════
function Hero({ onHire }) {
  return (
    <section id="top" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 120, paddingBottom: 60 }}>
      <div className="container" style={{ width: "100%" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 40, alignItems: "center" }}>

          {/* Left: copy */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="pill reveal" style={{ marginBottom: 30 }}>
              <span className="dot-live"></span>
              <span style={{ color: "var(--ink-soft)" }}>Available for new projects · 2026</span>
            </div>

            <h1 className="serif text-balance" style={{ fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 0.98, letterSpacing: "-0.02em", marginBottom: 26 }}>
              <span style={{ display: "block", overflow: "hidden" }}><span className="hero-line" style={{ display: "block" }}>Web apps,</span></span>
              <span style={{ display: "block", overflow: "hidden" }}><span className="hero-line hl2" style={{ display: "block" }}>engineered</span></span>
              <span style={{ display: "block", overflow: "hidden" }}><span className="hero-line hl3 grad-orange serif-i" style={{ display: "block", paddingBottom: "0.08em" }}>to perform.</span></span>
            </h1>

            <p className="text-pretty reveal" style={{ fontSize: 18, color: "var(--ink-soft)", maxWidth: 460, lineHeight: 1.65, marginBottom: 38, fontWeight: 300 }}>
              I'm Kode — an independent full-stack engineer. I design and build premium, fast and scalable web products, delivered in weeks, not months.
            </p>

            <div className="reveal" style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={onHire} className="btn-primary">Start a Project <span style={{ fontSize: 17 }}>→</span></button>
              <a href="#work" className="btn-ghost">View My Work</a>
            </div>

            <div className="reveal" style={{ marginTop: 46, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {[
                { v: "10×", l: "faster delivery" },
                { v: "24h", l: "reply time" },
                { v: "100%", l: "you own the code" },
              ].map((s, i) => (
                <div key={i} className="glass" style={{ borderRadius: 14, padding: "10px 16px" }}>
                  <span className="serif grad-orange" style={{ fontSize: 22, lineHeight: 1, marginRight: 8 }}>{s.v}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI core 3D */}
          <div className="hero-core" style={{ position: "relative", height: "min(74vh, 620px)" }}>
            <div style={{ position: "absolute", inset: "-6%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,24,0.16), transparent 62%)", filter: "blur(20px)" }}></div>
            <AICore />
            {/* floating glass HUD chips */}
            <div className="glass-2 hud-chip" style={{ position: "absolute", top: "12%", left: "2%", borderRadius: 16, padding: "12px 16px", animation: "floatY 6s ease-in-out infinite" }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.1em" }}>CI · BUILD</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>Build <span className="grad-orange">passed</span> · 0 errors</div>
            </div>
            <div className="glass-2 hud-chip" style={{ position: "absolute", bottom: "14%", right: "0%", borderRadius: 16, padding: "12px 16px", animation: "floatY 7s ease-in-out infinite 1s" }}>
              <div className="mono" style={{ fontSize: 10, color: "#9f8fff", letterSpacing: "0.1em" }}>● LIVE · DEPLOY</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>61ms · 99.9% uptime</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatY { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-12px) } }
        .hero-line { transform: translateY(105%); animation: heroUp .95s cubic-bezier(.16,1,.3,1) forwards; }
        .hl2 { animation-delay: .1s; }
        .hl3 { animation-delay: .2s; }
        @keyframes heroUp { to { transform: translateY(0); } }
        @media (max-width: 920px){
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-core { height: 380px !important; order: -1; }
          .hud-chip { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce){ .hero-line{ animation: none; transform:none; } }
      `}</style>
    </section>
  );
}

Object.assign(window, { AICore, Navbar, Hero });

