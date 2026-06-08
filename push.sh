#!/bin/sh
# push.sh — Commit + push pe GitHub → deploy automat pe VPS via GitHub Actions
# Utilizare: sh push.sh "mesajul tău de commit"

MSG="${1:-update}"

git add .
git commit -m "$MSG" || echo "Nimic nou de commit nou — verific dacă există commit-uri nepusate..."
git push origin main

echo ""
echo "✓ Cod trimis pe GitHub."
echo "→ GitHub Actions deployează automat pe kodeflow.dev în ~2-3 minute."
echo "→ Urmărește progresul: https://github.com/valentincojocaru/kodeflow/actions"
