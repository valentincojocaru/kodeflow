---
name: KodeFlow production 502 on /api
description: Why kodeflow.dev /api returns 502 and how the VPS backend must be started via PM2
---

# 502 pe /api la kodeflow.dev = backend Express picat pe VPS

`kodeflow.dev/` întoarce 200 (frontend static servit de Nginx) dar `kodeflow.dev/api/*`
întoarce 502 când procesul Node/Express (PM2 `kodeflow`) e picat. 502 de la Nginx pe `/api`
înseamnă întotdeauna upstream-ul (backend-ul) nu răspunde — NU e o problemă de cod de rute.

**Regula:** `pm2 restart kodeflow` refoloseste definiția veche (cache-uită) a procesului.
Dacă acea definiție e stricată, procesul rămâne în crash-loop (am văzut ↺ 218 → status `stopped`),
iar restart-urile nu repară nimic. Fix-ul corect este `pm2 delete kodeflow` + `pm2 start ecosystem.config.cjs`
ca să se aplice de fiecare dată config-ul curent/corect.

**Why:** backend-ul `server/index.ts` NU folosește `dotenv`. Variabilele (`DATABASE_URL`, `JWT_SECRET`,
`SMTP_*`) trebuie încărcate explicit la pornire. Pe VPS există `/var/www/kodeflow/.env` (Vite a dat warning
`NODE_ENV=production is not supported in the .env file`, ceea ce dovedește prezența .env). Comanda corectă:
`node --import tsx --env-file-if-exists=.env server/index.ts` (Node >= 22.9 pe VPS; merge și pe Node 20.20 local).

**How to apply:** diagnostic fără SSH — logurile job-ului GitHub Actions ("Deploy to kodeflow.dev")
conțin output-ul `deploy.sh` rulat pe VPS, inclusiv tabelul `pm2 list` (vezi coloana ↺ restarts + status).
Se obțin prin GitHub API cu `GITHUB_TOKEN`: `/repos/valentincojocaru/kodeflow/actions/runs` → run id →
`/actions/jobs/{job_id}/logs` (text simplu; endpoint-ul `/runs/{id}/logs` dă un zip, iar `unzip`/`python3`
lipsesc în Replit — folosește Node). `deploy.sh` rulează acum și `pm2 logs --err` ca să apară eroarea de crash.
