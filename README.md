# Kodeflow — premium site (prototype)

Self-contained marketing site for Kode. Open `index.html` in any browser — no build step.

## Files
- `index.html` — page shell, styles, intro animation, meta/OG tags
- `hero3d.jsx` — navbar + hero with the 3D crystal (Three.js)
- `sections.jsx` / `sections2.jsx` — all content sections
- `addons.jsx` — **price calculator** + **FAQ**
- `assistant.jsx` — "Kai" chat assistant (uses window.claude in this preview)
- `bg.js` — animated engineering parallax background
- `fx.js` — scroll/entrance immersion effects
- `premium.js` — magnetic buttons, tilt, cursor polish
- `og.png` — social share card (1200×630)

## What's included
- Hero with interactive 3D crystal + floating glass HUD chips
- Animated engineering background (data mesh, code tokens, perspective grid, parallax)
- Sections: Stats, About (live build terminal), Process, Services, Work (concept examples), Pricing, **Price calculator**, Testimonials/How-I-work, **FAQ**, Contact, Footer
- **Kai** AI assistant (bottom-right) — answers pricing/timeline/scope in € and nudges to start a project
- Working contact modal (mailto fallback; drop in a Formspree/webhook URL to go live)
- SEO + Open Graph share card

## To make the contact form send for real
In `sections2.jsx`, find `const ENDPOINT = "";` in `HireModal` and paste a
Formspree / Web3Forms / Discord-webhook URL. Without it, the form falls back to
opening the visitor's email client pre-filled (nothing is lost).

## Assistant in production
The chat uses the preview's `window.claude` here. For your live VPS, point it at
your own Claude/OpenAI endpoint (a tiny serverless function) — ask and I'll wire it.

## Deploy
Upload all files to your web root (keep them together). Done — it's static.
