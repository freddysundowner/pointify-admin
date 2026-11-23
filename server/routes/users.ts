import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerUserRoutes(app: Express) {
  // Get admins filtered by subscription status and type (for bulk communication)
  app.get("/api/admin/users/subscriptions", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const subscriptionStatus = req.query.subscriptionStatus || "";
      const subscriptionType = req.query.subscriptionType || "";

      let endpoint = `/admin/users/subscriptions?page=${page}&limit=${limit}`;
      
      if (subscriptionStatus) {
        endpoint += `&subscriptionStatus=${encodeURIComponent(subscriptionStatus as string)}`;
      }
      if (subscriptionType) {
        endpoint += `&subscriptionType=${encodeURIComponent(subscriptionType as string)}`;
      }

      const result = await apiRequest(endpoint, { token: session.token });
      
      // Handle the response format from the ReggyPOS API
      if (result.admins) {
        res.json({
          admins: result.admins,
          totalAdmins: result.totalAdmins || result.admins.length,
          totalPages: result.totalPages || Math.ceil((result.totalAdmins || result.admins.length) / Number(limit)),
          currentPage: result.currentPage || Number(page),
        });
      } else if (Array.isArray(result)) {
        res.json({
          admins: result,
          totalAdmins: result.length,
          totalPages: 1,
          currentPage: 1,
        });
      } else {
        res.json({
          admins: [],
          totalAdmins: 0,
          totalPages: 1,
          currentPage: 1,
        });
      }
    } catch (error: any) {
      console.error("Error fetching admins by subscription:", error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search || "";
      const shopId = req.query.shopId || "";

      let endpoint = `/admin?page=${page}&limit=${limit}`;
      
      if (search) {
        endpoint += `&name=${encodeURIComponent(search as string)}`;
      }
      if (shopId) {
        endpoint += `&shopId=${encodeURIComponent(shopId as string)}`;
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
      } else if (result.users) {
        res.json({ 
          data: result.users, 
          count: result.users.length, 
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

  app.post("/api/users/:id/reset-password", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const result = await apiRequest(`/auth/reset/password/sms`, {
        method: "POST",
        token: session.token,
        body: { id, password },
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || "Failed to reset password" });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;

      const result = await apiRequest(`/admin/${id}`, {
        method: "PUT",
        token: session.token,
        body: req.body,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;

      const result = await apiRequest(`/admin/${id}`, {
        method: "DELETE",
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || "Failed to delete user" });
    }
  });
}
