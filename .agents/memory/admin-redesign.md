---
name: Admin premium redesign decisions
description: Decizii de design pentru admin panel ultra premium - culori, componente, structură
---

## Schimbări cheie
- Background: `#07070e` (mai profund decât `#141414`)
- `CodeBackground` → `ThreeBackground` în admin.tsx, dashboard.tsx
- Gradienți portocalii → violet/purple (`rgba(147,51,234,...)`)
- Sidebar: `bg-[#090910]/96 backdrop-blur-3xl border-white/[0.07]`
- Header: `bg-[#07070e]/92 backdrop-blur-2xl`
- GlassCard: `border-white/[0.07] bg-white/[0.02]`, header gradient `from-white/[0.018]`

## RingProgress component
Definit ca function declaration la linia ~670 în admin.tsx, DUPĂ Admin component.
Funcționează datorită JS hoisting. Folosit în stat cards pentru circular progress SVG.

**Why:** Function declarations sunt hoisted în JS/TS la nivel de modul.

## Stat cards upgrades
- Gradient background: `from-white/[0.028] to-white/[0.006]`
- Glow offset: `-top-6 -right-6 w-24 h-24 blur-3xl`
- RingProgress pe dreapta icon-ului
- Typography: `text-[34px] font-black leading-none`
