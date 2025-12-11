import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Loader2, CreditCard, ChevronLeft, ChevronRight, X, Calendar, CheckCircle, XCircle, Clock, Store, CalendarPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";
import type { Subscription, Package, Shop, User } from "@shared/schema";

interface SubscriptionsResponse {
  data: Subscription[];
  count: number;
  totalPages: number;
  currentPage: number;
}

interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceSearchDebounced, setInvoiceSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expiryFrom, setExpiryFrom] = useState("");
  const [expiryTo, setExpiryTo] = useState("");
  const [extendSubscription, setExtendSubscription] = useState<Subscription | null>(null);
  const [newEndDate, setNewEndDate] = useState("");
  const [assignSubscription, setAssignSubscription] = useState<Subscription | null>(null);
  const [selectedShopIds, setSelectedShopIds] = useState<string[]>([]);
  const [shopSearch, setShopSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoiceSearchDebounced(invoiceSearch);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [invoiceSearch]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "10");
    if (searchDebounced) params.set("shopname", searchDebounced);
    if (invoiceSearchDebounced) params.set("invoiceNo", invoiceSearchDebounced);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (expiryFrom) params.set("expiryperiodFrom", expiryFrom);
    if (expiryTo) params.set("expiryperiodTo", expiryTo);
    return params.toString();
  };

  const { data: subscriptionsData, isLoading } = useQuery({
    queryKey: ["/subscriptions", page, searchDebounced, invoiceSearchDebounced, statusFilter, typeFilter, expiryFrom, expiryTo],
    queryFn: () => apiClient<SubscriptionsResponse>(`/subscriptions?${buildQueryString()}`),
    enabled: !!user,
    staleTime: 0,
  });

  const { data: stats } = useQuery({
    queryKey: ["/subscriptions/summary/stats"],
    queryFn: () => apiClient<SubscriptionStats>("/subscriptions/summary/stats"),
    enabled: !!user,
  });

  const { data: shopsData } = useQuery({
    queryKey: ["/shops", "all", shopSearch],
    queryFn: () => apiClient<{ data: Shop[] }>(`/shops?limit=50${shopSearch ? `&name=${encodeURIComponent(shopSearch)}` : ""}`),
    enabled: !!user && !!assignSubscription,
  });

  const shops = shopsData?.data || [];

  const subscriptions = subscriptionsData?.data || [];
  const totalPages = subscriptionsData?.totalPages || 1;
  const totalCount = subscriptionsData?.count || 0;

  const handleOpenExtendDialog = (sub: Subscription) => {
    const defaultNewDate = new Date();
    defaultNewDate.setMonth(defaultNewDate.getMonth() + 1);
    setExtendSubscription(sub);
    setNewEndDate(defaultNewDate.toISOString().split("T")[0]);
  };

  const extendMutation = useMutation({
    mutationFn: ({ id, endDate }: { id: string; endDate: string }) =>
      apiClient(`/subscriptions/extend/${id}`, { method: "PUT", body: { endDate } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/subscriptions/summary/stats"] });
      setExtendSubscription(null);
      setNewEndDate("");
      toast({ title: "Subscription extended successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to extend subscription", description: error.message, variant: "destructive" });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ subscriptionId, shops }: { subscriptionId: string; shops: string[] }) =>
      apiClient(`/subscriptions/assign`, { method: "PUT", body: { subscriptionId, shops } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/subscriptions"] });
      setAssignSubscription(null);
      setSelectedShopIds([]);
      setShopSearch("");
      toast({ title: "Shops assigned to subscription successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to assign shops", description: error.message, variant: "destructive" });
    },
  });

  const toggleShopSelection = (shopId: string) => {
    setSelectedShopIds(prev => 
      prev.includes(shopId) 
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    );
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (!subscription.status) {
      return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
    }
    if (!subscription.paid) {
      return <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending Payment</Badge>;
    }
    if (subscription.endDate) {
      const endDate = new Date(subscription.endDate);
      const now = new Date();
      if (endDate < now) {
        return <Badge variant="destructive" className="text-xs">Expired</Badge>;
      }
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7) {
        return <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Expires in {daysLeft}d</Badge>;
      }
    }
    return <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
  };

  const getShopName = (subscription: Subscription): string => {
    if (typeof subscription.shop === "object" && subscription.shop) {
      return (subscription.shop as Shop).name;
    }
    return subscription.shop as string || "-";
  };

  const getUserName = (subscription: Subscription): string => {
    if (typeof subscription.userId === "object" && subscription.userId) {
      return (subscription.userId as User).username || (subscription.userId as User).email;
    }
    return "-";
  };

  const getPackageName = (subscription: Subscription): string => {
    if (typeof subscription.packageId === "object" && subscription.packageId) {
      return (subscription.packageId as Package).title;
    }
    return "-";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const clearFilters = () => {
    setSearch("");
    setSearchDebounced("");
    setInvoiceSearch("");
    setInvoiceSearchDebounced("");
    setStatusFilter("all");
    setTypeFilter("all");
    setExpiryFrom("");
    setExpiryTo("");
    setPage(1);
  };

  const hasActiveFilters = searchDebounced || invoiceSearchDebounced || statusFilter !== "all" || typeFilter !== "all" || expiryFrom || expiryTo;

  return (
    <DashboardLayout title="Subscriptions">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.expired || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats?.pending || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Shop name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[180px]"
                data-testid="input-search-shopname"
              />
            </div>
            <Input
              placeholder="Invoice No..."
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              className="w-[140px]"
              data-testid="input-search-invoice"
            />
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]" data-testid="select-type-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={expiryFrom}
                onChange={(e) => { setExpiryFrom(e.target.value); setPage(1); }}
                className="w-[140px]"
                placeholder="Expiry from"
                data-testid="input-expiry-from"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                value={expiryTo}
                onChange={(e) => { setExpiryTo(e.target.value); setPage(1); }}
                className="w-[140px]"
                placeholder="Expiry to"
                data-testid="input-expiry-to"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : subscriptions && subscriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription._id} data-testid={`row-subscription-${subscription._id}`}>
                        <TableCell className="font-medium">{getShopName(subscription)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{getUserName(subscription)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{getPackageName(subscription)}</TableCell>
                        <TableCell className="text-right">
                          {subscription.currency || "KES"} {subscription.amount?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(subscription.startDate)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(subscription.endDate)}</TableCell>
                        <TableCell>{getStatusBadge(subscription)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAssignSubscription(subscription)}
                              data-testid={`button-assign-${subscription._id}`}
                            >
                              <Store className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenExtendDialog(subscription)}
                              data-testid={`button-extend-${subscription._id}`}
                            >
                              <CalendarPlus className="h-4 w-4 mr-1" />
                              Extend
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No subscriptions found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {hasActiveFilters ? "Try adjusting your filters" : "No subscriptions have been created yet"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 pt-4 border-t mt-4">
                <span className="text-sm text-muted-foreground">
                  {totalCount.toLocaleString()} subscriptions total
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isLoading}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {page} of {totalPages.toLocaleString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || isLoading}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!extendSubscription} onOpenChange={(open) => {
        if (!open) {
          setExtendSubscription(null);
          setNewEndDate("");
        }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
            <DialogDescription>
              Set a new end date for this subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Extend the subscription for "{extendSubscription && getShopName(extendSubscription)}"
            </p>
            {extendSubscription?.endDate && (
              <div className="text-sm">
                <span className="text-muted-foreground">Current end date: </span>
                <span className="font-medium">{formatDate(extendSubscription.endDate)}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>New End Date</Label>
              <Input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                data-testid="input-extend-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setExtendSubscription(null); setNewEndDate(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => extendSubscription && extendMutation.mutate({ id: extendSubscription._id, endDate: newEndDate })}
              disabled={!newEndDate || extendMutation.isPending}
              data-testid="button-confirm-extend"
            >
              {extendMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CalendarPlus className="h-4 w-4 mr-2" />
              )}
              Extend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignSubscription} onOpenChange={(open) => {
        if (!open) {
          setAssignSubscription(null);
          setSelectedShopIds([]);
          setShopSearch("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Shops</DialogTitle>
            <DialogDescription>
              Select one or more shops to assign to this subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Shops</Label>
              <Input
                placeholder="Search by shop name..."
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                data-testid="input-shop-search"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Shops</Label>
                {selectedShopIds.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedShopIds.length} selected
                  </Badge>
                )}
              </div>
              <ScrollArea className="h-[200px] rounded-md border p-2">
                {shops.length > 0 ? (
                  <div className="space-y-2">
                    {shops.map((shop) => (
                      <div
                        key={shop._id}
                        className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                        onClick={() => toggleShopSelection(shop._id)}
                        data-testid={`checkbox-shop-${shop._id}`}
                      >
                        <Checkbox
                          checked={selectedShopIds.includes(shop._id)}
                          onCheckedChange={() => toggleShopSelection(shop._id)}
                        />
                        <span className="text-sm flex-1">{shop.name}</span>
                        {selectedShopIds.includes(shop._id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No shops found
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssignSubscription(null); setSelectedShopIds([]); setShopSearch(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => assignSubscription && selectedShopIds.length > 0 && assignMutation.mutate({ subscriptionId: assignSubscription._id, shops: selectedShopIds })}
              disabled={selectedShopIds.length === 0 || assignMutation.isPending}
              data-testid="button-confirm-assign"
            >
              {assignMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Store className="h-4 w-4 mr-2" />
              )}
              Assign {selectedShopIds.length > 0 ? `(${selectedShopIds.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
