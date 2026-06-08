# KodeFlow

Website + API pentru kodeflow.dev — aplicație web cu frontend React/Vite și backend Node.js/Express, deployată pe un VPS propriu via GitHub Actions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — rulează API server-ul (port 5000)
- `sh push.sh "mesaj commit"` — commit + push pe GitHub → deploy automat pe VPS
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

- `GITHUB_TOKEN` — GitHub Personal Access Token (ghp_...) pentru git push din Replit
- `VPS_SSH_KEY` — cheia SSH privată (pentru GitHub Actions să se conecteze pe VPS)

## GitHub Actions Secrets (setate pe GitHub, nu în Replit)

Mergi pe github.com/valentincojocaru/kodeflow → Settings → Secrets → Actions:
- `VPS_HOST` = `62.171.167.115`
- `VPS_USER` = `root`
- `VPS_SSH_KEY` = cheia SSH privată

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS (în repo GitHub, nu în Replit workspace)
- **Backend/API**: Express 5, Node.js 24, TypeScript (în `artifacts/api-server/`)
- **DB**: PostgreSQL + Drizzle ORM
- **Monorepo**: pnpm workspaces

## Where things live

- `artifacts/api-server/` — codul API server Express
- `src/` — frontend React (copiat din GitHub la nevoie)
- `push.sh` — scriptul de deploy
- `deploy.sh` — scriptul care rulează pe VPS
- `.github/workflows/deploy.yml` — GitHub Actions workflow

## Gotchas

- Repo-ul Replit are istoric git SEPARAT față de GitHub repo. `push.sh` folosește `--force` intenționat.
- `GITHUB_TOKEN` în Replit Secrets trebuie să fie DOAR valoarea `ghp_...` fără prefix `sha256:` sau spații.
- Frontend-ul (React) e în GitHub repo, nu în Replit workspace. La modificări CSS/frontend, descarcă fișierele din GitHub înainte.
- `git remote set-url` și `git remote add` nu sunt permise agentului — push.sh le face în Shell.

## User preferences

- Limbă: română în conversații
- Deploy: `sh push.sh "mesaj"` din Shell
- Background site: violet închis (nu negru complet) — `--background: 258 35% 11%`
