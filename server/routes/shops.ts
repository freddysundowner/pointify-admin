import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerShopRoutes(app: Express) {
  app.get("/api/shops", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const name = req.query.name || "";
      const ownerid = req.query.ownerid || "";
      const affliatename = req.query.affliatename || "";

      let endpoint = `/shop?page=${page}&limit=${limit}`;
      if (name) {
        endpoint += `&name=${encodeURIComponent(name as string)}`;
      }
      if (ownerid) {
        endpoint += `&ownerid=${encodeURIComponent(ownerid as string)}`;
      }
      if (affliatename) {
        endpoint += `&affliatename=${encodeURIComponent(affliatename as string)}`;
      }

      const result = await apiRequest(endpoint, { token: session.token });
      
      if (Array.isArray(result)) {
        res.json({ data: result, count: result.length, totalPages: 1, currentPage: 1 });
      } else if (result.shops) {
        res.json({
          data: result.shops,
          count: result.count || result.total || result.shops.length,
          totalPages: result.totalPages || result.pages || Math.ceil((result.count || result.shops.length) / Number(limit)),
          currentPage: result.currentPage || result.page || Number(page),
        });
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

  app.get("/api/shops/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/shop/${id}`, { token: session.token });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/shops", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await apiRequest("/shop", {
        method: "POST",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.put("/api/shops/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/shop/${id}`, {
        method: "PUT",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.delete("/api/shops/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/shop/${id}`, {
        method: "DELETE",
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
