import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Banknote,
  RefreshCw,
  CreditCardIcon,
  Search,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PeriodStats {
  count: number;
  revenue: number;
  shopCount: number;
}

interface RevenueStats {
  success?: boolean;
  data?: {
    today?: PeriodStats;
    yesterday?: PeriodStats;
    thisWeek?: PeriodStats;
    thisMonth?: PeriodStats;
    lastMonth?: PeriodStats;
    allTime?: PeriodStats;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Affliate {
  _id?: string;
  name?: string;
  phonenumber?: string;
  email?: string;
  commission?: number;
  wallet?: number;
  [key: string]: any;
}

interface Transaction {
  _id: string;
  amount: number;
  status: boolean | string;
  type?: string;
  mpesaCode?: string;
  reference?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  balance?: number;
  affliate?: Affliate;
  affliateAmount?: number;
  transId?: string;
  shop?: { name: string; _id: string } | string;
  user?: { name?: string; username?: string; phonenumber?: string; phone?: string; _id: string; [key: string]: any } | string;
  [key: string]: any;
}

interface TransactionsResponse {
  success?: boolean;
  data?: Transaction[];
  transactions?: Transaction[];
  count?: number;
  total?: number;
  totalPages?: number;
  page?: number;
  [key: string]: any;
}

interface UserOption {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
}

interface ShopOption {
  _id: string;
  name: string;
  adminId?: string | { _id: string };
}

interface PackageOption {
  _id: string;
  title: string;
  amount: number;
  duration?: number;
  description?: string;
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "KES 0";
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  // Kenyan phone: 07XXXXXXXX, 01XXXXXXXX, 254XXXXXXXXX, +254XXXXXXXXX
  const patterns = [
    /^07\d{8}$/,      // 07XXXXXXXX (10 digits)
    /^01\d{8}$/,      // 01XXXXXXXX (10 digits)
    /^254[17]\d{8}$/, // 254XXXXXXXXX (12 digits)
    /^\+254[17]\d{8}$/ // +254XXXXXXXXX (13 chars)
  ];
  return patterns.some(pattern => pattern.test(cleaned));
}

function formatKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("+254")) {
    return cleaned.substring(1);
  }
  if (cleaned.startsWith("0")) {
    return "254" + cleaned.substring(1);
  }
  return cleaned;
}

function formatTransactionAmount(amount: number | undefined, type: string | undefined): JSX.Element {
  if (amount === undefined || amount === null) return <span>KES 0</span>;
  const typeStr = (type || "").toLowerCase();
  const isNegative = typeStr === "withdraw" || typeStr === "withdrawal" || typeStr === "refund";
  const sign = isNegative ? "-" : "+";
  const colorClass = isNegative 
    ? "text-red-600 dark:text-red-400" 
    : "text-green-600 dark:text-green-400";
  
  return (
    <span className={colorClass}>
      {sign} KES {amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
    </span>
  );
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeBadge(type: string | undefined) {
  const typeStr = (type || "").toLowerCase();
  if (typeStr === "withdraw" || typeStr === "withdrawal") {
    return <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">{type}</Badge>;
  } else if (typeStr === "deposit") {
    return <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">{type}</Badge>;
  } else if (typeStr === "payment" || typeStr === "pay") {
    return <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">{type}</Badge>;
  } else if (typeStr === "refund") {
    return <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800">{type}</Badge>;
  } else if (typeStr === "transfer") {
    return <Badge variant="outline" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800">{type}</Badge>;
  }
  return <Badge variant="outline">{type || "-"}</Badge>;
}

function getStatusBadge(status: any) {
  if (typeof status === "boolean") {
    return status 
      ? <Badge variant="default" className="bg-green-600">Success</Badge>
      : <Badge variant="destructive">Failed</Badge>;
  }
  const statusStr = String(status || "");
  const statusLower = statusStr.toLowerCase();
  if (statusLower === "completed" || statusLower === "success" || statusLower === "true") {
    return <Badge variant="default" className="bg-green-600">{statusStr}</Badge>;
  } else if (statusLower === "pending") {
    return <Badge variant="secondary">{statusStr}</Badge>;
  } else if (statusLower === "failed" || statusLower === "cancelled" || statusLower === "false") {
    return <Badge variant="destructive">{statusStr}</Badge>;
  }
  return <Badge variant="outline">{statusStr || "Unknown"}</Badge>;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
}: { 
  title: string; 
  value: string | number; 
  icon: any;
  description?: string;
  trend?: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RevenueContent() {
  const [page, setPage] = useState(1);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reinitiateId, setReinitiateId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Pay for Subscription state
  const [paySubOpen, setPaySubOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchDebounced, setUserSearchDebounced] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [payPhone, setPayPhone] = useState("");
  const [payPhoneError, setPayPhoneError] = useState("");
  const [isPaySubmitting, setIsPaySubmitting] = useState(false);

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserSearchDebounced(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);
  
  const { data, isLoading, error } = useQuery<RevenueStats>({
    queryKey: ["/api/revenue/stats"],
    queryFn: () => apiClient<RevenueStats>("/revenue/stats"),
  });

  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<TransactionsResponse>({
    queryKey: ["/api/revenue/transactions", page],
    queryFn: () => apiClient<TransactionsResponse>(`/revenue/transactions?page=${page}&limit=10`),
  });

  // Search users for pay subscription
  const { data: usersData, isLoading: usersLoading } = useQuery<{ data: UserOption[] }>({
    queryKey: ["/api/users/search", userSearchDebounced],
    queryFn: () => apiClient<{ data: UserOption[] }>(`/users?search=${encodeURIComponent(userSearchDebounced)}&limit=20`),
    enabled: userSearchDebounced.length >= 2,
  });

  // Get shops for selected user
  const { data: userShopsData, isLoading: shopsLoading } = useQuery<{ data: ShopOption[] }>({
    queryKey: ["/api/shops/user", selectedUser?._id],
    queryFn: () => apiClient<{ data: ShopOption[] }>(`/shops?ownerid=${selectedUser?._id}&limit=100`),
    enabled: !!selectedUser?._id,
  });

  // Fetch packages
  const { data: packagesData } = useQuery<PackageOption[]>({
    queryKey: ["/api/packages"],
    queryFn: () => apiClient<PackageOption[]>("/packages"),
  });

  const usersList = usersData?.data || [];
  const userShops = userShopsData?.data || [];
  const packages = packagesData || [];

  const handlePayPhoneChange = (value: string) => {
    setPayPhone(value);
    if (value && !isValidKenyanPhone(value)) {
      setPayPhoneError("Enter a valid Kenyan phone number (e.g., 0712345678)");
    } else {
      setPayPhoneError("");
    }
  };

  const handlePaySubscription = async () => {
    if (!selectedUser) {
      toast({ title: "Error", description: "Please select a user", variant: "destructive" });
      return;
    }
    if (selectedShops.length === 0) {
      toast({ title: "Error", description: "Please select at least one shop", variant: "destructive" });
      return;
    }
    if (!selectedPackage) {
      toast({ title: "Error", description: "Please select a package", variant: "destructive" });
      return;
    }
    if (!isValidKenyanPhone(payPhone)) {
      setPayPhoneError("Enter a valid Kenyan phone number");
      return;
    }

    setIsPaySubmitting(true);
    try {
      const result = await apiClient<{ status: boolean; message: string }>("/revenue/pay-subscription", {
        method: "POST",
        body: {
          userId: selectedUser._id,
          shops: selectedShops,
          email: selectedUser.email || "",
          phonenumber: formatKenyanPhone(payPhone),
          package: selectedPackage._id,
          paymentType: "mpesa",
          shop: selectedShops[0],
          amount: selectedPackage.amount,
        },
      });
      if (result.status) {
        toast({ title: "Success", description: result.message || "Payment initiated successfully" });
        setPaySubOpen(false);
        resetPaySubForm();
        refetchTransactions();
      } else {
        toast({ title: "Error", description: result.message || "Payment failed", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Payment failed", variant: "destructive" });
    } finally {
      setIsPaySubmitting(false);
    }
  };

  const resetPaySubForm = () => {
    setUserSearch("");
    setSelectedUser(null);
    setSelectedShops([]);
    setSelectedPackage(null);
    setPayPhone("");
    setPayPhoneError("");
  };

  const toggleShopSelection = (shopId: string) => {
    setSelectedShops(prev => 
      prev.includes(shopId) 
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    );
  };

  const selectAllShops = () => {
    if (selectedShops.length === userShops.length) {
      setSelectedShops([]);
    } else {
      setSelectedShops(userShops.map(s => s._id));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (value && !isValidKenyanPhone(value)) {
      setPhoneError("Enter a valid Kenyan phone number (e.g., 0712345678)");
    } else {
      setPhoneError("");
    }
  };

  const handleWithdraw = async () => {
    if (!isValidKenyanPhone(phoneNumber)) {
      setPhoneError("Enter a valid Kenyan phone number");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (!pin) {
      toast({ title: "Error", description: "Enter your PIN", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const body: Record<string, any> = {
        phonenumber: formatKenyanPhone(phoneNumber),
        amount: parseInt(amount),
        pin,
      };
      if (reinitiateId) {
        body.id = reinitiateId;
      }
      if (transactionId) {
        body.transactionId = transactionId;
      }
      const result = await apiClient<{ status: boolean; message: string }>("/revenue/withdraw", {
        method: "POST",
        body,
      });
      if (result.status) {
        toast({ title: "Success", description: result.message || "Withdrawal request submitted" });
        setWithdrawOpen(false);
        setPhoneNumber("");
        setAmount("");
        setPin("");
        setReinitiateId(null);
        setTransactionId(null);
        refetchTransactions();
      } else {
        toast({ title: "Error", description: result.message || "Withdrawal failed", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Withdrawal failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReinitiate = (tx: Transaction) => {
    // Pre-fill with transaction data
    const phone = tx.affliate?.phonenumber || tx.phoneNumber || "";
    setPhoneNumber(phone);
    setAmount(tx.amount?.toString() || "");
    setPin("");
    setPhoneError("");
    setReinitiateId(tx.affliate?._id || null);
    setTransactionId(tx._id || null);
    setWithdrawOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load revenue stats</p>
      </div>
    );
  }

  const stats = data?.data || {};
  
  const today = stats.today || { count: 0, revenue: 0, shopCount: 0 };
  const yesterday = stats.yesterday || { count: 0, revenue: 0, shopCount: 0 };
  const thisWeek = stats.thisWeek || { count: 0, revenue: 0, shopCount: 0 };
  const thisMonth = stats.thisMonth || { count: 0, revenue: 0, shopCount: 0 };
  const lastMonth = stats.lastMonth || { count: 0, revenue: 0, shopCount: 0 };
  const allTime = stats.allTime || { count: 0, revenue: 0, shopCount: 0 };

  const monthGrowth = lastMonth.revenue > 0 
    ? Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Revenue</h1>
          <p className="text-muted-foreground">Subscription revenue statistics and insights</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={paySubOpen} onOpenChange={(open) => {
            setPaySubOpen(open);
            if (!open) resetPaySubForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-pay-subscription">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Pay for Subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Pay for Subscription</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* User Search */}
                <div className="space-y-2">
                  <Label>Search User</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by username, email or phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9"
                      data-testid="input-user-search"
                    />
                  </div>
                  {usersLoading && userSearchDebounced.length >= 2 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  )}
                  {usersList.length > 0 && !selectedUser && (
                    <ScrollArea className="h-40 border rounded-md">
                      <div className="p-2 space-y-1">
                        {usersList.map((user) => (
                          <div
                            key={user._id}
                            className="p-2 rounded-md cursor-pointer hover:bg-accent"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserSearch(user.username);
                              setPayPhone(user.phone || "");
                              setSelectedShops([]);
                            }}
                          >
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.email} {user.phone ? `• ${user.phone}` : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                  {selectedUser && (
                    <div className="flex items-center justify-between p-2 bg-accent rounded-md">
                      <div>
                        <div className="font-medium">{selectedUser.username}</div>
                        <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(null);
                          setUserSearch("");
                          setSelectedShops([]);
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </div>

                {/* Shops Selection */}
                {selectedUser && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Shops</Label>
                      {userShops.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={selectAllShops}>
                          {selectedShops.length === userShops.length ? "Deselect All" : "Select All"}
                        </Button>
                      )}
                    </div>
                    {shopsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading shops...
                      </div>
                    ) : userShops.length > 0 ? (
                      <ScrollArea className="h-32 border rounded-md">
                        <div className="p-2 space-y-2">
                          {userShops.map((shop) => (
                            <div
                              key={shop._id}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                              onClick={() => toggleShopSelection(shop._id)}
                            >
                              <Checkbox
                                checked={selectedShops.includes(shop._id)}
                                onCheckedChange={() => toggleShopSelection(shop._id)}
                              />
                              <span>{shop.name}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-muted-foreground">No shops found for this user</p>
                    )}
                    {selectedShops.length > 0 && (
                      <p className="text-sm text-muted-foreground">{selectedShops.length} shop(s) selected</p>
                    )}
                  </div>
                )}

                {/* Package Selection */}
                {selectedUser && (
                  <div className="space-y-2">
                    <Label>Select Package</Label>
                    <Select
                      value={selectedPackage?._id || ""}
                      onValueChange={(value) => {
                        const pkg = packages.find(p => p._id === value);
                        setSelectedPackage(pkg || null);
                      }}
                    >
                      <SelectTrigger data-testid="select-package">
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg._id} value={pkg._id}>
                            {pkg.title} - {formatCurrency(pkg.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPackage && (
                      <p className="text-sm text-muted-foreground">
                        Amount: {formatCurrency(selectedPackage.amount)}
                        {selectedPackage.duration && ` • ${selectedPackage.duration} days`}
                      </p>
                    )}
                  </div>
                )}

                {/* Phone Number */}
                {selectedUser && (
                  <div className="space-y-2">
                    <Label htmlFor="pay-phone">Phone Number (M-Pesa)</Label>
                    <Input
                      id="pay-phone"
                      placeholder="0712345678"
                      value={payPhone}
                      onChange={(e) => handlePayPhoneChange(e.target.value)}
                      data-testid="input-pay-phone"
                    />
                    {payPhoneError && (
                      <p className="text-sm text-destructive">{payPhoneError}</p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPaySubOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePaySubscription}
                  disabled={isPaySubmitting || !selectedUser || selectedShops.length === 0 || !selectedPackage || !payPhone || !!payPhoneError}
                  data-testid="button-submit-pay"
                >
                  {isPaySubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Pay Subscription
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={withdrawOpen} onOpenChange={(open) => {
            setWithdrawOpen(open);
            if (!open) {
              setReinitiateId(null);
              setTransactionId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-withdraw">
                <Banknote className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (M-Pesa)</Label>
                <Input
                  id="phone"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  data-testid="input-phone"
                />
                {phoneError && (
                  <p className="text-sm text-destructive">{phoneError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  data-testid="input-pin"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawOpen(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                onClick={handleWithdraw} 
                disabled={isSubmitting || !phoneNumber || !amount || !pin || !!phoneError}
                data-testid="button-submit-withdraw"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Withdraw
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(today.revenue)}
          icon={DollarSign}
          description={`${today.count} subscriptions, ${today.shopCount} shops`}
        />
        <StatCard
          title="This Week"
          value={formatCurrency(thisWeek.revenue)}
          icon={TrendingUp}
          description={`${thisWeek.count} subscriptions, ${thisWeek.shopCount} shops`}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(thisMonth.revenue)}
          icon={CreditCard}
          description={`${thisMonth.count} subscriptions, ${thisMonth.shopCount} shops`}
          trend={monthGrowth}
        />
        <StatCard
          title="All Time"
          value={formatCurrency(allTime.revenue)}
          icon={Users}
          description={`${allTime.count} subscriptions, ${allTime.shopCount} shops`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatCard
          title="Yesterday"
          value={formatCurrency(yesterday.revenue)}
          icon={Calendar}
          description={`${yesterday.count} subscriptions, ${yesterday.shopCount} shops`}
        />
        <StatCard
          title="Last Month"
          value={formatCurrency(lastMonth.revenue)}
          icon={Calendar}
          description={`${lastMonth.count} subscriptions, ${lastMonth.shopCount} shops`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transactionsData?.data || transactionsData?.transactions || []).map((tx) => (
                    <TableRow key={tx._id} data-testid={`row-transaction-${tx._id}`}>
                      <TableCell data-testid={`text-date-${tx._id}`}>
                        {formatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell data-testid={`text-mpesa-${tx._id}`}>
                        {tx.mpesaCode || "-"}
                      </TableCell>
                      <TableCell data-testid={`text-type-${tx._id}`}>
                        {getTypeBadge(tx.type)}
                      </TableCell>
                      <TableCell data-testid={`text-amount-${tx._id}`}>
                        <div className="flex flex-col">
                          {formatTransactionAmount(tx.amount, tx.type)}
                          {tx.type?.toLowerCase() === "withdraw" && tx.balance !== undefined && (
                            <span className="text-xs text-muted-foreground">Bal: {formatCurrency(tx.balance)}</span>
                          )}
                          {tx.type?.toLowerCase() === "subscription" && tx.affliateAmount !== undefined && (
                            <span className="text-xs text-muted-foreground">Comm: {formatCurrency(tx.affliateAmount)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-affiliate-${tx._id}`}>
                        {tx.type?.toLowerCase() === "subscription" ? (
                          tx.user && typeof tx.user === "object" ? (
                            <div className="flex flex-col">
                              <span>{tx.user.name || tx.user.username || "-"}</span>
                              {(tx.user.phonenumber || tx.user.phone) && (
                                <span className="text-xs text-muted-foreground">{tx.user.phonenumber || tx.user.phone}</span>
                              )}
                            </div>
                          ) : "-"
                        ) : (
                          tx.affliate && typeof tx.affliate === "object" ? (
                            <div className="flex flex-col">
                              <span>{tx.affliate.name || "-"}</span>
                              {tx.affliate.phonenumber && (
                                <span className="text-xs text-muted-foreground">{tx.affliate.phonenumber}</span>
                              )}
                            </div>
                          ) : "-"
                        )}
                      </TableCell>
                      <TableCell data-testid={`badge-status-${tx._id}`}>
                        {getStatusBadge(tx.status)}
                      </TableCell>
                      <TableCell>
                        {tx.type?.toLowerCase() === "withdraw" && tx.status === false && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReinitiate(tx)}
                            data-testid={`button-reinitiate-${tx._id}`}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reinitiate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(transactionsData?.data || transactionsData?.transactions || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between gap-2 mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} {transactionsData?.totalPages ? `of ${transactionsData.totalPages}` : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={transactionsData?.totalPages ? page >= transactionsData.totalPages : false}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

export default function RevenuePage() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-4 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <RevenueContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
