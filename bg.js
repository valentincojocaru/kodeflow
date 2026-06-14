/* ════════════════════════════════════════════════════════════
   pyKode — engineering parallax background (canvas)
   Layered, depth-based, scroll-parallax:
   • far  : data-graph nodes connected by faint lines (the "mesh")
   • mid  : drifting code tokens (</>, {}, =>, npm, async…)
   • near : bright data packets travelling along connections
   Single rAF. Pauses when tab hidden. Respects reduced-motion.
   ════════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById("fxbg");
  if (!canvas || !canvas.getContext) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [], tokens = [], packets = [];
  let scrollY = window.scrollY || 0;

  const TOKENS = ["</>", "{ }", "=>", "()", "[]", "async", "await", "const", "git push",
    "npm i", "build()", "deploy", "0xFF", "useState", "return", "===", "ship", "scale",
    "fn()", "import", "<Kode/>", "200 OK", "ƒ", "λ", "#!/bin", "v2.0", "commit"];

  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    init();
  }

  function init() {
    // far mesh nodes (depth 0.25) — count scales with area
    const n = Math.max(44, Math.min(110, Math.round((W * H) / 18000)));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 0.7, depth: 0.18 + Math.random() * 0.22,
      cool: Math.random() > 0.72,
    }));
    // mid code tokens (depth 0.4–0.9)
    const t = Math.max(20, Math.min(42, Math.round(W / 40)));
    tokens = Array.from({ length: t }, () => spawnToken(true));
    // packets travelling
    packets = [];
  }

  function spawnToken(initial) {
    const depth = 0.4 + Math.random() * 0.55;
    return {
      txt: TOKENS[(Math.random() * TOKENS.length) | 0],
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 40,
      sp: 0.15 + depth * 0.5,
      depth,
      size: 10 + depth * 16,
      drift: (Math.random() - 0.5) * 0.25,
      cool: Math.random() > 0.8,
      ph: Math.random() * 6.28,
    };
  }

  let raf, t = 0, running = true;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    t += 0.016;
    const py = scrollY;
    ctx.clearRect(0, 0, W, H);

    // ── perspective grid floor (engineering data-plane) ──
    drawGrid(py);

    // ── far mesh: nodes + connections ──
    for (const nd of nodes) {
      nd.x += nd.vx; nd.y += nd.vy;
      if (nd.x < -20) nd.x = W + 20; if (nd.x > W + 20) nd.x = -20;
      if (nd.y < -20) nd.y = H + 20; if (nd.y > H + 20) nd.y = -20;
    }
    const MAXD = 168;
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const ay = a.y - py * a.depth;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < MAXD) {
          const by = b.y - py * b.depth;
          const al = (1 - d / MAXD) * 0.4;
          ctx.strokeStyle = a.cool || b.cool
            ? `rgba(140,128,255,${al})`
            : `rgba(255,150,60,${al})`;
          ctx.beginPath(); ctx.moveTo(a.x, ay); ctx.lineTo(b.x, by); ctx.stroke();
        }
      }
    }
    for (const nd of nodes) {
      const ny = nd.y - py * nd.depth;
      const glow = 0.5 + 0.5 * Math.sin(t * 1.5 + nd.x);
      ctx.beginPath(); ctx.arc(nd.x, ny, nd.r, 0, 6.28);
      ctx.fillStyle = nd.cool
        ? `rgba(160,150,255,${0.6 + glow * 0.4})`
        : `rgba(255,180,100,${0.6 + glow * 0.4})`;
      ctx.shadowBlur = 12; ctx.shadowColor = nd.cool ? "rgba(120,108,255,0.8)" : "rgba(255,138,48,0.8)";
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // occasionally fire a packet along a near connection
    if (packets.length < 30 && Math.random() < 0.14 && nodes.length > 2) {
      const a = nodes[(Math.random() * nodes.length) | 0];
      let best = null, bd = 999;
      for (const b of nodes) { if (b === a) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < bd && d > 30) { bd = d; best = b; } }
      if (best && bd < 150) packets.push({ a, b: best, p: 0, sp: 0.012 + Math.random() * 0.02 });
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      const pk = packets[i]; pk.p += pk.sp;
      if (pk.p >= 1) { packets.splice(i, 1); continue; }
      const ax = pk.a.x, ay = pk.a.y - py * pk.a.depth;
      const bx = pk.b.x, by = pk.b.y - py * pk.b.depth;
      const x = ax + (bx - ax) * pk.p, y = ay + (by - ay) * pk.p;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.28);
      ctx.fillStyle = "rgba(255,225,180,0.95)";
      ctx.shadowBlur = 12; ctx.shadowColor = "rgba(255,150,60,0.9)"; ctx.fill();
    }
    ctx.shadowBlur = 0;

    // ── mid: drifting code tokens (parallax) ──
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const tk of tokens) {
      tk.y -= tk.sp; tk.x += tk.drift + Math.sin(t * 0.5 + tk.ph) * 0.2;
      const yy = tk.y - py * (tk.depth * 0.5);
      if (yy < -50) { Object.assign(tk, spawnToken(false)); continue; }
      const op = (0.09 + tk.depth * 0.22) * (0.7 + 0.3 * Math.sin(t + tk.ph));
      ctx.font = `${tk.depth > 0.7 ? "600" : "400"} ${tk.size}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tk.cool ? `rgba(150,140,255,${op})` : `rgba(255,176,96,${op})`;
      ctx.fillText(tk.txt, tk.x, yy);
    }
    ctx.font = "";

    // ── edge fade (canvas-native, works on every browser incl. Samsung) ──
    ctx.globalCompositeOperation = "destination-in";
    const mg = ctx.createLinearGradient(0, 0, W, 0);
    mg.addColorStop(0, "rgba(0,0,0,0)");
    mg.addColorStop(0.16, "rgba(0,0,0,1)");
    mg.addColorStop(0.84, "rgba(0,0,0,1)");
    mg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H);
    const vg = ctx.createLinearGradient(0, 0, 0, H);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(0.12, "rgba(0,0,0,1)");
    vg.addColorStop(0.8, "rgba(0,0,0,1)");
    vg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }

  function onScroll() { scrollY = window.scrollY; }

  // perspective grid converging to a horizon (drawn faint, brand orange)
  function drawGrid(py) {
    const horizon = H * 0.62 - py * 0.04;
    const vpx = W * 0.5;
    const scroll = (t * 26) % 60;
    ctx.lineWidth = 1;
    // receding horizontal lines
    for (let i = 0; i < 18; i++) {
      const f = (i * 60 + scroll) / (18 * 60);
      const yy = horizon + Math.pow(f, 2.1) * (H - horizon) * 1.25;
      if (yy < horizon || yy > H) continue;
      const al = (1 - f) * 0.13;
      ctx.strokeStyle = `rgba(255,140,55,${al})`;
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
    }
    // converging vertical lines
    for (let i = -10; i <= 10; i++) {
      const bx = vpx + i * (W / 9);
      const al = (1 - Math.abs(i) / 11) * 0.1;
      ctx.strokeStyle = `rgba(255,150,60,${al})`;
      ctx.beginPath(); ctx.moveTo(vpx + i * 14, horizon); ctx.lineTo(bx, H); ctx.stroke();
    }
    // horizon glow line
    const g = ctx.createLinearGradient(0, horizon, W, horizon);
    g.addColorStop(0, "rgba(255,122,24,0)"); g.addColorStop(0.5, "rgba(255,170,90,0.35)"); g.addColorStop(1, "rgba(255,122,24,0)");
    ctx.strokeStyle = g; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, horizon); ctx.lineTo(W, horizon); ctx.stroke();
    ctx.lineWidth = 1;
  }

  if (!reduce) {
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", () => { running = !document.hidden; });
    frame();
  } else {
    // static, minimal: draw one mesh frame
    resize();
    running = false;
  }
})();
