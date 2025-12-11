import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, ChevronLeft, ChevronRight, Filter, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/dashboard-layout";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface PurchaseItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    quantity?: number;
  };
  quantity: number;
  unitPrice: number;
  lineDiscount?: number;
  createdAt?: string;
}

interface Purchase {
  _id: string;
  purchaseNo?: string;
  totalAmount: number;
  amountPaid?: number;
  outstandingBalance?: number;
  paymentType?: string;
  shopId?: { _id: string; name: string } | null;
  attendantId?: { _id: string; username: string } | null;
  supplierId?: { _id: string; name: string } | null;
  createdAt?: string;
  sync?: boolean;
  items?: PurchaseItem[];
}

interface PurchasesResponse {
  purchases: Purchase[];
  page: string;
  limit: string;
  total: number;
}

interface Shop {
  _id: string;
  name: string;
}

interface Filters {
  shopId: string;
  paymentType: string;
  start: string;
  end: string;
}

const defaultFilters: Filters = {
  shopId: "",
  paymentType: "",
  start: "",
  end: "",
};

export default function PurchasesPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearch("");
    setSearchDebounced("");
    setPage(1);
  };

  const hasActiveFilters = filters.shopId || filters.paymentType || filters.start || filters.end || searchDebounced;

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "10");
    if (searchDebounced) params.set("name", searchDebounced);
    if (filters.shopId) params.set("shopId", filters.shopId);
    if (filters.paymentType) params.set("paymentType", filters.paymentType);
    if (filters.start) params.set("start", filters.start);
    if (filters.end) params.set("end", filters.end);
    return params.toString();
  };

  const { data: purchasesData, isLoading } = useQuery({
    queryKey: ["/purchases", page, searchDebounced, filters.shopId, filters.paymentType, filters.start, filters.end],
    queryFn: () => apiClient<PurchasesResponse>(`/purchases?${buildQueryString()}`),
    enabled: !!user,
  });

  const { data: shopsData } = useQuery({
    queryKey: ["/shops"],
    queryFn: () => apiClient<{ data: Shop[] }>("/shops?limit=100"),
    enabled: !!user,
  });

  const purchases = purchasesData?.purchases || [];
  const totalCount = purchasesData?.total || 0;
  const currentPage = parseInt(purchasesData?.page || "1", 10);
  const limit = parseInt(purchasesData?.limit || "10", 10);
  const hasMore = purchases.length === limit && (currentPage * limit) < totalCount;
  const shops = shopsData?.data || [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', { 
      timeZone: 'Africa/Nairobi',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatCurrency = (amount: number) => {
    return amount?.toLocaleString() || "0";
  };

  const getShopName = (shopId: Purchase["shopId"]) => {
    if (!shopId) return "-";
    return shopId.name || "-";
  };

  const getAttendantName = (attendantId: Purchase["attendantId"]) => {
    if (!attendantId) return "-";
    return attendantId.username || "-";
  };

  const getSupplierName = (supplierId: Purchase["supplierId"]) => {
    if (!supplierId) return "-";
    return supplierId.name || "-";
  };

  const getPaymentBadge = (paymentType: string, outstandingBalance?: number) => {
    if (outstandingBalance && outstandingBalance > 0) {
      return <Badge variant="destructive">Credit</Badge>;
    }
    switch (paymentType?.toLowerCase()) {
      case "cash":
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Cash</Badge>;
      case "mpesa":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">M-Pesa</Badge>;
      case "bank":
        return <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400">Bank</Badge>;
      case "credit":
        return <Badge variant="destructive">Credit</Badge>;
      default:
        return <Badge variant="secondary">{paymentType || "Unknown"}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Purchases">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">Purchases</h1>
            <p className="text-sm text-muted-foreground">View all purchase transactions</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                All Purchases
                {totalCount > 0 && (
                  <Badge variant="secondary" className="ml-2">{totalCount}</Badge>
                )}
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-[200px]"
                    data-testid="input-search-purchases"
                  />
                </div>
                <Button
                  variant={hasActiveFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 bg-primary-foreground text-primary">
                      Active
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 border rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filter Purchases</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Shop</Label>
                    <Select value={filters.shopId} onValueChange={(val) => updateFilter("shopId", val === "all" ? "" : val)}>
                      <SelectTrigger data-testid="select-filter-shop">
                        <SelectValue placeholder="All Shops" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Shops</SelectItem>
                        {shops.map((shop) => (
                          <SelectItem key={shop._id} value={shop._id}>{shop.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <Select value={filters.paymentType} onValueChange={(val) => updateFilter("paymentType", val === "all" ? "" : val)}>
                      <SelectTrigger data-testid="select-filter-payment">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={filters.start}
                      onChange={(e) => updateFilter("start", e.target.value)}
                      data-testid="input-filter-start"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={filters.end}
                      onChange={(e) => updateFilter("end", e.target.value)}
                      data-testid="input-filter-end"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchases found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Purchase No</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Attendant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase._id} data-testid={`row-purchase-${purchase._id}`}>
                          <TableCell className="font-medium" data-testid={`text-purchaseno-${purchase._id}`}>
                            {purchase.purchaseNo || "-"}
                          </TableCell>
                          <TableCell data-testid={`text-shop-${purchase._id}`}>
                            {getShopName(purchase.shopId)}
                          </TableCell>
                          <TableCell data-testid={`text-attendant-${purchase._id}`}>
                            {getAttendantName(purchase.attendantId)}
                          </TableCell>
                          <TableCell data-testid={`text-amount-${purchase._id}`}>
                            KES {formatCurrency(purchase.totalAmount)}
                          </TableCell>
                          <TableCell data-testid={`text-paid-${purchase._id}`}>
                            KES {formatCurrency(purchase.amountPaid || 0)}
                          </TableCell>
                          <TableCell data-testid={`text-outstanding-${purchase._id}`}>
                            {purchase.outstandingBalance && purchase.outstandingBalance > 0 
                              ? <span className="text-destructive">KES {formatCurrency(purchase.outstandingBalance)}</span>
                              : "-"
                            }
                          </TableCell>
                          <TableCell data-testid={`text-payment-${purchase._id}`}>
                            {getPaymentBadge(purchase.paymentType || "", purchase.outstandingBalance)}
                          </TableCell>
                          <TableCell data-testid={`text-date-${purchase._id}`}>
                            {formatDate(purchase.createdAt || "")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewPurchase(purchase)}
                              data-testid={`button-view-${purchase._id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalCount > limit && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {purchases.length} of {totalCount.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasMore}
                        data-testid="button-next-page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!viewPurchase} onOpenChange={(open) => !open && setViewPurchase(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Purchase Details</DialogTitle>
            </DialogHeader>
            {viewPurchase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase No</p>
                    <p className="font-medium">{viewPurchase.purchaseNo || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(viewPurchase.createdAt || "")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shop</p>
                    <p className="font-medium">{getShopName(viewPurchase.shopId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendant</p>
                    <p className="font-medium">{getAttendantName(viewPurchase.attendantId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">{getSupplierName(viewPurchase.supplierId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Type</p>
                    {getPaymentBadge(viewPurchase.paymentType || "", viewPurchase.outstandingBalance)}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">KES {formatCurrency(viewPurchase.totalAmount)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Amount Paid</p>
                    <p className="font-semibold text-green-600">KES {formatCurrency(viewPurchase.amountPaid || 0)}</p>
                  </div>
                  {viewPurchase.outstandingBalance !== undefined && viewPurchase.outstandingBalance > 0 && (
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Outstanding Balance</p>
                      <p className="font-semibold text-destructive">KES {formatCurrency(viewPurchase.outstandingBalance)}</p>
                    </div>
                  )}
                </div>

                {viewPurchase.items && viewPurchase.items.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Items ({viewPurchase.items.length})</p>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Discount</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewPurchase.items.map((item) => (
                            <TableRow key={item._id}>
                              <TableCell>{item.product?.name || "-"}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">KES {formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell className="text-right">{item.lineDiscount || 0}</TableCell>
                              <TableCell className="text-right">KES {formatCurrency(item.quantity * item.unitPrice - (item.lineDiscount || 0))}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
