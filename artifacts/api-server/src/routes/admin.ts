import { Router } from "express";
import { pool } from "../lib/db";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

const router = Router();

const auth = [authMiddleware, adminMiddleware];

router.get("/admin/stats", ...auth, async (_req, res) => {
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

router.get("/admin/invoices", ...auth, async (_req, res) => {
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

router.put("/admin/invoices/:id", ...auth, async (req, res) => {
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

router.delete("/admin/invoices/:id", ...auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM invoices WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

router.get("/admin/activity", ...auth, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT pu.*, p.title as project_title, u.name as author_name
       FROM project_updates pu
       JOIN projects p ON pu.project_id = p.id
       JOIN users u ON pu.author_id = u.id
       ORDER BY pu.created_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

router.get("/admin/users", ...auth, async (_req, res) => {
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

router.post("/admin/projects", ...auth, async (req: any, res) => {
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

router.put("/admin/projects/:id", ...auth, async (req: any, res) => {
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

router.delete("/admin/projects/:id", ...auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM projects WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

router.put("/admin/users/:id", ...auth, async (req, res) => {
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

router.post("/admin/projects/:id/invoices", ...auth, async (req, res) => {
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

export default router;
