import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerSalesRoutes(app: Express) {
  app.get("/api/sales", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const shopId = req.query.shopId || "";
      const attendantId = req.query.attendantId || "";
      const customerId = req.query.customerId || "";
      const paymentType = req.query.paymentType || "";
      const paymentTag = req.query.paymentTag || "";
      const start = req.query.start || "";
      const end = req.query.end || "";
      const status = req.query.status || "";
      const receiptNo = req.query.receiptNo || "";
      const affliate = req.query.affliate || "";

      let endpoint = `/sales/filter?page=${page}&limit=${limit}`;
      
      if (shopId) {
        endpoint += `&shopId=${encodeURIComponent(shopId as string)}`;
      }
      if (attendantId) {
        endpoint += `&attendantId=${encodeURIComponent(attendantId as string)}`;
      }
      if (customerId) {
        endpoint += `&customerId=${encodeURIComponent(customerId as string)}`;
      }
      if (paymentType) {
        endpoint += `&paymentType=${encodeURIComponent(paymentType as string)}`;
      }
      if (paymentTag) {
        endpoint += `&paymentTag=${encodeURIComponent(paymentTag as string)}`;
      }
      if (start) {
        endpoint += `&start=${encodeURIComponent(start as string)}`;
      }
      if (end) {
        endpoint += `&end=${encodeURIComponent(end as string)}`;
      }
      if (status) {
        endpoint += `&status=${encodeURIComponent(status as string)}`;
      }
      if (receiptNo) {
        endpoint += `&receiptNo=${encodeURIComponent(receiptNo as string)}`;
      }
      if (affliate) {
        endpoint += `&affliate=${encodeURIComponent(affliate as string)}`;
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
      } else if (result.sales) {
        res.json({ 
          data: result.sales, 
          count: result.sales.length, 
          totalPages: 1, 
          currentPage: 1 
        });
      } else {
        res.json({ data: [], count: 0, totalPages: 1, currentPage: 1 });
      }
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
