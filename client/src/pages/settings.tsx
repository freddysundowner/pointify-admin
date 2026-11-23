import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save, Loader2, Eye, EyeOff, MessageSquare, Bell, Shield, Palette, Mail, Lock, Plus, Trash2, X, ChevronDown, ChevronRight, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SmsSettings {
  SMS_API_KEY: string;
  SMS_END_POINT: string;
  SMS_SHORT_CODE: string;
}

interface EmailSettings {
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  BREVO_SENDER_NAME: string;
}

interface PermissionCategory {
  key: string;
  value: string[];
}

const DEFAULT_PERMISSIONS: PermissionCategory[] = [
  { key: "pos", value: ["set_sale_date", "can_sell", "can_sell_to_dealer_&_wholesaler", "discount", "edit_price"] },
  { key: "stocks", value: ["view_products", "add_products", "view_buying_price", "stock_summary", "view_purchases", "add_purchases", "stock_count", "badstock", "transfer", "return", "delete_purchase_invoice"] },
  { key: "products", value: ["edit", "delete", "add", "adjust_stock", "view_adjustment_history"] },
  { key: "sales", value: ["view_sales", "return", "delete", "view_profit"] },
  { key: "reports", value: ["sales", "dues", "productsales", "discoutedsales", "debtors", "purchases", "expenses", "stocktake", "netprofit", "stockreport", "productmovement", "profitanalysis"] },
  { key: "purchases", value: ["edit_buying_price"] },
  { key: "accounts", value: ["cashflow"] },
  { key: "expenses", value: ["manage"] },
  { key: "suppliers", value: ["manage"] },
  { key: "customers", value: ["manage", "deposit"] },
  { key: "shop", value: ["manage", "switch"] },
  { key: "attendants", value: ["manage", "view"] },
  { key: "usage", value: ["manage"] },
  { key: "support", value: ["manage"] },
  { key: "production", value: ["delete", "change_status", "edit", "adjust_stock", "view_adjustment_history"] },
  { key: "warehouse", value: ["invoice_delete", "show_buying_price", "show_available_stock", "view_buying_price", "create_orders", "view_orders", "return", "accept_warehouse_orders"] },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsEndpoint, setSmsEndpoint] = useState("");
  const [smsShortCode, setSmsShortCode] = useState("");
  const [showSmsApiKey, setShowSmsApiKey] = useState(false);

  const [brevoApiKey, setBrevoApiKey] = useState("");
  const [brevoSenderEmail, setBrevoSenderEmail] = useState("");
  const [brevoSenderName, setBrevoSenderName] = useState("");
  const [showBrevoApiKey, setShowBrevoApiKey] = useState(false);

  const [permissions, setPermissions] = useState<PermissionCategory[]>(DEFAULT_PERMISSIONS);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [newCategoryKey, setNewCategoryKey] = useState("");
  const [addPermissionDialog, setAddPermissionDialog] = useState<{ open: boolean; categoryKey: string }>({ open: false, categoryKey: "" });
  const [newPermissionValue, setNewPermissionValue] = useState("");

  const [themeSettings, setThemeSettings] = useState<Record<string, any>>({});
  const [themeImageFile, setThemeImageFile] = useState<File | null>(null);
  const [themeImagePreview, setThemeImagePreview] = useState<string | null>(null);

  const { data: smsSettings, isLoading: isLoadingSms } = useQuery({
    queryKey: ["/settings/sms"],
    queryFn: () => apiClient<SmsSettings>("/settings/sms"),
    enabled: !!user,
  });

  const { data: emailSettings, isLoading: isLoadingEmail } = useQuery({
    queryKey: ["/settings/email"],
    queryFn: () => apiClient<EmailSettings>("/settings/email"),
    enabled: !!user,
  });

  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["/settings/permissions"],
    queryFn: () => apiClient<{ permissions: PermissionCategory[] }>("/settings/permissions"),
    enabled: !!user,
  });

  const { data: themeData, isLoading: isLoadingTheme } = useQuery({
    queryKey: ["/settings/theme"],
    queryFn: () => apiClient<Record<string, any>>("/settings/theme"),
    enabled: !!user,
  });

  useEffect(() => {
    if (permissionsData?.permissions && permissionsData.permissions.length > 0) {
      setPermissions(permissionsData.permissions);
    }
  }, [permissionsData]);

  useEffect(() => {
    if (themeData && Object.keys(themeData).length > 0) {
      setThemeSettings(themeData);
    }
  }, [themeData]);

  useEffect(() => {
    if (smsSettings) {
      setSmsApiKey(smsSettings.SMS_API_KEY || "");
      setSmsEndpoint(smsSettings.SMS_END_POINT || "");
      setSmsShortCode(smsSettings.SMS_SHORT_CODE || "");
    }
  }, [smsSettings]);

  useEffect(() => {
    if (emailSettings) {
      setBrevoApiKey(emailSettings.BREVO_API_KEY || "");
      setBrevoSenderEmail(emailSettings.BREVO_SENDER_EMAIL || "");
      setBrevoSenderName(emailSettings.BREVO_SENDER_NAME || "");
    }
  }, [emailSettings]);

  const saveSmsMutation = useMutation({
    mutationFn: async (data: SmsSettings) => {
      return apiClient("/settings/sms", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your SMS configuration has been saved securely.",
      });
      queryClient.invalidateQueries({ queryKey: ["/settings/sms"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save settings",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const saveEmailMutation = useMutation({
    mutationFn: async (data: EmailSettings) => {
      return apiClient("/settings/email", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your Brevo email configuration has been saved securely.",
      });
      queryClient.invalidateQueries({ queryKey: ["/settings/email"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save settings",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSaveSms = () => {
    saveSmsMutation.mutate({
      SMS_API_KEY: smsApiKey,
      SMS_END_POINT: smsEndpoint,
      SMS_SHORT_CODE: smsShortCode,
    });
  };

  const handleSaveEmail = () => {
    saveEmailMutation.mutate({
      BREVO_API_KEY: brevoApiKey,
      BREVO_SENDER_EMAIL: brevoSenderEmail,
      BREVO_SENDER_NAME: brevoSenderName,
    });
  };

  const savePermissionsMutation = useMutation({
    mutationFn: async (data: { permissions: PermissionCategory[] }) => {
      return apiClient("/settings/permissions", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Permissions saved",
        description: "Your permission settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/settings/permissions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save permissions",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSavePermissions = () => {
    savePermissionsMutation.mutate({ permissions });
  };

  const toggleCategory = (key: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    if (!newCategoryKey.trim()) return;
    const normalizedKey = newCategoryKey.toLowerCase().replace(/\s+/g, "_");
    if (permissions.some(p => p.key === normalizedKey)) {
      toast({ title: "Category already exists", variant: "destructive" });
      return;
    }
    setPermissions([...permissions, { key: normalizedKey, value: [] }]);
    setNewCategoryKey("");
    setAddCategoryDialog(false);
  };

  const handleDeleteCategory = (key: string) => {
    setPermissions(permissions.filter(p => p.key !== key));
  };

  const handleAddPermission = () => {
    if (!newPermissionValue.trim()) return;
    const normalizedValue = newPermissionValue.toLowerCase().replace(/\s+/g, "_");
    setPermissions(permissions.map(p => {
      if (p.key === addPermissionDialog.categoryKey) {
        if (p.value.includes(normalizedValue)) {
          toast({ title: "Permission already exists", variant: "destructive" });
          return p;
        }
        return { ...p, value: [...p.value, normalizedValue] };
      }
      return p;
    }));
    setNewPermissionValue("");
    setAddPermissionDialog({ open: false, categoryKey: "" });
  };

  const handleDeletePermission = (categoryKey: string, permissionValue: string) => {
    setPermissions(permissions.map(p => {
      if (p.key === categoryKey) {
        return { ...p, value: p.value.filter(v => v !== permissionValue) };
      }
      return p;
    }));
  };

  const handleResetToDefault = () => {
    setPermissions(DEFAULT_PERMISSIONS);
    toast({ title: "Permissions reset to default" });
  };

  const saveThemeMutation = useMutation({
    mutationFn: async ({ data, imageFile }: { data: Record<string, any>; imageFile: File | null }) => {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const sessionId = localStorage.getItem("reggypos_session_id") || "";
      const token = localStorage.getItem("reggypos_token") || "";
      const userData = localStorage.getItem("reggypos_user") || "";

      const response = await fetch('/api/settings/theme/upload', {
        method: 'POST',
        body: formData,
        headers: {
          "X-Session-Id": sessionId,
          "Authorization": token ? `Bearer ${token}` : "",
          "X-User-Data": userData,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || 'Failed to save theme');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Theme saved",
        description: "Your theme settings have been saved successfully.",
      });
      setThemeImageFile(null);
      setThemeImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["/settings/theme"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save theme",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSaveTheme = () => {
    saveThemeMutation.mutate({ data: themeSettings, imageFile: themeImageFile });
  };

  const handleThemeChange = (key: string, value: any) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThemeImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThemeImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Settings</h1>
          <p className="text-muted-foreground">Configure your application settings</p>
        </div>

        <Tabs defaultValue="sms" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sms" data-testid="tab-sms-settings">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" data-testid="tab-email-settings">
              <Mail className="h-4 w-4 mr-2" />
              Email (Brevo)
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications-settings">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security-settings">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" data-testid="tab-appearance-settings">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="permissions" data-testid="tab-permissions-settings">
              <Lock className="h-4 w-4 mr-2" />
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS Configuration
                </CardTitle>
                <CardDescription>
                  Configure your SMS gateway settings for sending bulk messages. These credentials are stored securely.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSms ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sms-api-key">SMS API Key</Label>
                      <div className="relative">
                        <Input
                          id="sms-api-key"
                          type={showSmsApiKey ? "text" : "password"}
                          value={smsApiKey}
                          onChange={(e) => setSmsApiKey(e.target.value)}
                          placeholder="Enter your SMS API key"
                          data-testid="input-sms-api-key"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                          data-testid="button-toggle-sms-api-key"
                        >
                          {showSmsApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sms-endpoint">SMS Endpoint URL</Label>
                      <Input
                        id="sms-endpoint"
                        type="url"
                        value={smsEndpoint}
                        onChange={(e) => setSmsEndpoint(e.target.value)}
                        placeholder="https://api.smsprovider.com/send"
                        data-testid="input-sms-endpoint"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sms-short-code">SMS Short Code / Sender ID</Label>
                      <Input
                        id="sms-short-code"
                        value={smsShortCode}
                        onChange={(e) => setSmsShortCode(e.target.value)}
                        placeholder="REGGYPOS"
                        data-testid="input-sms-short-code"
                      />
                    </div>

                    <Button
                      onClick={handleSaveSms}
                      disabled={saveSmsMutation.isPending}
                      className="w-full"
                      data-testid="button-save-sms-settings"
                    >
                      {saveSmsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save SMS Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Brevo Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Brevo (formerly Sendinblue) email settings for sending bulk emails. Get your API key from{" "}
                  <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Brevo Dashboard
                  </a>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingEmail ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="brevo-api-key">Brevo API Key</Label>
                      <div className="relative">
                        <Input
                          id="brevo-api-key"
                          type={showBrevoApiKey ? "text" : "password"}
                          value={brevoApiKey}
                          onChange={(e) => setBrevoApiKey(e.target.value)}
                          placeholder="xkeysib-xxxxxxxxxxxx..."
                          data-testid="input-brevo-api-key"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowBrevoApiKey(!showBrevoApiKey)}
                          data-testid="button-toggle-brevo-api-key"
                        >
                          {showBrevoApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brevo-sender-email">Sender Email Address</Label>
                      <Input
                        id="brevo-sender-email"
                        type="email"
                        value={brevoSenderEmail}
                        onChange={(e) => setBrevoSenderEmail(e.target.value)}
                        placeholder="noreply@yourcompany.com"
                        data-testid="input-brevo-sender-email"
                      />
                      <p className="text-xs text-muted-foreground">
                        This email must be verified in your Brevo account
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brevo-sender-name">Sender Name</Label>
                      <Input
                        id="brevo-sender-name"
                        value={brevoSenderName}
                        onChange={(e) => setBrevoSenderName(e.target.value)}
                        placeholder="ReggyPOS"
                        data-testid="input-brevo-sender-name"
                      />
                    </div>

                    <Button
                      onClick={handleSaveEmail}
                      disabled={saveEmailMutation.isPending}
                      className="w-full"
                      data-testid="button-save-email-settings"
                    >
                      {saveEmailMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Email Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications and alerts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Notification settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Security settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Settings
                </CardTitle>
                <CardDescription>
                  Customize the app theme colors and appearance for the mobile app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingTheme ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Theme Logo / Image</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                          {themeImagePreview ? (
                            <img src={themeImagePreview} alt="Theme preview" className="w-full h-full object-cover" />
                          ) : themeSettings.image ? (
                            <img src={`https://sandbox.yourdomain.com${themeSettings.image}`} alt="Current theme" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Upload a logo or image for the app theme</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="APP_NAME">App Name</Label>
                      <Input
                        id="APP_NAME"
                        type="text"
                        value={themeSettings.APP_NAME || ""}
                        onChange={(e) => handleThemeChange("APP_NAME", e.target.value)}
                        placeholder="ReggyPOS"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="APP_SLOGAN">App Slogan</Label>
                      <Input
                        id="APP_SLOGAN"
                        type="text"
                        value={themeSettings.APP_SLOGAN || ""}
                        onChange={(e) => handleThemeChange("APP_SLOGAN", e.target.value)}
                        placeholder="Enterprise in your hands"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="PRIMARY_COLOR">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="PRIMARY_COLOR"
                          type="color"
                          value={themeSettings.PRIMARY_COLOR || "#3b82f6"}
                          onChange={(e) => handleThemeChange("PRIMARY_COLOR", e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={themeSettings.PRIMARY_COLOR || "#3b82f6"}
                          onChange={(e) => handleThemeChange("PRIMARY_COLOR", e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="SECONDARY_COLOR">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="SECONDARY_COLOR"
                          type="color"
                          value={themeSettings.SECONDARY_COLOR || "#64748b"}
                          onChange={(e) => handleThemeChange("SECONDARY_COLOR", e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={themeSettings.SECONDARY_COLOR || "#64748b"}
                          onChange={(e) => handleThemeChange("SECONDARY_COLOR", e.target.value)}
                          placeholder="#64748b"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="BUTTON_COLOR">Button Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="BUTTON_COLOR"
                          type="color"
                          value={themeSettings.BUTTON_COLOR || "#3b82f6"}
                          onChange={(e) => handleThemeChange("BUTTON_COLOR", e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={themeSettings.BUTTON_COLOR || "#3b82f6"}
                          onChange={(e) => handleThemeChange("BUTTON_COLOR", e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="TEXT_COLOR">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="TEXT_COLOR"
                          type="color"
                          value={themeSettings.TEXT_COLOR || "#000000"}
                          onChange={(e) => handleThemeChange("TEXT_COLOR", e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={themeSettings.TEXT_COLOR || "#000000"}
                          onChange={(e) => handleThemeChange("TEXT_COLOR", e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveTheme}
                      disabled={saveThemeMutation.isPending}
                      className="w-full mt-4"
                      data-testid="button-save-theme"
                    >
                      {saveThemeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Theme Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Attendant Permissions
                </CardTitle>
                <CardDescription>
                  Manage permission categories and their values for the mobile app. These permissions control what attendants can do in the Flutter app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPermissions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 mb-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setAddCategoryDialog(true)}
                        data-testid="button-add-category"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleResetToDefault}
                        data-testid="button-reset-permissions"
                      >
                        Reset to Default
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {permissions.map((category) => (
                        <Collapsible
                          key={category.key}
                          open={expandedCategories.has(category.key)}
                          onOpenChange={() => toggleCategory(category.key)}
                        >
                          <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/50">
                            <CollapsibleTrigger className="flex items-center gap-2 flex-1 hover:text-primary">
                              {expandedCategories.has(category.key) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="font-medium uppercase">{category.key.replace(/_/g, " ")}</span>
                              <Badge variant="secondary" className="ml-2">{category.value.length}</Badge>
                            </CollapsibleTrigger>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddPermissionDialog({ open: true, categoryKey: category.key });
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category.key);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CollapsibleContent className="pl-8 py-2">
                            <div className="flex flex-wrap gap-2">
                              {category.value.map((permission) => (
                                <Badge 
                                  key={permission} 
                                  variant="outline" 
                                  className="flex items-center gap-1 py-1.5 px-3"
                                >
                                  {permission.replace(/_/g, " ")}
                                  <button
                                    onClick={() => handleDeletePermission(category.key, permission)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                              {category.value.length === 0 && (
                                <span className="text-muted-foreground text-sm">No permissions defined</span>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>

                    <Button
                      onClick={handleSavePermissions}
                      disabled={savePermissionsMutation.isPending}
                      className="w-full mt-4"
                      data-testid="button-save-permissions"
                    >
                      {savePermissionsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Permissions
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategoryKey}
                  onChange={(e) => setNewCategoryKey(e.target.value)}
                  placeholder="e.g., inventory, billing"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCategoryDialog(false)}>Cancel</Button>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addPermissionDialog.open} onOpenChange={(open) => setAddPermissionDialog({ open, categoryKey: open ? addPermissionDialog.categoryKey : "" })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Permission to "{addPermissionDialog.categoryKey.replace(/_/g, " ")}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="permission-value">Permission Name</Label>
                <Input
                  id="permission-value"
                  value={newPermissionValue}
                  onChange={(e) => setNewPermissionValue(e.target.value)}
                  placeholder="e.g., view, edit, delete"
                  onKeyDown={(e) => e.key === "Enter" && handleAddPermission()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddPermissionDialog({ open: false, categoryKey: "" })}>Cancel</Button>
              <Button onClick={handleAddPermission}>Add Permission</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
