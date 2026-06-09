---
name: Hero 3D scene approach
description: Three.js blocat de firewall Replit, folosim Canvas 2D cu proiecție perspectivă manuală pentru scena 3D din hero
---

## Decizie
`three` (npm) este blocat de package firewall-ul Replit. Nu se poate instala.

## Soluție
`src/components/HeroScene3D.tsx` — Canvas 2D pur cu proiecție perspectivă manuală (nu WebGL/Three.js).

## Implementare
- Icosahedron cu 12 vertices + 30 edges calculate manual, proiectate în perspectivă
- rotY / rotX / rotZ (funcții top-level) aplicate la fiecare frame
- 3 inele toroidale (makeRing) la unghiuri diferite
- 500 particule sferice
- Mouse parallax (cRY/cRX smooth lerp 4%)
- ResizeObserver + visibilitychange pentru optimizare
- Canvas 2D, `alpha: true`, `dpr` respectat

**Why:** Three.js nu e accesibil, Canvas 2D poate simula 3D credibil la 60fps cu proiecție perspectivă.

**How to apply:** Folosind funcțiile `rotY`, `rotX`, `rotZ`, `proj` definite la modulul top-level. Nu importa `three`.
