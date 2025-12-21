import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerSubscriptionRoutes(app: Express) {
  app.get("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const shop = req.query.shop || "";
      const search = req.query.search || "";
      const shopname = req.query.shopname || search;
      const invoiceNo = req.query.invoiceNo || search;
      const status = req.query.status || "";
      const type = req.query.type || "";
      const createAt = req.query.createAt || "";
      const expiryperiodFrom = req.query.expiryperiodFrom || "";
      const expiryperiodTo = req.query.expiryperiodTo || "";

      let endpoint = `/subscriptions?page=${page}&limit=${limit}`;
      if (shop) {
        endpoint += `&shop=${encodeURIComponent(shop as string)}`;
      }
      if (shopname) {
        endpoint += `&shopname=${encodeURIComponent(shopname as string)}`;
      }
      if (invoiceNo) {
        endpoint += `&invoiceNo=${encodeURIComponent(invoiceNo as string)}`;
      }
      if (status) {
        endpoint += `&status=${encodeURIComponent(status as string)}`;
      }
      if (type) {
        endpoint += `&type=${encodeURIComponent(type as string)}`;
      }
      if (createAt) {
        endpoint += `&createAt=${encodeURIComponent(createAt as string)}`;
      }
      if (expiryperiodFrom) {
        endpoint += `&expiryperiodFrom=${encodeURIComponent(expiryperiodFrom as string)}`;
      }
      if (expiryperiodTo) {
        endpoint += `&expiryperiodTo=${encodeURIComponent(expiryperiodTo as string)}`;
      }

      const result = await apiRequest(endpoint, { token: session.token });
      
      if (Array.isArray(result)) {
        res.json({ data: result, count: result.length, totalPages: 1, currentPage: 1 });
      } else if (result.data) {
        res.json({
          data: result.data,
          count: result.count || result.total || result.data.length,
          totalPages: result.totalPages || result.pages || Math.ceil((result.count || result.data.length) / 10),
          currentPage: result.currentPage || result.page || Number(page),
        });
      } else {
        res.json({ data: [], count: 0, totalPages: 1, currentPage: 1 });
      }
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/subscriptions/summary/stats", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await apiRequest("/subscriptions/summary/stats", { token: session.token });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/subscriptions/shop/stats", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await apiRequest("/subscriptions/shop/stats", { token: session.token });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  // Extend endpoint must be defined BEFORE the generic :id route
  app.put("/api/subscriptions/verify/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/subscriptions/verify/${id}`, {
        method: "PUT",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.put("/api/subscriptions/extend/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/subscriptions/extend/${id}`, {
        method: "PUT",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/subscriptions/${id}`, { token: session.token });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await apiRequest("/subscriptions", {
        method: "POST",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.put("/api/subscriptions/assign", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await apiRequest("/subscriptions", {
        method: "PUT",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.put("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/subscriptions/${id}`, {
        method: "PUT",
        body: req.body,
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.delete("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/subscriptions/${id}`, {
        method: "DELETE",
        token: session.token,
      });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
