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

# 5. Restart backend cu PM2
log "Restart backend (PM2)..."
if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart "$APP_NAME" || { log "EROARE: PM2 restart a eșuat!"; exit 1; }
    log "✓ Backend restartat"
else
    log "PM2: Pornesc aplicația pentru prima dată..."
    pm2 start "$APP_DIR/start.sh" --name "$APP_NAME" || { log "EROARE: PM2 start a eșuat!"; exit 1; }
    pm2 save
    log "✓ Backend pornit"
fi

# 6. Reload Nginx (fără downtime)
log "Reload Nginx..."
service nginx reload || { log "AVERTISMENT: Nginx reload a eșuat, încerc restart..."; service nginx restart; }
log "✓ Nginx reloaded"

log "====== DEPLOY FINALIZAT CU SUCCES ======"
log "Site live la: https://kodeflow.dev"
