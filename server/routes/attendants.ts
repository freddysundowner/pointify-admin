import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerAttendantRoutes(app: Express) {
  app.put("/api/attendants/reset/password/sms/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/attendants/reset/password/sms/${id}`, {
        method: "PUT",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.put("/api/attendants/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/attendants/${id}`, {
        method: "PUT",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.delete("/api/attendants/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/attendants/${id}`, {
        method: "DELETE",
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/attendants/shop/filter", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const shopId = req.query.shopId || "";
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      if (!shopId) {
        return res.status(400).json({ error: "shopId is required" });
      }

      const endpoint = `/attendants/shop/filter?shopId=${encodeURIComponent(shopId as string)}&page=${page}&limit=${limit}`;

      const result = await apiRequest(endpoint, { token: session.token });

      if (Array.isArray(result)) {
        res.json({ data: result, count: result.length, totalPages: 1, currentPage: 1 });
      } else if (result.data) {
        res.json({
          data: result.data,
          count: result.count || result.total || result.data.length,
          totalPages: result.totalPages || result.pages || Math.ceil((result.count || result.data.length) / Number(limit)),
          currentPage: result.currentPage || result.page || Number(page),
        });
      } else {
        res.json({ data: [], count: 0, totalPages: 1, currentPage: 1 });
      }
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
