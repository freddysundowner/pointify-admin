import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Receipt, ChevronLeft, ChevronRight, Filter, X, Eye } from "lucide-react";
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

interface Sale {
  _id: string;
  receiptNo: string;
  totalWithDiscount: number;
  status: string;
  paymentType: string;
  paymentTag?: string;
  shopId?: { _id: string; name: string } | string;
  attendantId?: { _id: string; username: string } | string;
  customerId?: { _id: string; name: string } | string;
  createdAt: string;
  items?: Array<{
    productId?: { _id: string; name: string } | string;
    quantity: number;
    sellingPrice: number;
    total: number;
  }>;
}

interface SalesResponse {
  data: Sale[];
  count: number;
  totalPages: number;
  currentPage: number;
}

interface Shop {
  _id: string;
  name: string;
}

interface Filters {
  shopId: string;
  paymentType: string;
  status: string;
  start: string;
  end: string;
}

const defaultFilters: Filters = {
  shopId: "",
  paymentType: "",
  status: "",
  start: "",
  end: "",
};

export default function SalesPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [viewSale, setViewSale] = useState<Sale | null>(null);

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

  const hasActiveFilters = filters.shopId || filters.paymentType || filters.status || filters.start || filters.end || searchDebounced;

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "10");
    if (searchDebounced) params.set("receiptNo", searchDebounced);
    if (filters.shopId) params.set("shopId", filters.shopId);
    if (filters.paymentType) params.set("paymentType", filters.paymentType);
    if (filters.status) params.set("status", filters.status);
    if (filters.start) params.set("start", filters.start);
    if (filters.end) params.set("end", filters.end);
    return params.toString();
  };

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["/sales", page, searchDebounced, filters.shopId, filters.paymentType, filters.status, filters.start, filters.end],
    queryFn: () => apiClient<SalesResponse>(`/sales?${buildQueryString()}`),
    enabled: !!user,
  });

  const { data: shopsData } = useQuery({
    queryKey: ["/shops"],
    queryFn: () => apiClient<{ data: Shop[] }>("/shops?limit=100"),
    enabled: !!user,
  });

  const sales = salesData?.data || [];
  const totalPages = salesData?.totalPages || 1;
  const totalCount = salesData?.count || 0;
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

  const getShopName = (shopId: Sale["shopId"]) => {
    if (!shopId) return "-";
    if (typeof shopId === "object") {
      return shopId.name || "-";
    }
    return "-";
  };

  const getAttendantName = (attendantId: Sale["attendantId"]) => {
    if (!attendantId) return "-";
    if (typeof attendantId === "object") {
      return attendantId.username || "-";
    }
    return "-";
  };

  const getCustomerName = (customerId: Sale["customerId"]) => {
    if (!customerId) return "-";
    if (typeof customerId === "object") {
      return customerId.name || "-";
    }
    return "-";
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return <Badge variant="default">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
      case "refunded":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const getPaymentTypeBadge = (paymentType: string) => {
    switch (paymentType?.toLowerCase()) {
      case "cash":
        return <Badge variant="outline">Cash</Badge>;
      case "mpesa":
        return <Badge variant="outline">M-Pesa</Badge>;
      case "card":
        return <Badge variant="outline">Card</Badge>;
      case "credit":
        return <Badge variant="outline">Credit</Badge>;
      default:
        return <Badge variant="outline">{paymentType || "-"}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Sales">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Sales</h1>
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalCount.toLocaleString()} total
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
                data-testid="input-search-sales"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="ml-2 text-xs">
                  Active
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Shop</Label>
                  <Select value={filters.shopId} onValueChange={(val) => updateFilter("shopId", val)}>
                    <SelectTrigger data-testid="select-shop-filter">
                      <SelectValue placeholder="All shops" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All shops</SelectItem>
                      {shops.map((shop) => (
                        <SelectItem key={shop._id} value={shop._id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select value={filters.paymentType} onValueChange={(val) => updateFilter("paymentType", val)}>
                    <SelectTrigger data-testid="select-payment-filter">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(val) => updateFilter("status", val)}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.start}
                    onChange={(e) => updateFilter("start", e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.end}
                    onChange={(e) => updateFilter("end", e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sales List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sales.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt No</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Attendant</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale._id} data-testid={`row-sale-${sale._id}`}>
                        <TableCell className="font-medium">{sale.receiptNo || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{getShopName(sale.shopId)}</TableCell>
                        <TableCell className="text-muted-foreground">{getAttendantName(sale.attendantId)}</TableCell>
                        <TableCell className="text-muted-foreground">{getCustomerName(sale.customerId)}</TableCell>
                        <TableCell className="font-medium">KES {formatCurrency(sale.totalWithDiscount)}</TableCell>
                        <TableCell>{getPaymentTypeBadge(sale.paymentType)}</TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(sale.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewSale(sale)}
                            data-testid={`button-view-sale-${sale._id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        data-testid="button-next-page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">No sales found</h3>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters ? "Try adjusting your filters" : "Sales will appear here once they are made"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!viewSale} onOpenChange={() => setViewSale(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-sale-details">
            <DialogHeader>
              <DialogTitle data-testid="text-sale-receipt">Sale Details - {viewSale?.receiptNo}</DialogTitle>
            </DialogHeader>
            {viewSale && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Shop</Label>
                    <p className="font-medium" data-testid="text-sale-shop">{getShopName(viewSale.shopId)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Attendant</Label>
                    <p className="font-medium" data-testid="text-sale-attendant">{getAttendantName(viewSale.attendantId)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="font-medium" data-testid="text-sale-customer">{getCustomerName(viewSale.customerId)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium" data-testid="text-sale-date">{formatDate(viewSale.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Type</Label>
                    <div className="mt-1" data-testid="badge-sale-payment">{getPaymentTypeBadge(viewSale.paymentType)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1" data-testid="badge-sale-status">{getStatusBadge(viewSale.status)}</div>
                  </div>
                </div>

                {viewSale.items && viewSale.items.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Items</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewSale.items.map((item: any, idx) => {
                          const qty = item.quantity || item.qty || 0;
                          const price = item.sellingPrice || item.price || item.unitPrice || 0;
                          const itemTotal = item.total || item.amount || item.subtotal || item.lineTotal || (qty * price);
                          return (
                            <TableRow key={idx}>
                              <TableCell className="text-xs sm:text-sm">
                                {typeof item.productId === "object" && item.productId?.name
                                  ? item.productId.name
                                  : typeof item.product === "object" && item.product?.name
                                  ? item.product.name
                                  : (item.name || item.productName || item.product || "-")}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">{qty}</TableCell>
                              <TableCell className="text-xs sm:text-sm">KES {formatCurrency(price)}</TableCell>
                              <TableCell className="text-xs sm:text-sm">KES {formatCurrency(itemTotal)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-bold" data-testid="text-sale-total">KES {formatCurrency(viewSale.totalWithDiscount)}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
