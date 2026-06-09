import { Router } from "express";
import { pool } from "../lib/db";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/projects", authMiddleware, async (req: any, res) => {
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

router.get("/projects/:id", authMiddleware, async (req: any, res) => {
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

router.get("/invoices", authMiddleware, async (req: any, res) => {
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

router.get("/updates", authMiddleware, async (req: any, res) => {
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

router.post("/projects/:id/updates", authMiddleware, async (req: any, res) => {
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

export default router;
