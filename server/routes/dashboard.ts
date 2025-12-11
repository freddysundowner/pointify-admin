import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerDashboardRoutes(app: Express) {
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const shopId = session.user.primaryShop?._id;
      const adminId = session.user._id;

      if (!shopId) {
        return res.status(400).json({ error: "No shop associated with user" });
      }

      const [productsResult, categoriesResult] = await Promise.all([
        apiRequest(`/product/?page=1&limit=1000&shopid=${shopId}`, { token: session.token }),
        apiRequest(`/products/category?admin=${adminId}`, { token: session.token }),
      ]);

      const products = productsResult.data || productsResult || [];
      const categories = categoriesResult || [];

      const totalProducts = Array.isArray(products) ? products.length : 0;
      const lowStockProducts = Array.isArray(products)
        ? products.filter((p: any) => p.quantity > 0 && p.quantity <= p.reorderLevel).length
        : 0;
      const outOfStockProducts = Array.isArray(products)
        ? products.filter((p: any) => p.quantity === 0).length
        : 0;
      const totalCategories = Array.isArray(categories) ? categories.length : 0;

      res.json({
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCategories,
      });
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
