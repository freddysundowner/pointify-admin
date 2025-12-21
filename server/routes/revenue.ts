import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerRevenueRoutes(app: Express) {
  app.get("/api/revenue/stats", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const result = await apiRequest("/subscriptions/summary/stats", { token: session.token });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching revenue stats:", error);
      res.status(error.status || 500).json({ error: error.message || "Failed to fetch revenue stats" });
    }
  });

  app.get("/api/revenue/transactions", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      const result = await apiRequest(`/payments/transactions?page=${page}&limit=${limit}`, { token: session.token });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      res.status(error.status || 500).json({ error: error.message || "Failed to fetch transactions" });
    }
  });

  app.post("/api/revenue/withdraw", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { phonenumber, amount, pin, id, transactionId } = req.body;

      if (!phonenumber || !amount || !pin) {
        return res.status(400).json({ error: "Phone number, amount, and PIN are required" });
      }

      const body: Record<string, any> = { phonenumber, amount, pin };
      if (id) {
        body.id = id;
      }
      if (transactionId) {
        body.transactionId = transactionId;
      }

      const result = await apiRequest("/payments/mpesa/withdraw", { 
        method: "POST",
        token: session.token,
        body
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      res.status(error.status || 500).json({ error: error.message || "Failed to process withdrawal" });
    }
  });

  app.post("/api/revenue/pay-subscription", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { userId, shops, email, phonenumber, package: packageId, paymentType, shop, amount } = req.body;

      if (!userId || !shops || !Array.isArray(shops) || shops.length === 0 || !phonenumber || !packageId) {
        return res.status(400).json({ 
          status: false, 
          message: "User ID, shops, phone number, and package are required" 
        });
      }

      const result = await apiRequest("/subscriptions", { 
        method: "POST",
        token: session.token,
        body: {
          userId,
          shops,
          email,
          phonenumber,
          package: packageId,
          paymentType: paymentType || "mpesa",
          shop,
          amount
        }
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error processing subscription payment:", error);
      res.status(error.status || 500).json({ 
        status: false, 
        message: error.message || "Failed to process subscription payment" 
      });
    }
  });
}
