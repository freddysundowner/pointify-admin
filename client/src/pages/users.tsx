import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, ChevronLeft, ChevronRight, Eye, Store, ArrowLeft, MoreHorizontal, KeyRound, Trash2, Pencil } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/dashboard-layout";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

interface UserShop {
  _id: string;
  name: string;
  address?: string;
  sync?: boolean;
}

interface User {
  _id: string;
  username?: string;
  email?: string;
  phonenumber?: string;
  phone?: string;
  role?: string;
  type?: string;
  status?: string;
  primaryShop?: UserShop[] | string;
  shops?: UserShop[];
  shopCount?: number;
  shopId?: {
    _id: string;
    name: string;
  } | string;
  shop?: {
    _id: string;
    name: string;
  } | string;
  createdAt?: string;
  lastLogin?: string;
  last_seen?: string;
  autoPrint?: boolean;
  permissions?: string[] | null;
  platform?: string;
  app_version?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface UsersResponse {
  data: User[];
  count: number;
  totalPages: number;
  currentPage: number;
}

interface Shop {
  _id: string;
  name: string;
}

interface ShopsResponse {
  data: Shop[];
}

export default function UsersPage() {
  const { user } = useAuth();
  
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [shopId, setShopId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ 
    username: "", 
    email: "", 
    phone: "",
    status: "",
    emailVerified: false,
    phoneVerified: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/users", page, searchDebounced, shopId],
    queryFn: () => {
      let url = `/users?page=${page}&limit=10`;
      if (searchDebounced) url += `&search=${encodeURIComponent(searchDebounced)}`;
      if (shopId) url += `&shopId=${encodeURIComponent(shopId)}`;
      return apiClient<UsersResponse>(url);
    },
    enabled: !!user,
  });

  const { data: shopsData } = useQuery({
    queryKey: ["/api/shops", "all"],
    queryFn: () => apiClient<ShopsResponse>("/shops?page=1&limit=100"),
    enabled: !!user,
  });

  const users = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;
  const totalCount = usersData?.count || 0;
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

  const getShopName = (u: User): string => {
    if (u.primaryShop && Array.isArray(u.primaryShop) && u.primaryShop.length > 0 && u.primaryShop[0].name) {
      return u.primaryShop[0].name;
    }
    if (typeof u.primaryShop === 'string') {
      return u.primaryShop;
    }
    if (u.shopId && typeof u.shopId === 'object' && u.shopId.name) {
      return u.shopId.name;
    }
    if (u.shop && typeof u.shop === 'object' && u.shop.name) {
      return u.shop.name;
    }
    return "-";
  };

  const getShopsCount = (u: User): number => {
    if (u.shopCount !== undefined) return u.shopCount;
    if (u.shops && Array.isArray(u.shops)) return u.shops.length;
    if (u.primaryShop && Array.isArray(u.primaryShop)) return u.primaryShop.length;
    return 0;
  };

  const getUserShops = (u: User): UserShop[] => {
    if (u.shops && Array.isArray(u.shops)) return u.shops;
    if (u.primaryShop && Array.isArray(u.primaryShop)) return u.primaryShop;
    return [];
  };

  const getLastSeen = (u: User): string => {
    return u.last_seen || u.lastLogin || "";
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return;
    
    setIsResetting(true);
    try {
      await apiClient(`/users/${resetPasswordUser._id}/reset-password`, {
        method: "POST",
        body: { password: newPassword },
      });
      toast({ title: "Success", description: "Password reset successfully" });
      setResetPasswordUser(null);
      setNewPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to reset password", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    
    setIsDeleting(true);
    try {
      await apiClient(`/users/${deleteUser._id}`, {
        method: "DELETE",
      });
      toast({ title: "Success", description: "User deleted successfully" });
      setDeleteUser(null);
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (u: User) => {
    setEditUser(u);
    setEditForm({
      username: u.username || "",
      email: u.email || "",
      phone: u.phonenumber || u.phone || "",
      status: u.status || "",
      emailVerified: u.emailVerified || false,
      phoneVerified: u.phoneVerified || false,
    });
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    
    setIsEditing(true);
    try {
      await apiClient(`/users/${editUser._id}`, {
        method: "PUT",
        body: editForm,
      });
      toast({ title: "Success", description: "User updated successfully" });
      setEditUser(null);
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update user", variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    switch (status.toLowerCase()) {
      case "online":
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Online</Badge>;
      case "offline":
        return <Badge variant="secondary">Offline</Badge>;
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Active</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (selectedUser) {
    const userShops = getUserShops(selectedUser);
    return (
      <DashboardLayout title="User Details">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedUser(null)}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-user-name">
                {selectedUser.username || selectedUser.email || "User Details"}
              </h1>
              <p className="text-sm text-muted-foreground">User information and shops</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{selectedUser.username || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phonenumber || selectedUser.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(selectedUser.createdAt || "")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Seen</p>
                    <p className="font-medium">{formatDate(getLastSeen(selectedUser))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platform</p>
                    <p className="font-medium">{selectedUser.platform || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">App Version</p>
                    <p className="font-medium">{selectedUser.app_version || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email Verified</p>
                    <p className="font-medium">{selectedUser.emailVerified ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Verified</p>
                    <p className="font-medium">{selectedUser.phoneVerified ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Auto Print</p>
                    <p className="font-medium">{selectedUser.autoPrint ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shops Count</p>
                    <p className="font-medium">{getShopsCount(selectedUser)}</p>
                  </div>
                </div>
                {selectedUser.permissions && selectedUser.permissions.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedUser.permissions.map((perm, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{perm}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  User Shops
                  <Badge variant="secondary" className="ml-2">{userShops.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userShops.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No shops found for this user
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userShops.map((shop) => (
                      <div
                        key={shop._id}
                        className="flex items-center justify-between p-3 rounded-md border"
                        data-testid={`shop-item-${shop._id}`}
                      >
                        <div>
                          <p className="font-medium">{shop.name}</p>
                          {shop.address && (
                            <p className="text-sm text-muted-foreground">{shop.address}</p>
                          )}
                        </div>
                        {shop.sync !== undefined && (
                          <Badge variant={shop.sync ? "default" : "secondary"}>
                            {shop.sync ? "Synced" : "Not Synced"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Users">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">Users</h1>
            <p className="text-sm text-muted-foreground">Manage system users</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users
                {totalCount > 0 && (
                  <Badge variant="secondary" className="ml-2">{totalCount}</Badge>
                )}
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-[200px]"
                    data-testid="input-search-users"
                  />
                </div>
                <Select value={shopId} onValueChange={(val) => { setShopId(val === "all" ? "" : val); setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-shop-filter">
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
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load users
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Shops Count</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u._id} data-testid={`row-user-${u._id}`}>
                          <TableCell className="font-medium" data-testid={`text-username-${u._id}`}>
                            {u.username || "-"}
                          </TableCell>
                          <TableCell data-testid={`text-email-${u._id}`}>
                            {u.email || "-"}
                          </TableCell>
                          <TableCell data-testid={`text-phone-${u._id}`}>
                            {u.phonenumber || u.phone || "-"}
                          </TableCell>
                          <TableCell data-testid={`text-shop-${u._id}`}>
                            {getShopName(u)}
                          </TableCell>
                          <TableCell data-testid={`text-shopcount-${u._id}`}>
                            <Badge variant="secondary">{getShopsCount(u)}</Badge>
                          </TableCell>
                          <TableCell data-testid={`text-lastseen-${u._id}`}>
                            {formatDate(getLastSeen(u))}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  data-testid={`button-actions-${u._id}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setSelectedUser(u)}
                                  data-testid={`menu-view-${u._id}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(u)}
                                  data-testid={`menu-edit-${u._id}`}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setResetPasswordUser(u)}
                                  data-testid={`menu-reset-password-${u._id}`}
                                >
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteUser(u)}
                                  className="text-destructive"
                                  data-testid={`menu-delete-${u._id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
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
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
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

        <Dialog open={!!resetPasswordUser} onOpenChange={(open) => {
          if (!open) {
            setResetPasswordUser(null);
            setNewPassword("");
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Reset password for <span className="font-medium">{resetPasswordUser?.username || resetPasswordUser?.email || "this user"}</span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setResetPasswordUser(null);
                  setNewPassword("");
                }}
                data-testid="button-cancel-reset"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={isResetting || !newPassword}
                data-testid="button-confirm-reset"
              >
                {isResetting ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteUser} onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-medium">{deleteUser?.username || deleteUser?.email || "this user"}</span>? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteUser(null)}
                data-testid="button-cancel-delete"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                data-testid="button-confirm-delete"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editUser} onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  placeholder="Enter username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  data-testid="input-edit-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  data-testid="input-edit-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  placeholder="Enter phone number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  data-testid="input-edit-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editForm.status} 
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-email-verified">Email Verified</Label>
                <Switch
                  id="edit-email-verified"
                  checked={editForm.emailVerified}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, emailVerified: checked })}
                  data-testid="switch-edit-email-verified"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-phone-verified">Phone Verified</Label>
                <Switch
                  id="edit-phone-verified"
                  checked={editForm.phoneVerified}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, phoneVerified: checked })}
                  data-testid="switch-edit-phone-verified"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditUser(null)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditUser}
                disabled={isEditing}
                data-testid="button-confirm-edit"
              >
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
