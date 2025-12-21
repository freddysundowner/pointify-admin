import { Router, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

const router = Router();

// Get all email templates
router.get("/", async (req: Request, res: Response) => {
  try {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const templates = await apiRequest<any>("/templates", { token: session.token });
    res.json(templates);
  } catch (error: any) {
    console.error("[Templates] Error fetching templates:", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get single template by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const template = await apiRequest<any>(`/templates/${req.params.id}`, { token: session.token });
    res.json(template);
  } catch (error: any) {
    console.error("[Templates] Error fetching template:", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Create new template
router.post("/", async (req: Request, res: Response) => {
  try {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const template = await apiRequest<any>("/templates", {
      token: session.token,
      method: "POST",
      body: req.body,
    });
    res.json(template);
  } catch (error: any) {
    console.error("[Templates] Error creating template:", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Update template
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const template = await apiRequest<any>(`/templates/${req.params.id}`, {
      token: session.token,
      method: "PUT",
      body: req.body,
    });
    res.json(template);
  } catch (error: any) {
    console.error("[Templates] Error updating template:", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Delete template
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await apiRequest<any>(`/templates/${req.params.id}`, {
      token: session.token,
      method: "DELETE",
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Templates] Error deleting template:", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

export function registerTemplateRoutes(app: any) {
  app.use("/api/templates", router);
}
