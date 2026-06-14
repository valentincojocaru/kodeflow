# Kodeflow — Premium redesign handoff

Drop-in React + TypeScript port of the glassmorphism homepage with the original
WebGL "AI agent" hero. Everything is scoped under `.kf-root`, so it won't touch
the rest of your app (admin, dashboard, shadcn components stay untouched).

## Files

```
src/components/AICore.tsx        ← WebGL hero object (three.js)
src/pages/home.tsx               ← the full marketing page (replaces your current home)
src/styles/kodeflow-theme.css    ← scoped theme (glass, fonts, palette, animations)
```

## 1. Install the one new dependency

The hero uses three.js (you didn't have it installed):

```bash
pnpm add three
pnpm add -D @types/three
```

> Don't want the extra dependency? Delete the `<AICore />` line in `home.tsx`
> and the import at the top — the hero still looks great with just the glass
> chips and the orange glow behind it.

## 2. Add the fonts

Add this to `index.html` `<head>` (replaces the old Inter link):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## 3. Import the theme once

In `src/main.tsx` (or the top of `src/index.css`):

```ts
import "@/styles/kodeflow-theme.css";
```

## 4. Use the page

`home.tsx` default-exports `Home`. Wire it into your existing wouter route in
`src/App.tsx`, e.g.:

```tsx
import Home from "@/pages/home";
// <Route path="/" component={Home} />
```

The page renders the fixed background atmosphere itself, so you don't need the
old `CodeBackground` on this route. Keep `bg-background` on `<body>` as a
fallback — the `.kf-root` paints its own dark base on top.

## Notes & TODO

- **Work images** reuse your existing `src/assets/work/*.png` (dashboard,
  ecommerce, restaurant). Adjust the import paths if your `@/` alias differs.
- **Hire modal** is wired with a fake 1.6s "sent" state. Plug in your existing
  `@emailjs/browser` call inside `submit()` (marked with a `// TODO`).
- **Client Portal** link points to `/login` like before.
- **Numbers & testimonials** are placeholders — swap in real figures/quotes
  before going live.
- All motion respects `prefers-reduced-motion`.
- Path alias `@/` assumes your existing `vite.config.ts` / `tsconfig` setup
  (you already use `@/components`, `@/assets`, etc.).

## What changed vs. the old home

- New palette: warm charcoal + the orange brand, with a subtle cool counter-glow
  for depth. Editorial serif display (Instrument Serif) over Space Grotesk.
- Real frosted-glass layer system, atmospheric orbs + grid + grain.
- Original WebGL AI-agent core in the hero (crystal + neural net, mouse-reactive).
- Sections, copy and pricing rewritten in English, premium tone.
```
```
