#!/bin/sh
# push.sh — Commit + push pe GitHub → deploy automat pe VPS via GitHub Actions
# Utilizare: sh push.sh "mesajul tău de commit"

MSG="${1:-update}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "EROARE: GITHUB_TOKEN nu e setat. Adaugă-l în Replit Secrets."
  exit 1
fi

# Extrage doar token-ul ghp_... sau github_pat_... indiferent de ce alt text e în jur
CLEAN_TOKEN=$(echo "$GITHUB_TOKEN" | grep -o 'gh[ps]_[A-Za-z0-9_]*\|github_pat_[A-Za-z0-9_]*' | head -1)

if [ -z "$CLEAN_TOKEN" ]; then
  echo "EROARE: Token-ul GitHub nu are formatul corect (ghp_... sau github_pat_...)."
  echo "Valoare curentă: $GITHUB_TOKEN"
  exit 1
fi

REMOTE_URL="https://valentincojocaru:${CLEAN_TOKEN}@github.com/valentincojocaru/kodeflow.git"

if git remote get-url origin > /dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

git add .
git commit -m "$MSG" || echo "Nimic nou de commit — verific dacă există commit-uri nepusate..."
git push origin main --force

echo ""
echo "✓ Cod trimis pe GitHub."
echo "→ GitHub Actions deployează automat pe kodeflow.dev în ~2-3 minute."
echo "→ Urmărește progresul: https://github.com/valentincojocaru/kodeflow/actions"
