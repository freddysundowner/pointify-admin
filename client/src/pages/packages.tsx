import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Zap,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { queryClient } from "@/lib/queryClient";
import type { Package as PackageType } from "@shared/schema";

const ADMIN_ID = "66b1dc3d77b506e6e9274965";

const packageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  durationValue: z.coerce.number().min(1, "Duration must be at least 1"),
  durationUnit: z.enum(["days", "weeks", "months", "years"]),
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  amountusd: z.coerce.number().min(0, "USD amount must be 0 or more"),
  newTitle: z.string().optional(),
  newAmount: z.coerce.number().min(0).optional(),
  newAmountusd: z.coerce.number().min(0).optional(),
  newMaxShops: z.coerce.number().min(0).optional(),
  newDurationValue: z.coerce.number().min(0).optional(),
  newDurationUnit: z.enum(["days", "weeks", "months", "years"]).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  type: z.enum(["trial", "production"]),
  status: z.boolean(),
  sync: z.boolean().optional(),
  order: z.coerce.number().optional(),
  maxShops: z.coerce.number().optional(),
  features: z.array(z.string()),
});

type PackageFormValues = z.infer<typeof packageSchema>;

function formatDuration(value: number, unit: string) {
  return `${value} ${value === 1 ? unit.replace(/s$/, "") : unit}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

function EditPackageDialog({
  pkg,
  open,
  onOpenChange,
}: {
  pkg: PackageType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [featureInput, setFeatureInput] = useState("");

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      title: pkg.title || "",
      description: pkg.description || "",
      durationValue: pkg.durationValue,
      durationUnit: pkg.durationUnit,
      amount: pkg.amount,
      amountusd: pkg.amountusd,
      newTitle: pkg.newTitle ?? "",
      newAmount: pkg.newAmount ?? 0,
      newAmountusd: pkg.newAmountusd ?? 0,
      newMaxShops: pkg.newMaxShops ?? undefined,
      newDurationValue: pkg.newDurationValue ?? undefined,
      newDurationUnit: pkg.newDurationUnit ?? undefined,
      discount: pkg.discount ?? undefined,
      type: pkg.type,
      status: pkg.status,
      sync: pkg.sync ?? false,
      order: pkg.order ?? undefined,
      maxShops: pkg.maxShops ?? undefined,
      features: pkg.features ?? [],
    },
  });

  const features = form.watch("features");

  const mutation = useMutation({
    mutationFn: (values: PackageFormValues) =>
      apiClient(`/packages/${pkg._id}`, { method: "PUT", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages", ADMIN_ID] });
      toast({ title: "Package updated", description: "Changes saved successfully." });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  function addFeature() {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      form.setValue("features", [...features, trimmed]);
    }
    setFeatureInput("");
  }

  function removeFeature(index: number) {
    form.setValue("features", features.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit Package
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-5"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Basic Plan" data-testid="input-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Title */}
            <FormField
              control={form.control}
              name="newTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Updated Plan Name"
                      data-testid="input-new-title"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short description of this package"
                      rows={2}
                      data-testid="input-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        data-testid="input-duration-value"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-duration-unit">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* New Duration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="newDurationValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Duration</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 30"
                        data-testid="input-new-duration-value"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newDurationUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Duration Unit</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-new-duration-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        data-testid="input-amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountusd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        data-testid="input-amountusd"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* New Amounts + New Max Shops */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="newAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Amount (KES)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        data-testid="input-new-amount"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newAmountusd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Amount (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        data-testid="input-new-amountusd"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newMaxShops"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Max Shops</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Unlimited"
                        data-testid="input-new-maxshops"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Discount & Max Shops */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        data-testid="input-discount"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxShops"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Shops</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Unlimited"
                        data-testid="input-maxshops"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Type & Order */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 1"
                        data-testid="input-order"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status & Sync */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-sm font-medium">Active</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Make this package visible and available to users
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-status"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sync"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-sm font-medium">Sync</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Keep this package synchronised across connected systems
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="switch-sync"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature and press Enter"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  data-testid="input-feature"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addFeature}
                  data-testid="button-add-feature"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {features.map((f, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                      data-testid={`badge-feature-${i}`}
                    >
                      {f}
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                        data-testid={`button-remove-feature-${i}`}
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-save"
              >
                {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function PackagesPage() {
  const [search, setSearch] = useState("");
  const [editingPkg, setEditingPkg] = useState<PackageType | null>(null);

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
  const trial = packages.filter((p) => p.type === "trial").length;
  const production = packages.filter((p) => p.type === "production").length;

  return (
    <DashboardLayout title="Packages">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-12" /> : (
                <p className="text-2xl font-bold" data-testid="stat-total">{total}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-12" /> : (
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-active">{active}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Trial</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-12" /> : (
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-trial">{trial}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Production</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-12" /> : (
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
                    <TableRow
                      key={pkg._id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setEditingPkg(pkg)}
                      data-testid={`row-package-${pkg._id}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{pkg.title || pkg.name}</p>
                            {pkg.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {pkg.description}
                              </p>
                            )}
                          </div>
                          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.type === "trial" ? "secondary" : "default"}
                          className="capitalize flex items-center gap-1 w-fit"
                        >
                          {pkg.type === "trial" ? <Clock className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
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
                              <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                            ))}
                            {pkg.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{pkg.features.length - 3}</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pkg.status ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground text-sm">
                            <XCircle className="h-4 w-4" /> Inactive
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

      {editingPkg && (
        <EditPackageDialog
          pkg={editingPkg}
          open={!!editingPkg}
          onOpenChange={(open) => { if (!open) setEditingPkg(null); }}
        />
      )}
    </DashboardLayout>
  );
}
