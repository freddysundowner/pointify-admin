import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerCategoryRoutes(app: Express) {
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { page = "1", limit = "100" } = req.query;
      const result = await apiRequest(`/shop/category?page=${page}&limit=${limit}`, {
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await apiRequest("/shop/category", {
        method: "POST",
        body: req.body,
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.put("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/shop/category/${id}`, {
        method: "PUT",
        body: req.body,
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/shop/category/${id}`, {
        method: "DELETE",
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
