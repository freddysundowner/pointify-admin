import type { Express } from "express";
import { registerAuthRoutes } from "./auth";
import { registerProductRoutes } from "./products";
import { registerCategoryRoutes } from "./categories";
import { registerDashboardRoutes } from "./dashboard";
import { registerShopRoutes } from "./shops";
import { registerSubscriptionRoutes } from "./subscriptions";
import { registerPackageRoutes } from "./packages";
import { registerInvoiceRoutes } from "./invoices";
import { registerAffiliateRoutes } from "./affiliates";
import { registerSalesRoutes } from "./sales";
import { registerUserRoutes } from "./users";
import { registerRevenueRoutes } from "./revenue";
import { registerPurchaseRoutes } from "./purchases";
import { registerCommunicationRoutes } from "./communication";
import { registerSettingsRoutes } from "./settings";
import { registerTemplateRoutes } from "./templates";

export function registerAllRoutes(app: Express) {
  registerAuthRoutes(app);
  registerProductRoutes(app);
  registerCategoryRoutes(app);
  registerDashboardRoutes(app);
  registerShopRoutes(app);
  registerSubscriptionRoutes(app);
  registerPackageRoutes(app);
  registerInvoiceRoutes(app);
  registerAffiliateRoutes(app);
  registerSalesRoutes(app);
  registerUserRoutes(app);
  registerRevenueRoutes(app);
  registerPurchaseRoutes(app);
  registerCommunicationRoutes(app);
  registerSettingsRoutes(app);
  registerTemplateRoutes(app);
}
