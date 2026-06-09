import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import nodemailer from "nodemailer";

const { Pool } = pg;

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "pykode_jwt_secret_2024_ultra_secure";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "pykode_admin_2024";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// ─── Mailer ────────────────────────────────────────────────────────────────

function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // dev fallback — log to console, no real email
  return null;
}

async function sendResetEmail(to: string, code: string) {
  const transporter = createTransport();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;border:1px solid #222;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#ea580c,#f97316);padding:32px 36px;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">pyKode</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Client Portal</p>
      </div>
      <div style="padding:36px;">
        <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 8px;">Reset parola ta</h2>
        <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;margin:0 0 28px;">
          Ai solicitat resetarea parolei. Folosește codul de mai jos — expiră în <strong style="color:#f97316;">15 minute</strong>.
        </p>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
          <span style="font-family:monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#f97316;">${code}</span>
        </div>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">
          Dacă nu ai solicitat acest cod, ignoră acest email. Contul tău este în siguranță.
        </p>
      </div>
    </div>
  `;
  if (!transporter) {
    console.log(`\n🔑 RESET CODE pentru ${to}: ${code}\n`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"pyKode" <noreply@kodeflow.dev>`,
    to,
    subject: "Resetare parolă — pyKode",
    html,
  });
}

// ─── DB init ───────────────────────────────────────────────────────────────

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
ensureTables().catch(console.error);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Middleware ────────────────────────────────────────────────────────────

function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function adminMiddleware(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

// ─── Auth Routes ───────────────────────────────────────────────────────────

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, company, phone, adminSecret } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Email already registered" });

    const role = adminSecret && adminSecret === ADMIN_SECRET ? "admin" : "client";
    const colors = ["#b855ff", "#f050c8", "#9333ea", "#d946ef", "#a21caf", "#7c3aed"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];
    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, company, phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role, company, phone, created_at",
      [name, email.toLowerCase(), hash, role, company || null, phone || null]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _pw, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Me
app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, company, phone, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ─── Client Routes ─────────────────────────────────────────────────────────

// Get own projects
app.get("/api/projects", authMiddleware, async (req: any, res) => {
  try {
    const clientId = req.user.role === "admin" ? null : req.user.id;
    const query = clientId
      ? `SELECT p.*, u.name as client_name, u.email as client_email
         FROM projects p JOIN users u ON p.client_id = u.id
         WHERE p.client_id = $1 ORDER BY p.updated_at DESC`
      : `SELECT p.*, u.name as client_name, u.email as client_email
         FROM projects p JOIN users u ON p.client_id = u.id
         ORDER BY p.updated_at DESC`;
    const params = clientId ? [clientId] : [];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get single project
app.get("/api/projects/:id", authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, u.name as client_name, u.email as client_email, u.company as client_company
       FROM projects p JOIN users u ON p.client_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
    const project = result.rows[0];
    if (req.user.role !== "admin" && project.client_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    const updates = await pool.query(
      `SELECT pu.*, u.name as author_name, u.role as author_role
       FROM project_updates pu JOIN users u ON pu.author_id = u.id
       WHERE pu.project_id = $1 ORDER BY pu.created_at DESC`,
      [id]
    );
    const invoices = await pool.query(
      "SELECT * FROM invoices WHERE project_id = $1 ORDER BY created_at DESC",
      [id]
    );
    res.json({ ...project, updates: updates.rows, invoices: invoices.rows });
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Get all invoices for the logged-in client
app.get("/api/invoices", authMiddleware, async (req: any, res) => {
  try {
    const query = req.user.role === "admin"
      ? `SELECT i.*, p.title as project_title, u.name as client_name FROM invoices i JOIN projects p ON i.project_id = p.id JOIN users u ON p.client_id = u.id ORDER BY i.created_at DESC`
      : `SELECT i.*, p.title as project_title FROM invoices i JOIN projects p ON i.project_id = p.id WHERE p.client_id = $1 ORDER BY i.created_at DESC`;
    const params = req.user.role === "admin" ? [] : [req.user.id];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Get all updates for the logged-in client (across all their projects)
app.get("/api/updates", authMiddleware, async (req: any, res) => {
  try {
    const query = req.user.role === "admin"
      ? `SELECT pu.*, p.title as project_title, u.name as author_name, u.role as author_role FROM project_updates pu JOIN projects p ON pu.project_id = p.id JOIN users u ON pu.author_id = u.id ORDER BY pu.created_at DESC`
      : `SELECT pu.*, p.title as project_title, u.name as author_name, u.role as author_role FROM project_updates pu JOIN projects p ON pu.project_id = p.id JOIN users u ON pu.author_id = u.id WHERE p.client_id = $1 ORDER BY pu.created_at DESC`;
    const params = req.user.role === "admin" ? [] : [req.user.id];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

// Add update to own project (clients can also comment)
app.post("/api/projects/:id/updates", authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { message, type } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const project = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (project.rows.length === 0) return res.status(404).json({ error: "Project not found" });
    if (req.user.role !== "admin" && project.rows[0].client_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    const result = await pool.query(
      "INSERT INTO project_updates (project_id, author_id, message, type) VALUES ($1,$2,$3,$4) RETURNING *",
      [id, req.user.id, message, type || "update"]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to add update" });
  }
});

// ─── Admin Routes ──────────────────────────────────────────────────────────

// Stats
app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const [users, projects, activeP, pending, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'client'"),
      pool.query("SELECT COUNT(*) FROM projects"),
      pool.query("SELECT COUNT(*) FROM projects WHERE status = 'in_progress'"),
      pool.query("SELECT COUNT(*) FROM projects WHERE status = 'pending'"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total, COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) as paid, COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) as pending FROM invoices"),
    ]);
    res.json({
      totalClients: parseInt(users.rows[0].count),
      totalProjects: parseInt(projects.rows[0].count),
      activeProjects: parseInt(activeP.rows[0].count),
      pendingRequests: parseInt(pending.rows[0].count),
      totalInvoiced: parseFloat(revenue.rows[0].total),
      totalPaid: parseFloat(revenue.rows[0].paid),
      totalPending: parseFloat(revenue.rows[0].pending),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// All invoices (admin)
app.get("/api/admin/invoices", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.title as project_title, u.name as client_name, u.email as client_email
       FROM invoices i
       JOIN projects p ON i.project_id = p.id
       JOIN users u ON p.client_id = u.id
       ORDER BY i.created_at DESC`
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Update invoice status (admin)
app.put("/api/admin/invoices/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, amount, dueDate } = req.body;
    const result = await pool.query(
      "UPDATE invoices SET status=$1, amount=$2, due_date=$3 WHERE id=$4 RETURNING *",
      [status, amount, dueDate || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

// Delete invoice (admin)
app.delete("/api/admin/invoices/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM invoices WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

// Recent activity (admin) - last 10 updates across all projects
app.get("/api/admin/activity", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT pu.*, p.title as project_title, u.name as author_name
       FROM project_updates pu
       JOIN projects p ON pu.project_id = p.id
       JOIN users u ON pu.author_id = u.id
       ORDER BY pu.created_at DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

// All users
app.get("/api/admin/users", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, COUNT(p.id) as project_count
       FROM users u LEFT JOIN projects p ON p.client_id = u.id
       WHERE u.role = 'client'
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create project (admin)
app.post("/api/admin/projects", authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    const { clientId, title, type, status, description, techStack, budget, deadline, priority, progress, notes, liveUrl, repoUrl } = req.body;
    if (!clientId || !title) return res.status(400).json({ error: "Client and title required" });

    const result = await pool.query(
      `INSERT INTO projects (client_id, title, type, status, description, tech_stack, budget, deadline, priority, progress, notes, live_url, repo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [clientId, title, type || "Web App", status || "pending", description, techStack || [], budget, deadline || null, priority || "normal", progress || 0, notes, liveUrl, repoUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project (admin)
app.put("/api/admin/projects/:id", authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, type, status, description, techStack, budget, deadline, priority, progress, notes, liveUrl, repoUrl } = req.body;
    const result = await pool.query(
      `UPDATE projects SET title=$1, type=$2, status=$3, description=$4, tech_stack=$5,
       budget=$6, deadline=$7, priority=$8, progress=$9, notes=$10, live_url=$11, repo_url=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [title, type, status, description, techStack || [], budget, deadline || null, priority, progress, notes, liveUrl, repoUrl, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project (admin)
app.delete("/api/admin/projects/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM projects WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Update user (admin)
app.put("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, company, phone } = req.body;
    const result = await pool.query(
      "UPDATE users SET name=$1, company=$2, phone=$3 WHERE id=$4 AND role='client' RETURNING id, name, email, company, phone, role, created_at",
      [name, company, phone, req.params.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Add invoice (admin)
app.post("/api/admin/projects/:id/invoices", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { amount, status, dueDate } = req.body;
    const result = await pool.query(
      "INSERT INTO invoices (project_id, amount, status, due_date) VALUES ($1,$2,$3,$4) RETURNING *",
      [req.params.id, amount, status || "pending", dueDate || null]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// ─── Password Reset Routes ─────────────────────────────────────────────────

// Forgot password — sends 6-digit code
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email obligatoriu" });

    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    // Always respond OK to not leak whether email exists
    if (userRes.rows.length === 0) {
      return res.json({ ok: true });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Invalidate old codes for this email
    await pool.query("UPDATE password_resets SET used = true WHERE email = $1 AND used = false", [email.toLowerCase()]);
    await pool.query(
      "INSERT INTO password_resets (email, code, expires_at) VALUES ($1, $2, $3)",
      [email.toLowerCase(), code, expires]
    );

    await sendResetEmail(email.toLowerCase(), code);
    res.json({ ok: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Eroare la trimiterea emailului" });
  }
});

// Reset password — validates code + sets new password
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: "Date incomplete" });
    if (newPassword.length < 8) return res.status(400).json({ error: "Parola trebuie să aibă minim 8 caractere" });

    const resetRes = await pool.query(
      "SELECT * FROM password_resets WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email.toLowerCase(), code]
    );

    if (resetRes.rows.length === 0) return res.status(400).json({ error: "Codul este invalid sau a expirat" });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hash, email.toLowerCase()]);
    await pool.query("UPDATE password_resets SET used = true WHERE id = $1", [resetRes.rows[0].id]);

    res.json({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Eroare la resetarea parolei" });
  }
});

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => console.log(`🚀 API server running on port ${PORT}`));
