# Kodeflow Admin — premium redesign handoff

A premium glassmorphism reskin of your admin panel, matching the new site:
warm charcoal + orange, editorial serif headings, frosted-glass panels — plus
new premium features (revenue analytics chart, collection-rate donut, KPI
sparklines, a ⌘K command palette, toasts, CSV export).

## What's in here

```
admin-prototype/                  ← RUNNABLE standalone demo (open admin.html)
  admin.html, admin-data.jsx,
  admin-app.jsx, admin-views.jsx
src/components/admin/AdminPrimitives.tsx   ← reusable TSX components
src/styles/kodeflow-admin-theme.css        ← scoped premium theme (.kfa-root)
```

## See it first

Open `admin-prototype/admin.html` in any browser (or on Replit) — it's a fully
working demo with mock data: Overview, Projects, Project detail, Invoices,
Clients, Messages, and the ⌘K palette. This is the visual target.

## Two ways to ship it

### Option A — Reskin your existing admin.tsx (recommended, keeps your backend)
Your current `src/pages/admin.tsx` is already wired to `/api/admin/*` via
`authFetch`. Keep ALL of that. Just restyle:

1. **Add fonts** to `index.html <head>` (same as the site):
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```
2. **Import the theme** once (e.g. in `main.tsx`):
   ```ts
   import "@/styles/kodeflow-admin-theme.css";
   ```
3. **Wrap** the admin return in `<div className="kfa-root">…</div>` and add the
   atmosphere as its first child:
   ```tsx
   <div className="kfa-root">
     <div className="kfa-atmos"><div className="base"/><div className="orb a"/><div className="orb b"/><div className="grid"/></div>
     {/* your sidebar + main, now using .kfa-glass / .kfa-btn / .kfa-serif … */}
   </div>
   ```
4. **Swap classes**: replace your ad-hoc panel styles with `.kfa-glass` /
   `.kfa-glass-2`, headings with `.kfa-serif`, buttons with `.kfa-btn` /
   `.kfa-btn-ghost`, inputs with `.kfa-input`.
5. **Drop in the premium components** from `AdminPrimitives.tsx`:
   ```tsx
   import { Ring, Donut, AreaChart, Sparkline, StatusBadge, CommandPalette, GlassCard, exportCSV } from "@/components/admin/AdminPrimitives";
   ```
   - KPI cards → add `<Ring value={stats.activeProjects} max={stats.totalProjects} color="#3ad17a" />`
   - Overview → `<AreaChart data={monthlyRevenue} labels={months} />` and
     `<Donut pct={collectionRate} color="#3ad17a" label="collected" />`
   - Status pills → `<StatusBadge status={p.status} />`
   - Your existing "Export CSV" → `exportCSV(...)` (already matches your signature)

### Option B — Use the prototype views as a starting point
The prototype's `admin-views.jsx` mirrors your structure (Overview, Projects,
Project detail, Invoices, Clients). You can port a view at a time to TSX and
replace the mock arrays (`MOCK_PROJECTS`, `MOCK_STATS`, …) with your `authFetch`
calls. Field names already match yours (`status`, `progress`, `client_name`,
`invoices[].amount/status/due_date`, `updates[].type/message/author_name/created_at`).

## Premium features added

| Feature | Where | Notes |
|---|---|---|
| Revenue area chart | Overview | feed it your monthly totals |
| Collection-rate donut | Overview | `paid / invoiced × 100` |
| KPI sparklines + ring gauges | Overview | tiny trend per stat |
| ⌘K command palette | global | wire `commands` to your nav + projects |
| Toasts | global | confirm send/delete/export |
| Messages inbox | new view | UI only — wire to your messaging if/when you add it |

## Wiring the ⌘K palette
```tsx
const [cmd, setCmd] = useState(false);
useEffect(() => {
  const h = (e: KeyboardEvent) => { if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==="k"){ e.preventDefault(); setCmd(o=>!o);} };
  window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
}, []);
// …
<CommandPalette open={cmd} onClose={()=>setCmd(false)} commands={[
  { id:"n1", label:"Go to Projects", kind:"Navigate", run:()=>setView("projects") },
  ...projects.map(p => ({ id:"p"+p.id, label:p.title, kind:"Project", sub:p.client_name, run:()=>loadProject(p.id) })),
]} />
```

## Notes
- All tokens are prefixed `--kfa-*` and everything is scoped under `.kfa-root`,
  so this won't touch the rest of your app or your shadcn components.
- The Messages view is UI-only (no backend yet) — remove it from the sidebar if
  you don't want it, or wire it to a future `/api/messages` endpoint.
- Mock numbers in the prototype are placeholders.
