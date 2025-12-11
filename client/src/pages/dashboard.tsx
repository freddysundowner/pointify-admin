import { useQuery } from "@tanstack/react-query";
import { Package, AlertTriangle, XCircle, FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard-layout";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { DashboardStats, Product } from "@shared/schema";

interface ProductsResponse {
  data: Product[];
  count: number;
  totalPages: number;
  currentPage: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  variant?: "default" | "warning" | "danger";
}) {
  const iconColors = {
    default: "text-primary bg-primary/10",
    warning: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    danger: "text-red-600 bg-red-100 dark:bg-red-900/30",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-md ${iconColors[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/dashboard/stats"],
    queryFn: () => apiClient<DashboardStats>("/dashboard/stats"),
    enabled: !!user,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/products", "recent"],
    queryFn: () => apiClient<ProductsResponse | Product[]>("/products?limit=5"),
    enabled: !!user,
  });

  // Handle both array and paginated response formats
  const products = Array.isArray(productsData) ? productsData : productsData?.data || [];
  const isLoading = statsLoading;

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-1">
            Welcome back, {user?.username || "Admin"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's an overview of your store's inventory
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Products"
                value={stats?.totalProducts || 0}
                icon={Package}
              />
              <StatCard
                title="Low Stock"
                value={stats?.lowStockProducts || 0}
                icon={AlertTriangle}
                variant="warning"
              />
              <StatCard
                title="Out of Stock"
                value={stats?.outOfStockProducts || 0}
                icon={XCircle}
                variant="danger"
              />
              <StatCard
                title="Categories"
                value={stats?.totalCategories || 0}
                icon={FolderTree}
              />
            </>
          )}
        </div>

        {!productsLoading && products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    data-testid={`product-item-${product._id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.barcode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {product.sellingPrice?.toLocaleString()}
                      </p>
                      <p className={`text-xs ${product.quantity <= 0 ? "text-red-600" : product.quantity <= product.reorderLevel ? "text-amber-600" : "text-muted-foreground"}`}>
                        {product.quantity} in stock
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
