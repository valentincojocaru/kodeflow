---
name: KodeFlow deploy setup
description: Complete deploy flow for kodeflow.dev — GitHub Actions + VPS + push.sh
---

# KodeFlow Deploy Setup

**Why:** Entire infrastructure is set up outside Replit. Replit is just the code editor.

## Deploy Flow
```
sh push.sh "mesaj" → GitHub main → GitHub Actions → SSH VPS → /var/www/kodeflow/deploy.sh → site live
```

## Key Files
- `push.sh` — commit + push (uses GITHUB_TOKEN env var, does --force push)
- `deploy.sh` — runs ON VPS: git pull + npm install + npm run build + pm2 restart + nginx reload
- `.github/workflows/deploy.yml` — triggers on push to main, SSHs into VPS

## VPS Details
- IP: 62.171.167.115
- User: root
- App path: /var/www/kodeflow
- PM2 app name: kodeflow
- Site: https://kodeflow.dev

## Required Secrets
- Replit: `GITHUB_TOKEN` = ghp_... (classic PAT with repo scope)
- GitHub Actions secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

## Common Issues
- GITHUB_TOKEN stored with "sha256: " prefix or spaces = 401 error. Must be ONLY ghp_... value.
- Git remote "origin" may not exist in Replit — push.sh handles this with get-url check.
- Replit git history is separate from GitHub repo — push uses --force intentionally.
- Agent cannot run git remote add/set-url/reset — these must be run by user in Shell.
