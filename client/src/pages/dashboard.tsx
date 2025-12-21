import { useQuery } from "@tanstack/react-query";
import { Store, Users, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard-layout";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface StatsCategory {
  total: number;
  trial: number;
  production: number;
}

interface ShopStats {
  users: {
    active: StatsCategory;
    expired: StatsCategory;
  };
  shops: {
    active: StatsCategory;
    expired: StatsCategory;
  };
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

  const { data: shopStats, isLoading } = useQuery({
    queryKey: ["/subscriptions/shop/stats"],
    queryFn: () => apiClient<ShopStats>("/subscriptions/shop/stats"),
    enabled: !!user,
  });

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-1">
            Welcome back, {user?.username || "Admin"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's an overview of your shop statistics
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
                title="Active Users"
                value={shopStats?.users?.active?.total || 0}
                icon={Users}
              />
              <StatCard
                title="Expired Users"
                value={shopStats?.users?.expired?.total || 0}
                icon={Users}
                variant="danger"
              />
              <StatCard
                title="Active Shops"
                value={shopStats?.shops?.active?.total || 0}
                icon={Store}
              />
              <StatCard
                title="Expired Shops"
                value={shopStats?.shops?.expired?.total || 0}
                icon={Store}
                variant="danger"
              />
            </>
          )}
        </div>

        {shopStats && (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total</span>
                        <span className="font-bold text-green-600">{shopStats.users?.active?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subscribed</span>
                        <span className="font-medium">{shopStats.users?.active?.production || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Trial</span>
                        <span className="font-medium text-amber-600">{shopStats.users?.active?.trial || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Expired</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total</span>
                        <span className="font-bold text-red-600">{shopStats.users?.expired?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subscribed</span>
                        <span className="font-medium">{shopStats.users?.expired?.production || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Trial</span>
                        <span className="font-medium">{shopStats.users?.expired?.trial || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Shops Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total</span>
                        <span className="font-bold text-green-600">{shopStats.shops?.active?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subscribed</span>
                        <span className="font-medium">{shopStats.shops?.active?.production || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Trial</span>
                        <span className="font-medium text-amber-600">{shopStats.shops?.active?.trial || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Expired</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total</span>
                        <span className="font-bold text-red-600">{shopStats.shops?.expired?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subscribed</span>
                        <span className="font-medium">{shopStats.shops?.expired?.production || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Trial</span>
                        <span className="font-medium">{shopStats.shops?.expired?.trial || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
