---
name: KodeFlow hero & conversion direction
description: Confirmed design direction for the kodeflow.dev landing hero and what visuals the client rejected
---

# Hero & landing-page direction (confirmed by user)

The hero must make a visitor instantly feel "this is where I hire someone to build my website." Show **proof of work**, not abstract tech art.

**Chosen approach (approved):** hero shows real website mockups inside device frames — a CSS browser window (mac dots + fake url bar) containing a generated desktop site screenshot, plus a floating phone PNG (background removed) — with gentle float animations. Desktop-only big composition + a smaller `lg:hidden` browser mockup for mobile.

**Rejected (do NOT bring back):**
- Procedural/canvas robots (point-cloud `AiRobotScene`) — called "prostie".
- Photoreal android/robot face images — rejected.
- Any abstract AI-robot hero. The user explicitly said a robot doesn't sell the service.

**Why:** clients hiring a web dev want to see the websites you can build, plus trust signals (portfolio with real screenshots, testimonials, clear process, strong CTA). A flashy robot distracts from conversion.

**How to apply:** keep the Work section using real screenshots inside mini browser frames (never "Coming Soon" placeholders), keep Testimonials, and any future hero changes should reinforce real-work proof, not decoration. Mockup screenshots are AI-generated in `src/assets/work/` (gibberish text is expected/acceptable at small scale).
