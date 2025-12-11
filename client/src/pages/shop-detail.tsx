import { useState, Fragment, useRef, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Mail, MessageSquare, Send, Loader2, Store, Calendar, MapPin, Phone, CreditCard, ChevronLeft, ChevronRight, CalendarPlus, ChevronDown, ChevronUp, FileText, Upload, Package, Search, Receipt, Eye } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";
import type { Shop } from "@shared/schema";
import * as XLSX from "xlsx";

interface ShopDetailResponse {
  shop: Shop;
  subscriptions: any[];
}

interface Invoice {
  _id: string;
  invoiceNo: string;
  amount: number;
  currency?: string;
  status: string;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  mpesaCode?: string;
  createAt: string;
}

function InvoiceDetails({ subscriptionId, invoiceNo }: { subscriptionId: string; invoiceNo?: string }) {
  const { user } = useAuth();

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ["/invoices", "subscription", subscriptionId],
    queryFn: () => apiClient<{ data: Invoice[] }>(`/invoices?subscription=${subscriptionId}&limit=10`),
    enabled: !!user && !!subscriptionId,
  });

  const invoices = invoicesData?.data || [];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
        <FileText className="h-4 w-4" />
        <span>No invoices found for this subscription</span>
        {invoiceNo && (
          <Badge variant="secondary" className="ml-2 text-xs">
            Invoice #: {invoiceNo}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4" />
        <span>Invoices ({invoices.length})</span>
      </div>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice._id} data-testid={`row-invoice-${invoice._id}`}>
                <TableCell className="font-medium">{invoice.invoiceNo || "-"}</TableCell>
                <TableCell>
                  {invoice.currency?.toUpperCase() || "KES"} {invoice.amount?.toLocaleString() || "0"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={invoice.status === "paid" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {invoice.status || "pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(invoice.dueDate)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(invoice.paidDate)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {invoice.paymentMethod || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {invoice.mpesaCode || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function ShopDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/shops/:id");
  const shopId = params?.id;

  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    type: "email" | "sms";
    isReminder: boolean;
  }>({ open: false, type: "email", isReminder: false });

  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
  });

  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const subscriptionLimit = 10;
  const [expandedSubscriptions, setExpandedSubscriptions] = useState<Set<string>>(new Set());

  const [extendDialog, setExtendDialog] = useState<{
    open: boolean;
    subscriptionId: string | null;
    currentEndDate: string | null;
  }>({ open: false, subscriptionId: null, currentEndDate: null });
  const [newEndDate, setNewEndDate] = useState("");

  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [productSearchDebounced, setProductSearchDebounced] = useState("");
  const [importDialog, setImportDialog] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [salesPage, setSalesPage] = useState(1);
  const [viewSale, setViewSale] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProductSearchDebounced(productSearch);
      setProductPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const { data: shopData, isLoading: isLoadingShop } = useQuery({
    queryKey: ["/shops", shopId],
    queryFn: () => apiClient<any>(`/shops/${shopId}`),
    enabled: !!user && !!shopId,
  });

  const shop = shopData as any;

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/products", "shop", shopId, productPage, productSearchDebounced],
    queryFn: () => apiClient<any>(`/products?shopid=${shopId}&page=${productPage}&limit=10${productSearchDebounced ? `&name=${productSearchDebounced}` : ""}`),
    enabled: !!user && !!shopId && !!shop,
  });

  const products = productsData?.data || [];
  const productCount = productsData?.count || 0;
  const productTotalPages = productsData?.totalPages || 1;

  const { data: subscriptionsData, isLoading: isLoadingSubscriptions, isError: isSubscriptionsError } = useQuery({
    queryKey: ["/subscriptions", "shop", shopId, subscriptionPage],
    queryFn: () => apiClient<any>(`/subscriptions?shop=${shopId}&limit=${subscriptionLimit}&page=${subscriptionPage}`),
    enabled: !!user && !!shopId && shopId.length > 0,
    retry: 1,
  });

  const subscriptions = subscriptionsData?.data || [];
  const subscriptionCount = subscriptionsData?.count || 0;
  const subscriptionTotalPages = subscriptionsData?.totalPages || 1;
  const subscriptionCurrentPage = subscriptionsData?.currentPage || 1;
  const isLoading = isLoadingShop;

  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ["/sales", "shop", shopId, salesPage],
    queryFn: () => apiClient<any>(`/sales?shopId=${shopId}&page=${salesPage}&limit=10`),
    enabled: !!user && !!shopId && !!shop,
  });

  const sales = salesData?.data || [];
  const salesCount = salesData?.count || 0;
  const salesTotalPages = salesData?.totalPages || 1;

  const extendMutation = useMutation({
    mutationFn: async ({ id, endDate }: { id: string; endDate: string }) => {
      return apiClient(`/subscriptions/extend/${id}`, {
        method: "PUT",
        body: { endDate },
      });
    },
    onSuccess: () => {
      toast({
        title: "Subscription extended",
        description: "The subscription has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/subscriptions", "shop", shopId] });
      setExtendDialog({ open: false, subscriptionId: null, currentEndDate: null });
      setNewEndDate("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to extend subscription",
        description: error.message || "An error occurred while extending the subscription.",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (products: any[]) => {
      return apiClient("/products/import", {
        method: "POST",
        body: { products, shopId },
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Products imported",
        description: data.message || "Products imported successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/products", "shop", shopId] });
      setImportDialog(false);
      setImportData([]);
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import products",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const mappedProducts = jsonData.map((row: any) => ({
          name: row.name || row.Name || row.PRODUCT || row.product || "",
          productCategoryId: row.category || row.Category || row.CATEGORY || "",
          supplierId: row.supplier || row.Supplier || row.SUPPLIER || "",
          buyingPrice: Number(row.buyingPrice || row["Buying Price"] || row.cost || 0),
          sellingPrice: Number(row.sellingPrice || row["Selling Price"] || row.price || 0),
          quantity: Number(row.quantity || row.Quantity || row.stock || 0),
          reorderLevel: Number(row.reorderLevel || row["Reorder Level"] || 0),
          barcode: row.barcode || row.Barcode || "",
          unit: row.unit || row.Unit || "piece",
        }));
        
        setImportData(mappedProducts);
        setImportDialog(true);
      } catch (err) {
        toast({
          title: "Failed to parse file",
          description: "Make sure you upload a valid Excel file (.xlsx, .xls)",
          variant: "destructive",
        });
      } finally {
        setIsParsingFile(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportProducts = () => {
    if (importData.length > 0) {
      importMutation.mutate(importData);
    }
  };

  const handleOpenExtendDialog = (sub: any) => {
    const currentEnd = sub.endDate ? new Date(sub.endDate).toISOString().split("T")[0] : "";
    const defaultNewDate = new Date();
    defaultNewDate.setMonth(defaultNewDate.getMonth() + 1);
    setExtendDialog({
      open: true,
      subscriptionId: sub._id,
      currentEndDate: currentEnd,
    });
    setNewEndDate(defaultNewDate.toISOString().split("T")[0]);
  };

  const handleExtendSubscription = () => {
    if (extendDialog.subscriptionId && newEndDate) {
      extendMutation.mutate({
        id: extendDialog.subscriptionId,
        endDate: newEndDate,
      });
    }
  };

  const handleSendReminder = (type: "email" | "sms") => {
    setMessageDialog({ open: true, type, isReminder: true });
    setMessageForm({
      subject: "Payment Reminder",
      message: type === "email" 
        ? `Dear ${shop?.name || "Customer"},\n\nThis is a friendly reminder that your subscription payment is due. Please ensure timely payment to avoid service interruption.\n\nThank you for your continued business.`
        : `Hi ${shop?.name || "Customer"}, this is a reminder that your subscription payment is due. Please pay to avoid service interruption.`,
    });
  };

  const handleCustomMessage = (type: "email" | "sms") => {
    setMessageDialog({ open: true, type, isReminder: false });
    setMessageForm({ subject: "", message: "" });
  };

  const handleSendMessage = () => {
    toast({
      title: "Integration not configured",
      description: `${messageDialog.type === "email" ? "Email" : "SMS"} integration needs to be set up to send messages.`,
      variant: "destructive",
    });
    setMessageDialog({ open: false, type: "email", isReminder: false });
    setMessageForm({ subject: "", message: "" });
  };

  const getSubscriptionStatus = (sub: any) => {
    if (!sub.endDate) return <Badge variant="secondary">No Expiry</Badge>;
    const endDate = new Date(sub.endDate);
    const now = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (endDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysLeft <= 7) {
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Expires in {daysLeft}d</Badge>;
    }
    return <Badge variant="default">Active ({daysLeft}d)</Badge>;
  };

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

  const toggleSubscriptionExpand = (subId: string) => {
    setExpandedSubscriptions(prev => {
      const next = new Set(prev);
      if (next.has(subId)) {
        next.delete(subId);
      } else {
        next.add(subId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Shop Details">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!shop) {
    return (
      <DashboardLayout title="Shop Details">
        <div className="flex flex-col items-center justify-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Shop not found</h3>
          <Link href="/shops">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Shop Details">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/shops">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{shop.name}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Address</div>
                  <div className="text-sm text-muted-foreground">{shop.address || "-"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Contact</div>
                  <div className="text-sm text-muted-foreground">{shop.contact || "-"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Currency</div>
                  <div className="text-sm text-muted-foreground">{shop.currency || "KES"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">{formatDate(shop.createAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Send Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleSendReminder("email")}
                  data-testid="button-email-reminder"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Reminder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSendReminder("sms")}
                  data-testid="button-sms-reminder"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS Reminder
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => handleCustomMessage("email")}
                  data-testid="button-custom-email"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Custom Email
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => handleCustomMessage("sms")}
                  data-testid="button-custom-sms"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Custom SMS
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="sales" data-testid="tab-sales">Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSubscriptions ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : isSubscriptionsError ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Failed to load subscriptions
                  </div>
                ) : subscriptions.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub: any, index: number) => {
                      const isExpanded = expandedSubscriptions.has(sub._id);
                      return (
                        <Fragment key={sub._id || index}>
                          <TableRow data-testid={`row-subscription-${sub._id || index}`}>
                            <TableCell className="p-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleSubscriptionExpand(sub._id)}
                                data-testid={`button-expand-${sub._id || index}`}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                              {sub.packageId?.title || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {sub.type || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {sub.amount ? `${sub.currency?.toUpperCase() || "KES"} ${sub.amount.toLocaleString()}` : "Free"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(sub.startDate)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(sub.endDate)}
                            </TableCell>
                            <TableCell>{getSubscriptionStatus(sub)}</TableCell>
                            <TableCell>
                              {sub.paid ? (
                                <Badge variant="default" className="text-xs">Paid</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Unpaid</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenExtendDialog(sub)}
                                data-testid={`button-extend-${sub._id || index}`}
                              >
                                <CalendarPlus className="h-4 w-4 mr-1" />
                                Extend
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={9} className="bg-muted/50 p-4">
                                <InvoiceDetails subscriptionId={sub._id} invoiceNo={sub.invoiceNo} />
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
                {subscriptionTotalPages > 1 && (
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="text-sm text-muted-foreground">
                      Showing {((subscriptionCurrentPage - 1) * subscriptionLimit) + 1}-{Math.min(subscriptionCurrentPage * subscriptionLimit, subscriptionCount)} of {subscriptionCount}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSubscriptionPage(p => Math.max(1, p - 1))}
                        disabled={subscriptionCurrentPage <= 1 || isLoadingSubscriptions}
                        data-testid="button-subscription-prev"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        Page {subscriptionCurrentPage} of {subscriptionTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSubscriptionPage(p => Math.min(subscriptionTotalPages, p + 1))}
                        disabled={subscriptionCurrentPage >= subscriptionTotalPages || isLoadingSubscriptions}
                        data-testid="button-subscription-next"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No subscriptions found for this shop
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-base">Products</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9 w-64"
                      data-testid="input-product-search"
                    />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx,.xls"
                    className="hidden"
                    data-testid="input-file-import"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsingFile}
                    data-testid="button-import-products"
                  >
                    {isParsingFile ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Import Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Buying Price</TableHead>
                          <TableHead>Selling Price</TableHead>
                          <TableHead>Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product: any) => (
                          <TableRow key={product._id} data-testid={`row-product-${product._id}`}>
                            <TableCell className="font-medium">{product.name || "-"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {product.productCategoryId?.name || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {product.buyingPrice?.toLocaleString() || "0"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {product.sellingPrice?.toLocaleString() || "0"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {product.quantity?.toLocaleString() || "0"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {productTotalPages > 1 && (
                      <div className="flex items-center justify-between gap-4 pt-2">
                        <div className="text-sm text-muted-foreground">
                          Showing {((productPage - 1) * 10) + 1}-{Math.min(productPage * 10, productCount)} of {productCount}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProductPage(p => Math.max(1, p - 1))}
                            disabled={productPage <= 1 || isLoadingProducts}
                            data-testid="button-product-prev"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            Page {productPage} of {productTotalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProductPage(p => Math.min(productTotalPages, p + 1))}
                            disabled={productPage >= productTotalPages || isLoadingProducts}
                            data-testid="button-product-next"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No products found for this shop</p>
                    <p className="text-sm mt-1">Import products using an Excel file</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : sales.length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Receipt No</TableHead>
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
                        {sales.map((sale: any) => (
                          <TableRow key={sale._id} data-testid={`row-sale-${sale._id}`}>
                            <TableCell className="font-medium">{sale.receiptNo || "-"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {typeof sale.attendantId === "object"
                                ? (sale.attendantId?.username || "-")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {typeof sale.customerId === "object"
                                ? (sale.customerId?.name || "-")
                                : "-"}
                            </TableCell>
                            <TableCell className="font-medium">
                              KES {sale.totalWithDiscount?.toLocaleString() || "0"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{sale.paymentType || "-"}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={sale.status === "completed" || sale.status === "paid" ? "default" : "secondary"}>
                                {sale.status || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(sale.createdAt)}
                            </TableCell>
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
                    {salesTotalPages > 1 && (
                      <div className="flex items-center justify-between gap-4 pt-2">
                        <div className="text-sm text-muted-foreground">
                          Showing {((salesPage - 1) * 10) + 1}-{Math.min(salesPage * 10, salesCount)} of {salesCount}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                            disabled={salesPage <= 1 || isLoadingSales}
                            data-testid="button-sales-prev"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            Page {salesPage} of {salesTotalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSalesPage(p => Math.min(salesTotalPages, p + 1))}
                            disabled={salesPage >= salesTotalPages || isLoadingSales}
                            data-testid="button-sales-next"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No sales found for this shop</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!viewSale} onOpenChange={() => setViewSale(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-sale-details">
            <DialogHeader>
              <DialogTitle data-testid="text-sale-receipt">Sale Details - {viewSale?.receiptNo}</DialogTitle>
            </DialogHeader>
            {viewSale && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Attendant</Label>
                    <p className="font-medium" data-testid="text-sale-attendant">
                      {typeof viewSale.attendantId === "object"
                        ? (viewSale.attendantId?.username || "-")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="font-medium" data-testid="text-sale-customer">
                      {typeof viewSale.customerId === "object"
                        ? (viewSale.customerId?.name || "-")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium" data-testid="text-sale-date">{formatDate(viewSale.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Type</Label>
                    <div className="mt-1" data-testid="badge-sale-payment">
                      <Badge variant="outline">{viewSale.paymentType || "-"}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1" data-testid="badge-sale-status">
                      <Badge variant={viewSale.status === "completed" || viewSale.status === "paid" ? "default" : "secondary"}>
                        {viewSale.status || "Unknown"}
                      </Badge>
                    </div>
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
                        {viewSale.items.map((item: any, idx: number) => {
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
                              <TableCell className="text-xs sm:text-sm">KES {price.toLocaleString()}</TableCell>
                              <TableCell className="text-xs sm:text-sm">KES {itemTotal.toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-bold" data-testid="text-sale-total">KES {viewSale.totalWithDiscount?.toLocaleString() || "0"}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={importDialog} onOpenChange={setImportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Products</DialogTitle>
              <DialogDescription>
                Review the products to be imported. {importData.length} products found in the file.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Buying Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.slice(0, 20).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name || "-"}</TableCell>
                      <TableCell>{product.buyingPrice?.toLocaleString() || "0"}</TableCell>
                      <TableCell>{product.sellingPrice?.toLocaleString() || "0"}</TableCell>
                      <TableCell>{product.quantity?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {importData.length > 20 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  ... and {importData.length - 20} more products
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setImportDialog(false);
                  setImportData([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportProducts}
                disabled={importMutation.isPending || importData.length === 0}
                data-testid="button-confirm-import"
              >
                {importMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import {importData.length} Products
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <Dialog open={messageDialog.open} onOpenChange={(open) => !open && setMessageDialog({ ...messageDialog, open: false })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {messageDialog.isReminder ? "Send Payment Reminder" : "Send Custom Message"}
              {" "}({messageDialog.type === "email" ? "Email" : "SMS"})
            </DialogTitle>
            <DialogDescription>
              {messageDialog.type === "email" 
                ? "Compose an email to send to the shop owner."
                : "Compose an SMS to send to the shop contact."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {messageDialog.type === "email" && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  placeholder="Email subject"
                  data-testid="input-message-subject"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                placeholder={messageDialog.type === "email" ? "Email body..." : "SMS message..."}
                rows={messageDialog.type === "email" ? 6 : 4}
                data-testid="input-message-body"
              />
              {messageDialog.type === "sms" && (
                <div className="text-xs text-muted-foreground text-right">
                  {messageForm.message.length}/160 characters
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMessageDialog({ ...messageDialog, open: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageForm.message || (messageDialog.type === "email" && !messageForm.subject)}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4 mr-2" />
              Send {messageDialog.type === "email" ? "Email" : "SMS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={extendDialog.open} onOpenChange={(open) => !open && setExtendDialog({ ...extendDialog, open: false })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
            <DialogDescription>
              Set a new end date for this subscription. An SMS will be sent to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {extendDialog.currentEndDate && (
              <div className="text-sm">
                <span className="text-muted-foreground">Current end date: </span>
                <span className="font-medium">{formatDate(extendDialog.currentEndDate)}</span>
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
            <Button
              variant="outline"
              onClick={() => setExtendDialog({ open: false, subscriptionId: null, currentEndDate: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExtendSubscription}
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
      </div>
    </DashboardLayout>
  );
}
