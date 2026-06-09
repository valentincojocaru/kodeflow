// ============================================================
//  ecosystem.config.cjs — config PM2 pentru backend-ul kodeflow
//  Rulează DOAR pe VPS (folosit de deploy.sh).
//  Pornește: node --import tsx --env-file-if-exists=.env server/index.ts
// ============================================================
module.exports = {
  apps: [
    {
      name: "kodeflow",
      cwd: "/var/www/kodeflow",
      script: "server/index.ts",
      interpreter: "node",
      // --import tsx  → rulează TypeScript direct (tsx e în dependencies)
      // --env-file-if-exists=.env → încarcă variabilele din .env (DATABASE_URL, JWT_SECRET, SMTP_*)
      //   fără să crape dacă .env lipsește (Node >= 22.9)
      interpreter_args: "--import tsx --env-file-if-exists=.env",
      env: {
        NODE_ENV: "production",
        SERVER_PORT: "3001",
      },
      autorestart: true,
      max_restarts: 15,
      restart_delay: 2000,
      // oprește bucla infinită de restart dacă procesul crapă în < 5s
      min_uptime: "5s",
    },
  ],
};
