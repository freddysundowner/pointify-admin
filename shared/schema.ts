import { z } from "zod";

export interface User {
  _id: string;
  email: string;
  username: string;
  phone: string;
  primaryShop?: Shop;
  attendantId?: { username: string; _id: string };
  permissions?: string;
  status: "online" | "offline" | "hybrid";
  emailVerified: boolean;
  createdAt: string;
}

export interface Shop {
  _id: string;
  name: string;
  sync?: boolean;
  address?: string;
  shopCategoryId?: string;
  showstockonline?: boolean;
  showpriceonline?: boolean;
  location?: {
    type: string;
    coordinates: number[];
  };
  subscription?: SubscriptionRef;
  deletewarning?: number;
  tax?: number;
  affliate?: string;
  backupdate?: string;
  currency?: string;
  warehouseemail?: string;
  contact?: string;
  paybill_till?: string;
  paybill_account?: string;
  address_receipt?: string;
  backupInterval?: string;
  backupemail?: string;
  receiptemail?: string;
  warehouse?: boolean;
  allowBackup?: boolean;
  useWarehouse?: boolean;
  trackbatches?: boolean;
  allowOnlineSelling?: boolean;
  allownegativeselling?: boolean;
  production?: boolean;
  adminId?: string | User;
  createAt?: string;
}

export interface SubscriptionRef {
  _id: string;
  packageId?: Package;
  expiryDate?: string;
}

export interface Package {
  _id: string;
  title: string;
  name?: string;
  sync?: boolean;
  description?: string;
  durationValue: number;
  durationUnit: "days" | "weeks" | "months" | "years";
  amount: number;
  amountusd: number;
  newTitle?: string;
  newAmount?: number;
  newAmountusd?: number;
  newMaxShops?: number;
  newDurationValue?: number;
  newDurationUnit?: "days" | "weeks" | "months" | "years";
  discount?: number;
  status: boolean;
  order?: number;
  type: "trial" | "production";
  features?: string[];
  maxShops?: number;
}

export interface Subscription {
  _id: string;
  userId: string | User;
  sync?: boolean;
  shop: string | Shop;
  shops?: (string | Shop)[];
  packageId: string | Package;
  mpesaCode?: string;
  amount: number;
  invoiceNo?: string;
  type?: string;
  status: boolean;
  commission?: number;
  currency?: string;
  paid: boolean;
  startDate: string;
  endDate?: string;
  createAt: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  userdata: User;
}

export interface ProductCategory {
  _id: string;
  name: string;
  admin: string;
}

export interface Attendant {
  _id: string;
  username: string;
}

export interface Product {
  _id: string;
  name: string;
  barcode: string;
  buyingPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  dealerPrice?: number;
  minSellingPrice?: number;
  quantity: number;
  lastCount: number;
  maxDiscount?: number;
  reorderLevel: number;
  productCategoryId?: ProductCategory | string;
  measure?: string;
  manufacturer?: string;
  deleted: boolean;
  virtual: boolean;
  bundle: boolean;
  taxable: boolean;
  shopId: string | Shop;
  attendantId?: string | Attendant;
  description?: string;
  images: string[];
  expiryDate?: string;
  productType: string;
  date: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
}

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  buyingPrice: z.number().min(0, "Buying price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  wholesalePrice: z.number().optional(),
  dealerPrice: z.number().optional(),
  quantity: z.number().min(0, "Quantity must be positive"),
  reorderLevel: z.number().min(0).default(0),
  productCategoryId: z.string().optional(),
  description: z.string().optional(),
  productType: z.string().default("product"),
  taxable: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
