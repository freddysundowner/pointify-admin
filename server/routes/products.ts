import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerProductRoutes(app: Express) {
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const name = req.query.name || "";
      const shop = req.query.shop || "";
      const shopid = req.query.shopid || "";
      const barcode = req.query.barcode || "";
      const expiryDate = req.query.expiryDate || "";
      const supplier = req.query.supplier || "";

      let endpoint = `/product/admin/products?page=${page}&limit=${limit}`;
      
      if (name) {
        endpoint += `&name=${encodeURIComponent(name as string)}`;
      }
      if (shop) {
        endpoint += `&shop=${encodeURIComponent(shop as string)}`;
      }
      if (shopid) {
        endpoint += `&shopid=${encodeURIComponent(shopid as string)}`;
      }
      if (barcode) {
        endpoint += `&barcode=${encodeURIComponent(barcode as string)}`;
      }
      if (expiryDate) {
        endpoint += `&expiryDate=${encodeURIComponent(expiryDate as string)}`;
      }
      if (supplier) {
        endpoint += `&supplier=${encodeURIComponent(supplier as string)}`;
      }

      const result = await apiRequest(endpoint, { token: session.token });
      // API returns products in data property
      if (Array.isArray(result)) {
        // If result is already an array, wrap it
        res.json({ data: result, count: result.length, totalPages: 1, currentPage: 1 });
      } else if (result.data) {
        // If result has data property, pass through with pagination info
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

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const shopId = session.user.primaryShop?._id;
      if (!shopId) {
        return res.status(400).json({ error: "No shop associated with user" });
      }

      const productData = {
        ...req.body,
        shopId,
        admin: session.user._id,
        attendantId: session.user.attendantId?._id,
        quantity: Number(req.body.quantity) || 0,
        buyingPrice: Number(req.body.buyingPrice) || 0,
        sellingPrice: Number(req.body.sellingPrice) || 0,
        wholesalePrice: req.body.wholesalePrice ? Number(req.body.wholesalePrice) : undefined,
        dealerPrice: req.body.dealerPrice ? Number(req.body.dealerPrice) : undefined,
        reorderLevel: Number(req.body.reorderLevel) || 0,
        deleted: false,
        virtual: false,
        bundle: false,
        taxable: req.body.taxable || false,
        images: [],
        lastCount: Number(req.body.quantity) || 0,
        productType: req.body.productType || "product",
      };

      const result = await apiRequest("/products", {
        method: "POST",
        body: productData,
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;

      const updateData = {
        ...req.body,
        admin: session.user._id,
        attendantId: session.user.attendantId?._id,
        quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : undefined,
        buyingPrice: req.body.buyingPrice !== undefined ? Number(req.body.buyingPrice) : undefined,
        sellingPrice: req.body.sellingPrice !== undefined ? Number(req.body.sellingPrice) : undefined,
        wholesalePrice: req.body.wholesalePrice ? Number(req.body.wholesalePrice) : undefined,
        dealerPrice: req.body.dealerPrice ? Number(req.body.dealerPrice) : undefined,
        reorderLevel: req.body.reorderLevel !== undefined ? Number(req.body.reorderLevel) : undefined,
      };

      const result = await apiRequest(`/products/${id}`, {
        method: "PUT",
        body: updateData,
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const result = await apiRequest(`/products/${id}`, {
        method: "DELETE",
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/products/import", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { products, shopId } = req.body;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: "Products array is required" });
      }

      if (!shopId) {
        return res.status(400).json({ error: "Shop ID is required" });
      }

      const productsWithMeta = products.map((p: any) => ({
        ...p,
        shopId,
        adminId: session.user._id,
        attendantId: session.user.attendantId?._id,
      }));

      const result = await apiRequest("/product/import/products", {
        method: "POST",
        body: { products: productsWithMeta },
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
