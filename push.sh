#!/bin/sh
# push.sh — Commit + push pe GitHub → deploy automat pe VPS via GitHub Actions
# Utilizare: sh push.sh "mesajul tău de commit"

MSG="${1:-update}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "EROARE: GITHUB_TOKEN nu e setat. Adaugă-l în Replit Secrets."
  exit 1
fi

CLEAN_TOKEN=$(echo "$GITHUB_TOKEN" | grep -o 'gh[ps]_[A-Za-z0-9_]*\|github_pat_[A-Za-z0-9_]*' | head -1)

if [ -z "$CLEAN_TOKEN" ]; then
  echo "EROARE: Token-ul GitHub nu are formatul corect (ghp_... sau github_pat_...)."
  exit 1
fi

REMOTE_URL="https://valentincojocaru:${CLEAN_TOKEN}@github.com/valentincojocaru/kodeflow.git"

git add .
git commit -m "$MSG" || echo "Nimic nou de commit — verific dacă există commit-uri nepusate..."
git push "$REMOTE_URL" HEAD:main --force

echo ""
echo "✓ Cod trimis pe GitHub."
echo "→ GitHub Actions deployează automat pe kodeflow.dev în ~2-3 minute."
echo "→ Urmărește progresul: https://github.com/valentincojocaru/kodeflow/actions"
