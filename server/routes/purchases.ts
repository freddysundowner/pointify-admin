import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerPurchaseRoutes(app: Express) {
  app.get("/api/purchases", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { shopId, attendantId, supplierId, paymentType, start, end, purchaseNo, name, page, limit } = req.query;

      let endpoint = `/purchases?`;
      const params = new URLSearchParams();
      
      if (shopId) params.set("shopId", shopId as string);
      if (attendantId) params.set("attendantId", attendantId as string);
      if (supplierId) params.set("supplierId", supplierId as string);
      if (paymentType) params.set("paymentType", paymentType as string);
      if (start) params.set("start", start as string);
      if (end) params.set("end", end as string);
      if (purchaseNo) params.set("purchaseNo", purchaseNo as string);
      if (name) params.set("name", name as string);
      if (page) params.set("page", page as string);
      if (limit) params.set("limit", limit as string);

      endpoint += params.toString();

      const result = await apiRequest(endpoint, { token: session.token });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
