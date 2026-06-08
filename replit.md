# KodeFlow

Website + API pentru kodeflow.dev — aplicație web cu frontend React/Vite și backend Node.js/Express, deployată pe un VPS propriu via GitHub Actions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — rulează API server-ul (port 5000)
- `sh push.sh "mesaj commit"` — commit + push pe GitHub → deploy automat pe VPS (rulează DIN SHELL, nu din agent)
- `pnpm run typecheck` — typecheck complet
- `pnpm run build` — typecheck + build toate pachetele

## Deploy Flow (IMPORTANT)

```
sh push.sh "mesaj" → GitHub (main branch) → GitHub Actions → SSH VPS → deploy.sh → site live
```

- **push.sh** — face `git add . && commit && git push origin main --force`
- **deploy.sh** — rulează PE VPS: `git pull`, `npm install`, `npm run build`, `pm2 restart kodeflow`, `nginx reload`
- **GitHub Actions** (`.github/workflows/deploy.yml`) — se conectează SSH pe VPS și rulează `deploy.sh`

## Infrastructură

- **GitHub repo**: `valentincojocaru/kodeflow` (public)
- **VPS**: `root@62.171.167.115`
- **App path pe VPS**: `/var/www/kodeflow`
- **Process manager**: PM2, app name: `kodeflow`
- **Web server**: Nginx
- **Site live**: https://kodeflow.dev

## Secrets necesare

- `GITHUB_TOKEN` — GitHub Personal Access Token (ghp_...) pentru git push din Replit ✓ (setat)
- `VPS_SSH_KEY` — cheia SSH privată (pentru GitHub Actions să se conecteze pe VPS)

## GitHub Actions Secrets (setate pe GitHub, nu în Replit)

Mergi pe github.com/valentincojocaru/kodeflow → Settings → Secrets → Actions:
- `VPS_HOST` = `62.171.167.115`
- `VPS_USER` = `root`
- `VPS_SSH_KEY` = cheia SSH privată

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS (`src/`)
- **Backend/API**: Express 5, Node.js 24, TypeScript (`artifacts/api-server/`)
- **DB**: PostgreSQL + Drizzle ORM
- **Monorepo**: pnpm workspaces

## Where things live

- `artifacts/api-server/` — codul API server Express
- `src/` — frontend React
- `src/components/CodeBackground.tsx` — fundalul animat (typing effect)
- `src/pages/home.tsx` — pagina principală
- `src/pages/admin.tsx` — admin panel
- `src/pages/dashboard.tsx` — client portal
- `push.sh` — scriptul de deploy (rulează din Shell)
- `deploy.sh` — scriptul care rulează pe VPS
- `.github/workflows/deploy.yml` — GitHub Actions workflow

## Gotchas

- Repo-ul Replit are istoric git SEPARAT față de GitHub repo. `push.sh` folosește `--force` intenționat.
- `GITHUB_TOKEN` în Replit Secrets trebuie să fie DOAR valoarea `ghp_...` fără prefix `sha256:` sau spații.
- **Agentul NU poate rula `sh push.sh`** — git push este blocat pentru agent. Userul trebuie să îl ruleze DIN SHELL.
- `git remote set-url` și `git remote add` nu sunt permise agentului — push.sh le face în Shell.

## Starea curentă a site-ului (ce s-a modificat)

### Fundal animat — `src/components/CodeBackground.tsx`
- Canvas transparent, `position: fixed`, `z-index: 1`, `pointer-events: none`
- Efect de **typing** (cod scris caracter cu caracter), NU Matrix scrolling
- Sesiunile sunt poziționate strict pe un grid de celule — **nu se suprapun**
- 2 sesiuni pe mobile, 3 pe tablet, 5 pe desktop
- Fiecare sesiune tastează linii de cod una câte una, cu cursor clipitor `|` la capăt + glow violet
- Sintaxă colorată în timp real pe măsură ce se tastează
- Opacitate per sesiune: 0.38–0.52 (vizibil, nu transparent)
- `maxWidth` per sesiune = lățimea celulei minus margini — liniile nu depășesc zona lor
- Folosit și în `admin.tsx` (Admin Panel) și `dashboard.tsx` (Client Portal)
- Body-ul păstrează `bg-background` (hsl 258 35% 11%) ca fundal solid

### Hero — `src/pages/home.tsx`
- **HeroDevStation eliminat** complet (fereastra IDE flotantă cu tabs/terminal)
- **IntroScreen eliminat** (splash screen de la început)
- Hero are acum layout full-width centrat: `max-w-3xl mx-auto text-center sm:text-left`
- Grila `lg:grid-cols-2` → `flex items-center` (un singur bloc de conținut)

### Mobile responsiveness — `src/pages/home.tsx`
- Toate secțiunile au padding responsive: `py-20 sm:py-32 lg:py-40`
- Container padding: `px-4 sm:px-6` pe tot site-ul
- Font titlu hero: `clamp(2.2rem, 7vw, 4.8rem)`
- Butoane hero adaptate: `h-11 sm:h-12`, `px-6 sm:px-8`

### index.css
- Body păstrează `bg-background` (NU face transparent — canvas-ul depinde de el)

## User preferences

- Limbă: română în conversații
- Deploy: `sh push.sh "mesaj"` din Shell (nu din agent)
- Background site: violet închis (nu negru complet) — `--background: 258 35% 11%`
