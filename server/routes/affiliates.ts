import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerAffiliateRoutes(app: Express) {
  app.get("/api/affiliates", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await apiRequest("/affiliates", { token: session.token });
      
      if (Array.isArray(result)) {
        res.json({ data: result });
      } else if (result.data) {
        res.json({ data: result.data });
      } else if (result.affiliates) {
        res.json({ data: result.affiliates });
      } else {
        res.json({ data: [] });
      }
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
