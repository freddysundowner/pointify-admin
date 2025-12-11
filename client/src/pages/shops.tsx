import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Loader2, Store, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Link } from "wouter";
import type { Shop } from "@shared/schema";

interface ShopsResponse {
  data: Shop[];
  count: number;
  totalPages: number;
  currentPage: number;
}

interface Affiliate {
  _id: string;
  name: string;
  username?: string;
  email?: string;
}

interface AffiliatesResponse {
  data: Affiliate[];
}

export default function ShopsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [ownerIdDebounced, setOwnerIdDebounced] = useState("");
  const [affiliateName, setAffiliateName] = useState("");
  const [affiliateNameDebounced, setAffiliateNameDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [deleteShop, setDeleteShop] = useState<Shop | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOwnerIdDebounced(ownerId);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [ownerId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAffiliateNameDebounced(affiliateName);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [affiliateName]);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    currency: "KES",
    contact: "",
    tax: "",
    allowOnlineSelling: false,
    production: false,
    affliate: "none",
  });

  const { data: affiliatesData } = useQuery({
    queryKey: ["/affiliates"],
    queryFn: () => apiClient<AffiliatesResponse>("/affiliates"),
    enabled: !!user,
  });

  const affiliates = affiliatesData?.data || [];

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "10");
    if (searchDebounced) params.set("name", searchDebounced);
    if (ownerIdDebounced) params.set("ownerid", ownerIdDebounced);
    if (affiliateNameDebounced) params.set("affliatename", affiliateNameDebounced);
    return params.toString();
  };

  const { data: shopsData, isLoading } = useQuery({
    queryKey: ["/shops", page, searchDebounced, ownerIdDebounced, affiliateNameDebounced],
    queryFn: () => apiClient<ShopsResponse>(`/shops?${buildQueryString()}`),
    enabled: !!user,
    staleTime: 0,
  });

  const shops = shopsData?.data || [];
  const totalPages = shopsData?.totalPages || 1;
  const totalCount = shopsData?.count || 0;

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient("/shops", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/shops"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "Shop created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create shop", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/shops/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/shops"] });
      setEditShop(null);
      resetForm();
      toast({ title: "Shop updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update shop", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/shops/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/shops"] });
      setDeleteShop(null);
      toast({ title: "Shop deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete shop", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      currency: "KES",
      contact: "",
      tax: "",
      allowOnlineSelling: false,
      production: false,
      affliate: "none",
    });
  };

  const openEdit = (shop: Shop) => {
    setFormData({
      name: shop.name,
      address: shop.address || "",
      currency: shop.currency || "KES",
      contact: shop.contact || "",
      tax: shop.tax?.toString() || "",
      allowOnlineSelling: shop.allowOnlineSelling || false,
      production: shop.production || false,
      affliate: (shop as any).affliate?._id || "none",
    });
    setEditShop(shop);
  };

  const handleSubmit = () => {
    const payload = {
      name: formData.name,
      address: formData.address || undefined,
      currency: formData.currency || undefined,
      contact: formData.contact || undefined,
      tax: formData.tax ? parseFloat(formData.tax) : undefined,
      allowOnlineSelling: formData.allowOnlineSelling,
      production: formData.production,
      affliate: formData.affliate && formData.affliate !== "none" ? formData.affliate : undefined,
    };

    if (editShop) {
      updateMutation.mutate({ id: editShop._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getSubscriptionBadge = (shop: Shop) => {
    if (!shop.subscription) {
      return <Badge variant="secondary" className="text-xs">No Subscription</Badge>;
    }
    const sub = shop.subscription as any;
    const endDate = sub.endDate || sub.expiryDate;
    const packageTitle = sub.packageId?.title || sub.type || "Unknown";
    
    if (!endDate) {
      return <Badge variant="secondary" className="text-xs">{packageTitle}</Badge>;
    }
    
    const expiry = new Date(endDate);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (expiry < now) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>;
    }
    if (daysLeft <= 7) {
      return <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{packageTitle} - {daysLeft}d left</Badge>;
    }
    return <Badge variant="default" className="text-xs">{packageTitle} - {daysLeft}d</Badge>;
  };

  return (
    <DashboardLayout title="Shops">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shops..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-shops"
                />
              </div>
              <Input
                placeholder="Owner ID"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-36"
                data-testid="input-filter-ownerid"
              />
              <Input
                placeholder="Affiliate Name"
                value={affiliateName}
                onChange={(e) => setAffiliateName(e.target.value)}
                className="w-36"
                data-testid="input-filter-affiliate"
              />
              {(search || ownerId || affiliateName) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearch("");
                    setOwnerId("");
                    setAffiliateName("");
                  }}
                  data-testid="button-clear-filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={() => setIsAddOpen(true)} data-testid="button-add-shop">
              <Plus className="h-4 w-4 mr-2" />
              Add Shop
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Shops</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : shops && shops.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shops.map((shop) => (
                      <TableRow key={shop._id} data-testid={`row-shop-${shop._id}`}>
                        <TableCell>
                          <div className="font-medium">{shop.name}</div>
                          <div className="text-xs text-muted-foreground">{shop.address || "-"}</div>
                          <div className="text-xs text-muted-foreground">
                            {shop.createAt ? new Date(shop.createAt).toLocaleDateString() : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {shop.contact || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {shop.currency || "KES"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {(shop as any).affliate?.name || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {(shop.subscription as any)?.packageId?.title || "-"}
                        </TableCell>
                        <TableCell>{getSubscriptionBadge(shop)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link href={`/shops/${shop._id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-view-${shop._id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(shop)}
                              data-testid={`button-edit-${shop._id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteShop(shop)}
                              data-testid={`button-delete-${shop._id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No shops found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchDebounced ? "Try adjusting your search" : "Get started by adding your first shop"}
                </p>
                {searchDebounced ? (
                  <Button variant="outline" onClick={() => { setSearch(""); setSearchDebounced(""); }}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                ) : (
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shop
                  </Button>
                )}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 pt-4 border-t mt-4">
                <span className="text-sm text-muted-foreground">
                  {totalCount.toLocaleString()} shops total
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

      <Dialog open={isAddOpen || !!editShop} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setEditShop(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editShop ? "Edit Shop" : "Add Shop"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Shop name"
                data-testid="input-shop-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Shop address"
                data-testid="input-shop-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="KES"
                  data-testid="input-shop-currency"
                />
              </div>
              <div className="space-y-2">
                <Label>Tax (%)</Label>
                <Input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  placeholder="0"
                  data-testid="input-shop-tax"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Phone or email"
                data-testid="input-shop-contact"
              />
            </div>
            <div className="space-y-2">
              <Label>Affiliate</Label>
              <Select
                value={formData.affliate}
                onValueChange={(value) => setFormData({ ...formData, affliate: value })}
              >
                <SelectTrigger data-testid="select-shop-affiliate">
                  <SelectValue placeholder="Select an affiliate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {affiliates.map((affiliate) => (
                    <SelectItem key={affiliate._id} value={affiliate._id}>
                      {affiliate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="online-selling">Allow Online Selling</Label>
              <Switch
                id="online-selling"
                checked={formData.allowOnlineSelling}
                onCheckedChange={(checked) => setFormData({ ...formData, allowOnlineSelling: checked })}
                data-testid="switch-online-selling"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="production">Production Mode</Label>
              <Switch
                id="production"
                checked={formData.production}
                onCheckedChange={(checked) => setFormData({ ...formData, production: checked })}
                data-testid="switch-production"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditShop(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !formData.name}
              data-testid="button-save-shop"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editShop ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteShop} onOpenChange={(open) => !open && setDeleteShop(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteShop?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteShop && deleteMutation.mutate(deleteShop._id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
