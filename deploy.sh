#!/bin/sh
# ============================================================
#  deploy.sh — Script de deploy pentru kodeflow.dev (FreeBSD)
#  Utilizare: sh /var/www/kodeflow/deploy.sh
# ============================================================

set -e

APP_DIR="/var/www/kodeflow"
APP_NAME="kodeflow"
LOG_FILE="/var/log/kodeflow-deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "====== START DEPLOY $APP_NAME ======"

# 1. Mergi în directorul aplicației
cd "$APP_DIR" || { log "EROARE: Directorul $APP_DIR nu există!"; exit 1; }

# 2. Pull ultimele modificări din GitHub
log "Descarcă ultimele modificări din GitHub..."
git fetch origin main || { log "EROARE: git fetch a eșuat!"; exit 1; }
git reset --hard origin/main || { log "EROARE: git reset a eșuat!"; exit 1; }
log "✓ Cod actualizat"

# 3. Instalează dependențele noi (dacă există)
log "Instalează dependențele npm..."
npm install --no-fund --no-audit --legacy-peer-deps || { log "EROARE: npm install a eșuat!"; exit 1; }
log "✓ Dependențe instalate"

# 4. Build frontend (React → dist/public)
log "Build frontend..."
npm run build || { log "EROARE: Build a eșuat!"; exit 1; }
log "✓ Frontend construit în dist/public/"

# 5. (Re)pornește backend cu PM2 dintr-o config explicită (slate curat)
#    pm2 restart refoloseste definiția veche a procesului — dacă aceasta e
#    stricată, procesul rămâne în crash-loop. De aceea ștergem și pornim din nou
#    din ecosystem.config.cjs, ca să aplicăm mereu config-ul corect.
log "(Re)pornire backend (PM2) din ecosystem.config.cjs..."
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.cjs --update-env || { log "EROARE: PM2 start a eșuat!"; exit 1; }
pm2 save || true
log "✓ Backend pornit"

# 5b. Diagnostic: verifică dacă backend-ul a rămas pornit (nu în crash-loop)
sleep 6
log "Status backend (PM2):"
pm2 list || true
# Health-check direct pe backend — distinge "backend picat" de "mismatch de port Nginx"
if curl -fsS http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
    log "✓ Backend răspunde pe 127.0.0.1:3001/api/health"
else
    log "✗ Backend NU răspunde pe 127.0.0.1:3001 — vezi logul de erori de mai jos"
fi
log "Ultimele linii din log-ul de erori backend:"
pm2 logs "$APP_NAME" --err --lines 25 --nostream 2>&1 || true

# 6. Reload Nginx (fără downtime)
log "Reload Nginx..."
service nginx reload || { log "AVERTISMENT: Nginx reload a eșuat, încerc restart..."; service nginx restart; }
log "✓ Nginx reloaded"

log "====== DEPLOY FINALIZAT CU SUCCES ======"
log "Site live la: https://kodeflow.dev"
