#!/bin/sh
# push.sh — Commit + push pe GitHub → deploy automat pe VPS via GitHub Actions
# Utilizare: sh push.sh "mesajul tău de commit"

MSG="${1:-update}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "EROARE: GITHUB_TOKEN nu e setat. Adaugă-l în Replit Secrets."
  exit 1
fi

git remote set-url origin https://valentincojocaru:${GITHUB_TOKEN}@github.com/valentincojocaru/kodeflow.git

git add .
git commit -m "$MSG" || echo "Nimic nou de commit — verific dacă există commit-uri nepusate..."
git push origin main --force

echo ""
echo "✓ Cod trimis pe GitHub."
echo "→ GitHub Actions deployează automat pe kodeflow.dev în ~2-3 minute."
echo "→ Urmărește progresul: https://github.com/valentincojocaru/kodeflow/actions"
