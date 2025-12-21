import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save, Loader2, Eye, EyeOff, MessageSquare, Bell, Shield, Palette, Mail } from "lucide-react";
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
                        placeholder="POINTIFY"
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
                        placeholder="Pointify POS"
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
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Appearance settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
