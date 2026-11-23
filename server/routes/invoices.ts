import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

// The Pointify API has no separate invoice store: every subscription record is
// an invoice (it carries invoiceNo, amount, currency and paid status). These
// routes read subscriptions and present them in the shape the admin UI expects.
function toInvoice(sub: any) {
  if (!sub || typeof sub !== "object") return null;
  return {
    _id: sub._id,
    invoiceNo: sub.invoiceNo || "",
    amount: Number(sub.amount || 0),
    currency: sub.currency || "",
    status: sub.paid ? "paid" : "pending",
    dueDate: sub.endDate || null,
    paidDate: sub.paid ? sub.startDate || sub.createAt || null : null,
    subscription: sub._id,
    shop: sub.shop?._id || sub.shop || null,
    package: sub.packageId?.title || sub.packageId?.name || null,
  };
}

function listFrom(result: any): any[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.subscriptions)) return result.subscriptions;
  return [];
}

export function registerInvoiceRoutes(app: Express) {
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const subscription = (req.query.subscription as string) || "";
      const shop = (req.query.shop as string) || "";

      if (subscription) {
        const sub = await apiRequest(`/subscriptions/${encodeURIComponent(subscription)}`, { token: session.token });
        const invoice = toInvoice(sub?.data || sub);
        const data = invoice ? [invoice] : [];
        return res.json({ data, count: data.length, totalPages: 1, currentPage: 1 });
      }

      let endpoint = `/subscriptions?page=${page}&limit=${limit}`;
      if (shop) endpoint += `&shop=${encodeURIComponent(shop)}`;
      const result = await apiRequest(endpoint, { token: session.token });
      const data = listFrom(result).map(toInvoice).filter(Boolean);
      const count = Number(result?.count || result?.total || data.length);
      res.json({
        data,
        count,
        totalPages: Number(result?.totalPages || Math.max(1, Math.ceil(count / limit))),
        currentPage: Number(result?.currentPage || page),
      });
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
      const sub = await apiRequest(`/subscriptions/${encodeURIComponent(id)}`, { token: session.token });
      const invoice = toInvoice(sub?.data || sub);
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });
      res.json(invoice);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
