import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerInvoiceRoutes(app: Express) {
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const subscription = req.query.subscription || "";
      const shop = req.query.shop || "";

      let endpoint = `/invoices?page=${page}&limit=${limit}`;
      if (subscription) {
        endpoint += `&subscription=${encodeURIComponent(subscription as string)}`;
      }
      if (shop) {
        endpoint += `&shop=${encodeURIComponent(shop as string)}`;
      }

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

  app.get("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/invoices/${id}`, { token: session.token });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
