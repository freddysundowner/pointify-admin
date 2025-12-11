import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Loader2, Package, ChevronLeft, ChevronRight, X, Filter } from "lucide-react";
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
import type { Product, ProductCategory } from "@shared/schema";

interface ProductsResponse {
  data: Product[];
  count: number;
  totalPages: number;
  currentPage: number;
}

interface Filters {
  shop: string;
  barcode: string;
  expiryDate: string;
  supplier: string;
}

const defaultFilters: Filters = {
  shop: "",
  barcode: "",
  expiryDate: "",
  supplier: "",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const updateFilter = (key: keyof Filters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearch("");
    setSearchDebounced("");
    setPage(1);
  };

  const hasActiveFilters = filters.shop || filters.barcode || filters.expiryDate || filters.supplier || searchDebounced;

  const [formData, setFormData] = useState({
    name: "",
    buyingPrice: "",
    sellingPrice: "",
    quantity: "",
    reorderLevel: "",
    productCategoryId: "",
    description: "",
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "10");
    if (searchDebounced) params.set("name", searchDebounced);
    if (filters.shop) params.set("shop", filters.shop);
    if (filters.barcode) params.set("barcode", filters.barcode);
    if (filters.expiryDate) params.set("expiryDate", filters.expiryDate);
    if (filters.supplier) params.set("supplier", filters.supplier);
    return params.toString();
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["/products", page, searchDebounced, filters.shop, filters.barcode, filters.expiryDate, filters.supplier],
    queryFn: () => apiClient<ProductsResponse>(`/products?${buildQueryString()}`),
    enabled: !!user,
    staleTime: 0,
  });

  const products = productsData?.data || [];
  const totalPages = productsData?.totalPages || 1;
  const totalCount = productsData?.count || 0;

  const { data: categoriesData } = useQuery({
    queryKey: ["/categories"],
    queryFn: () => apiClient<{ data: ProductCategory[] }>("/categories"),
    enabled: !!user,
  });

  const categories = categoriesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient("/products", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/products", "all", page] });
      queryClient.invalidateQueries({ queryKey: ["/products", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/stats"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "Product created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/products/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/products", "all", page] });
      queryClient.invalidateQueries({ queryKey: ["/products", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/stats"] });
      setEditProduct(null);
      resetForm();
      toast({ title: "Product updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/products", "all", page] });
      queryClient.invalidateQueries({ queryKey: ["/products", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/stats"] });
      setDeleteProduct(null);
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      buyingPrice: "",
      sellingPrice: "",
      quantity: "",
      reorderLevel: "",
      productCategoryId: "",
      description: "",
    });
  };

  const openEdit = (product: Product) => {
    setFormData({
      name: product.name,
      buyingPrice: product.buyingPrice?.toString() || "",
      sellingPrice: product.sellingPrice?.toString() || "",
      quantity: product.quantity?.toString() || "",
      reorderLevel: product.reorderLevel?.toString() || "",
      productCategoryId: typeof product.productCategoryId === "string" ? product.productCategoryId : product.productCategoryId?._id || "",
      description: product.description || "",
    });
    setEditProduct(product);
  };

  const handleSubmit = () => {
    const payload = {
      name: formData.name,
      buyingPrice: parseFloat(formData.buyingPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      quantity: parseInt(formData.quantity) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 0,
      productCategoryId: formData.productCategoryId || undefined,
      description: formData.description || undefined,
    };

    if (editProduct) {
      updateMutation.mutate({ id: editProduct._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };


  const getStockBadge = (product: Product) => {
    if (product.quantity <= 0) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    }
    if (product.quantity <= product.reorderLevel) {
      return <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Low Stock</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">{product.quantity} in stock</Badge>;
  };

  return (
    <DashboardLayout title="Products">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-products"
              />
            </div>
            <Button onClick={() => setIsAddOpen(true)} data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters:</span>
            </div>
            
            <Input
              placeholder="Shop name..."
              value={filters.shop}
              onChange={(e) => updateFilter("shop", e.target.value)}
              className="w-[140px]"
              data-testid="input-filter-shop"
            />

            <Input
              placeholder="Barcode..."
              value={filters.barcode}
              onChange={(e) => updateFilter("barcode", e.target.value)}
              className="w-[140px]"
              data-testid="input-filter-barcode"
            />

            <Input
              placeholder="Supplier..."
              value={filters.supplier}
              onChange={(e) => updateFilter("supplier", e.target.value)}
              className="w-[140px]"
              data-testid="input-filter-supplier"
            />

            <Input
              type="date"
              placeholder="Expiry Date"
              value={filters.expiryDate}
              onChange={(e) => updateFilter("expiryDate", e.target.value)}
              className="w-[150px]"
              data-testid="input-filter-expiry"
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead className="text-right">Buying Price</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id} data-testid={`row-product-${product._id}`}>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {typeof product.attendantId === "object" && product.attendantId?.username && (
                              <div>Added by: {product.attendantId.username}</div>
                            )}
                            {product.date && (
                              <div>{new Date(product.date).toLocaleString()}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {typeof product.shopId === "object" ? product.shopId?.name : product.shopId || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{product.barcode}</TableCell>
                        <TableCell className="text-right">{product.buyingPrice?.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{product.sellingPrice?.toLocaleString()}</TableCell>
                        <TableCell>{getStockBadge(product)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(product)}
                              data-testid={`button-edit-${product._id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteProduct(product)}
                              data-testid={`button-delete-${product._id}`}
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
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No products found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {hasActiveFilters ? "Try adjusting your filters" : "Get started by adding your first product"}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 pt-4 border-t mt-4">
                <span className="text-sm text-muted-foreground">
                  {totalCount.toLocaleString()} products total
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

      <Dialog open={isAddOpen || !!editProduct} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setEditProduct(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                data-testid="input-product-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buying Price</Label>
                <Input
                  type="number"
                  value={formData.buyingPrice}
                  onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                  placeholder="0"
                  data-testid="input-buying-price"
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0"
                  data-testid="input-selling-price"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  data-testid="input-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  placeholder="0"
                  data-testid="input-reorder-level"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.productCategoryId}
                onValueChange={(value) => setFormData({ ...formData, productCategoryId: value })}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                data-testid="input-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditProduct(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-product"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct._id)}
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
