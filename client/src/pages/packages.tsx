import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { apiClient } from "@/lib/api";
import type { Package as PackageType } from "@shared/schema";

const ADMIN_ID = "66b1dc3d77b506e6e9274965";

function formatDuration(value: number, unit: string) {
  return `${value} ${value === 1 ? unit.replace(/s$/, "") : unit}`;
}

function formatCurrency(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PackagesPage() {
  const [search, setSearch] = useState("");

  const { data: packages = [], isLoading, isError } = useQuery<PackageType[]>({
    queryKey: ["/api/packages", ADMIN_ID],
    queryFn: () => apiClient<PackageType[]>(`/packages?id=${ADMIN_ID}`),
  });

  const filtered = packages.filter((pkg) => {
    const q = search.toLowerCase();
    return (
      pkg.title?.toLowerCase().includes(q) ||
      pkg.name?.toLowerCase().includes(q) ||
      pkg.description?.toLowerCase().includes(q) ||
      pkg.type?.toLowerCase().includes(q)
    );
  });

  const total = packages.length;
  const active = packages.filter((p) => p.status).length;
  const inactive = packages.filter((p) => !p.status).length;
  const trial = packages.filter((p) => p.type === "trial").length;
  const production = packages.filter((p) => p.type === "production").length;

  return (
    <DashboardLayout title="Packages">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold" data-testid="stat-total">{total}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-active">{active}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Trial
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-trial">{trial}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="stat-production">{production}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              All Packages
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <XCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm">Failed to load packages. Please try again.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Package className="h-8 w-8" />
                <p className="text-sm">{search ? "No packages match your search." : "No packages found."}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Amount (KES)</TableHead>
                    <TableHead className="text-right">Amount (USD)</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((pkg) => (
                    <TableRow key={pkg._id} data-testid={`row-package-${pkg._id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pkg.title || pkg.name}</p>
                          {pkg.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.type === "trial" ? "secondary" : "default"}
                          className="capitalize flex items-center gap-1 w-fit"
                          data-testid={`badge-type-${pkg._id}`}
                        >
                          {pkg.type === "trial" ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <Zap className="h-3 w-3" />
                          )}
                          {pkg.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(pkg.durationValue, pkg.durationUnit)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(pkg.amount)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 2,
                        }).format(pkg.amountusd)}
                      </TableCell>
                      <TableCell>
                        {pkg.features && pkg.features.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {pkg.features.slice(0, 3).map((f, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {f}
                              </Badge>
                            ))}
                            {pkg.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pkg.features.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pkg.status ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground text-sm">
                            <XCircle className="h-4 w-4" />
                            Inactive
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
