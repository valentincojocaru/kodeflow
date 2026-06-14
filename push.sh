#!/bin/sh
set -e

MSG="${1:-update}"

git add .
git commit -m "$MSG"
git push https://valentincojocaru:${GITHUB_TOKEN}@github.com/valentincojocaru/kodeflow.git main

echo ""
echo "✓ Push realizat cu mesajul: $MSG"
