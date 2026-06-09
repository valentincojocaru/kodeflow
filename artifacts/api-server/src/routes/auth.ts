import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../lib/db";
import { sendResetEmail } from "../lib/mailer";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "pykode_jwt_secret_2024_ultra_secure";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "pykode_admin_2024";

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, company, phone, adminSecret } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Email already registered" });

    const role = adminSecret && adminSecret === ADMIN_SECRET ? "admin" : "client";
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

router.post("/auth/login", async (req, res) => {
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

router.get("/auth/me", authMiddleware, async (req: any, res) => {
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

router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email obligatoriu" });

    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (userRes.rows.length === 0) return res.json({ ok: true });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

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

router.post("/auth/reset-password", async (req, res) => {
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

export default router;
