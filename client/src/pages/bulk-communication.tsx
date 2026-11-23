import { useState, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Loader2, 
  Users,
  AlertCircle,
  CheckCircle2,
  FileText,
  Save,
  Trash2,
  Eye,
  PlayCircle,
  StopCircle,
  XCircle,
  TestTube,
  Upload,
  Plus,
  X,
  UserPlus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface EmailTemplate {
  _id: string;
  name: string;
  slug: string;
  subject: string;
  htmlContent: string;
  category: string;
  placeholders: string[];
  isDefault: boolean;
  isActive: boolean;
}

const emailHeader = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReggyPOS</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 40px; text-align: center;">
              <img src="https://api.yourdomain.com/images/logo.png" alt="ReggyPOS" style="height: 50px; margin-bottom: 10px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.9;">Manage Your Stock, Sales & Cashflow</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">`;

const emailFooter = `
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
              <img src="https://api.yourdomain.com/images/logo.png" alt="ReggyPOS" style="height: 35px; margin-bottom: 15px;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
                Download ReggyPOS on your device
              </p>
              <p style="margin: 15px 0;">
                <a href="https://play.google.com/store/apps/details?id=com.reggypos.app" style="display: inline-block; margin: 0 5px;">
                  <img src="https://yourdomain.com/imgs/gg.png" alt="Google Play" style="height: 40px;">
                </a>
                <a href="https://apps.apple.com/app/idYOUR_APP_STORE_ID" style="display: inline-block; margin: 0 5px;">
                  <img src="https://yourdomain.com/imgs/apple-app-store-logo.jpg" alt="App Store" style="height: 40px; border-radius: 6px;">
                </a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0; border-top: 1px solid #374151; padding-top: 20px;">
                &copy; ${new Date().getFullYear()} ReggyPOS. All Rights Reserved.<br>
                <a href="https://yourdomain.com" style="color: #10b981; text-decoration: none;">yourdomain.com</a>
              </p>
              <p style="color: #6b7280; font-size: 11px; margin: 10px 0 0 0;">
                Need help? Contact us via <a href="https://wa.me/YOUR_WHATSAPP_NUMBER" style="color: #10b981; text-decoration: none;">WhatsApp</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Email templates are now fetched from the API

interface SmsProgress {
  total: number;
  sent: number;
  failed: number;
  currentUser?: string;
  isRunning: boolean;
  results: Array<{ phone: string; username: string; success: boolean; error?: string }>;
}

interface EmailProgress {
  total: number;
  sent: number;
  failed: number;
  currentUser?: string;
  isRunning: boolean;
  results: Array<{ email: string; username: string; success: boolean; error?: string }>;
}

export default function BulkCommunicationPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [smsMessage, setSmsMessage] = useState("");
  const [smsUserType, setSmsUserType] = useState("all");
  const [emailUserType, setEmailUserType] = useState("all");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [saveTemplateDialog, setSaveTemplateDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [confirmSendDialog, setConfirmSendDialog] = useState<{ open: boolean; type: "sms" | "email" } | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  
  // Queue-based SMS sending state
  const [dryRunMode, setDryRunMode] = useState(true);
  const [smsProgress, setSmsProgress] = useState<SmsProgress>({
    total: 0,
    sent: 0,
    failed: 0,
    isRunning: false,
    results: [],
  });
  const [stopSending, setStopSending] = useState(false);
  const [delayBetweenSms, setDelayBetweenSms] = useState(500); // ms between each SMS

  // Queue-based Email sending state
  const [emailProgress, setEmailProgress] = useState<EmailProgress>({
    total: 0,
    sent: 0,
    failed: 0,
    isRunning: false,
    results: [],
  });
  const [stopEmailSending, setStopEmailSending] = useState(false);
  const [delayBetweenEmails, setDelayBetweenEmails] = useState(500); // ms between each email

  // User count preview state
  const [smsUserCount, setSmsUserCount] = useState<{ total: number; withPhone: number; loading: boolean }>({
    total: 0,
    withPhone: 0,
    loading: false,
  });
  const [emailUserCount, setEmailUserCount] = useState<{ total: number; withEmail: number; loading: boolean }>({
    total: 0,
    withEmail: 0,
    loading: false,
  });

  // Custom recipients state for email
  const [customRecipients, setCustomRecipients] = useState<Array<{ name: string; email: string }>>([]);
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [csvFileName, setCsvFileName] = useState("");

  // Helper function to build query params for the new API
  const buildSubscriptionQueryParams = (userType: string, page: number, limit: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    
    switch (userType) {
      case "trial_active":
        params.set("subscriptionStatus", "active");
        params.set("subscriptionType", "trial");
        break;
      case "trial_expired":
        params.set("subscriptionStatus", "expired");
        params.set("subscriptionType", "trial");
        break;
      case "subscribed":
        params.set("subscriptionStatus", "active");
        params.set("subscriptionType", "production");
        break;
      case "subscription_expired":
        params.set("subscriptionStatus", "expired");
        params.set("subscriptionType", "production");
        break;
      case "all":
      default:
        // No filters for "all"
        break;
    }
    
    return params.toString();
  };

  // Fetch SMS user count when type changes
  useEffect(() => {
    const fetchSmsCount = async () => {
      setSmsUserCount(prev => ({ ...prev, loading: true }));
      try {
        const queryParams = buildSubscriptionQueryParams(smsUserType, 1, 1);
        const response = await apiClient<{ 
          admins: Array<{ _id: string; phone: string; email: string; primaryShop: { _id: string; name: string } }>;
          totalAdmins: number;
          totalPages: number;
          currentPage: number;
        }>(`/admin/users/subscriptions?${queryParams}`);
        
        setSmsUserCount({
          total: response.totalAdmins || 0,
          withPhone: response.totalAdmins || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching SMS user count:", error);
        setSmsUserCount({ total: 0, withPhone: 0, loading: false });
      }
    };
    fetchSmsCount();
  }, [smsUserType]);

  // Fetch Email user count when type changes
  useEffect(() => {
    const fetchEmailCount = async () => {
      setEmailUserCount(prev => ({ ...prev, loading: true }));
      try {
        const queryParams = buildSubscriptionQueryParams(emailUserType, 1, 1);
        const response = await apiClient<{ 
          admins: Array<{ _id: string; phone: string; email: string; primaryShop: { _id: string; name: string } }>;
          totalAdmins: number;
          totalPages: number;
          currentPage: number;
        }>(`/admin/users/subscriptions?${queryParams}`);
        
        setEmailUserCount({
          total: response.totalAdmins || 0,
          withEmail: response.totalAdmins || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching email user count:", error);
        setEmailUserCount({ total: 0, withEmail: 0, loading: false });
      }
    };
    fetchEmailCount();
  }, [emailUserType]);

  // Fetch email templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const response = await apiClient<EmailTemplate[]>("/templates");
        const activeTemplates = (response || []).filter(t => t.isActive !== false);
        setTemplates(activeTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Queue-based SMS sending with pagination
  const startQueueSending = useCallback(async () => {
    if (!smsMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    setStopSending(false);
    setSmsProgress({
      total: 0,
      sent: 0,
      failed: 0,
      isRunning: true,
      results: [],
    });

    try {
      // First fetch to get total count using new API
      const queryParams = buildSubscriptionQueryParams(smsUserType, 1, 50);
      const firstResponse = await apiClient<{ 
        admins: Array<{ _id: string; email: string; phone: string; primaryShop: { _id: string; name: string } }>;
        totalAdmins: number;
        totalPages: number;
        currentPage: number;
      }>(`/admin/users/subscriptions?${queryParams}`);
      
      const totalUsers = firstResponse.totalAdmins || 0;
      const adminsWithPhone = firstResponse.admins.filter(a => a.phone);
      
      if (totalUsers === 0 || adminsWithPhone.length === 0) {
        toast({
          title: "No users found",
          description: "No users with phone numbers match the selected filter.",
          variant: "destructive",
        });
        setSmsProgress(prev => ({ ...prev, isRunning: false }));
        return;
      }

      setSmsProgress(prev => ({ ...prev, total: totalUsers }));

      const results: Array<{ phone: string; username: string; success: boolean; error?: string }> = [];
      let shouldStop = false;
      let currentPage = 1;
      let hasMore = firstResponse.currentPage < firstResponse.totalPages;
      let usersToSend = adminsWithPhone.map(a => ({ 
        _id: a._id, 
        username: a.primaryShop?.name || a.email || "Unknown", 
        phone: a.phone 
      }));

      // Process users with pagination
      while (hasMore && !shouldStop) {
        // Process current batch
        for (let i = 0; i < usersToSend.length; i++) {
          if (shouldStop) break;
          
          const userToSend = usersToSend[i];
          
          setSmsProgress(prev => ({
            ...prev,
            currentUser: userToSend.username || userToSend.phone,
          }));

          try {
            const result = await apiClient<{ success: boolean; error?: string }>("/communication/sms/single", {
              method: "POST",
              body: {
                phone: userToSend.phone,
                message: smsMessage,
                userId: user?._id,
                dryRun: dryRunMode,
              },
            });

            results.push({
              phone: userToSend.phone,
              username: userToSend.username || "Unknown",
              success: result.success,
              error: result.error,
            });

            setSmsProgress(prev => ({
              ...prev,
              sent: prev.sent + (result.success ? 1 : 0),
              failed: prev.failed + (result.success ? 0 : 1),
              results: [...prev.results, {
                phone: userToSend.phone,
                username: userToSend.username || "Unknown",
                success: result.success,
                error: result.error,
              }],
            }));
          } catch (error: any) {
            results.push({
              phone: userToSend.phone,
              username: userToSend.username || "Unknown",
              success: false,
              error: error.message,
            });

            setSmsProgress(prev => ({
              ...prev,
              failed: prev.failed + 1,
              results: [...prev.results, {
                phone: userToSend.phone,
                username: userToSend.username || "Unknown",
                success: false,
                error: error.message,
              }],
            }));
          }

          // Delay between messages to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, delayBetweenSms));

          // Check stop flag
          setStopSending(current => {
            shouldStop = current;
            return current;
          });
        }

        // Fetch next page if there are more users
        currentPage++;
        const nextQueryParams = buildSubscriptionQueryParams(smsUserType, currentPage, 50);
        const nextResponse = await apiClient<{ 
          admins: Array<{ _id: string; email: string; phone: string; primaryShop: { _id: string; name: string } }>;
          totalAdmins: number;
          totalPages: number;
          currentPage: number;
        }>(`/admin/users/subscriptions?${nextQueryParams}`);
        
        hasMore = nextResponse.currentPage < nextResponse.totalPages && nextResponse.admins.length > 0;
        usersToSend = nextResponse.admins.filter((a: any) => a.phone).map(a => ({
          _id: a._id,
          username: a.primaryShop?.name || a.email || "Unknown",
          phone: a.phone
        }));
      }

      setSmsProgress(prev => ({ ...prev, isRunning: false, currentUser: undefined }));
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      toast({
        title: dryRunMode ? "Dry Run Complete" : "SMS Sending Complete",
        description: `${successCount} sent, ${failCount} failed${dryRunMode ? " (simulation)" : ""}`,
      });

    } catch (error: any) {
      toast({
        title: "Failed to start sending",
        description: error.message,
        variant: "destructive",
      });
      setSmsProgress(prev => ({ ...prev, isRunning: false }));
    }
  }, [smsMessage, smsUserType, dryRunMode, delayBetweenSms, user, toast]);

  const handleStopSending = () => {
    setStopSending(true);
    toast({
      title: "Stopping...",
      description: "Sending will stop after the current message.",
    });
  };

  // Custom recipient management functions
  const addCustomRecipient = () => {
    if (!newRecipientEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newRecipientEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    if (customRecipients.some(r => r.email.toLowerCase() === newRecipientEmail.toLowerCase().trim())) {
      toast({
        title: "Duplicate email",
        description: "This email address is already in the list.",
        variant: "destructive",
      });
      return;
    }

    setCustomRecipients([
      ...customRecipients,
      { name: newRecipientName.trim() || newRecipientEmail.trim(), email: newRecipientEmail.toLowerCase().trim() }
    ]);
    setNewRecipientName("");
    setNewRecipientEmail("");
  };

  const removeCustomRecipient = (email: string) => {
    setCustomRecipients(customRecipients.filter(r => r.email !== email));
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const newRecipients: Array<{ name: string; email: string }> = [];
      const existingEmails = new Set(customRecipients.map(r => r.email.toLowerCase()));
      let skippedCount = 0;
      
      // Skip header row if it looks like a header
      const startIdx = lines[0]?.toLowerCase().includes('email') || lines[0]?.toLowerCase().includes('name') ? 1 : 0;
      
      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Support both comma and semicolon separators
        const parts = line.includes(',') ? line.split(',') : line.split(';');
        
        // Try to find email - could be in first or second column
        let email = '';
        let name = '';
        
        for (const part of parts) {
          const cleaned = part.trim().replace(/^["']|["']$/g, ''); // Remove quotes
          if (cleaned.includes('@')) {
            email = cleaned.toLowerCase();
          } else if (!name) {
            name = cleaned;
          }
        }
        
        if (email && !existingEmails.has(email)) {
          newRecipients.push({ 
            name: name || email, 
            email 
          });
          existingEmails.add(email);
        } else if (email) {
          skippedCount++;
        }
      }
      
      if (newRecipients.length > 0) {
        setCustomRecipients([...customRecipients, ...newRecipients]);
        toast({
          title: "CSV imported",
          description: `Added ${newRecipients.length} recipients${skippedCount > 0 ? `, ${skippedCount} duplicates skipped` : ''}.`,
        });
      } else {
        toast({
          title: "No valid emails found",
          description: "Please ensure your CSV has email addresses.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const clearCustomRecipients = () => {
    setCustomRecipients([]);
    setCsvFileName("");
  };

  // Backend-driven bulk email sending via Brevo
  const startEmailQueueSending = useCallback(async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Subject and body required",
        description: "Please enter both subject and body for the email.",
        variant: "destructive",
      });
      return;
    }

    // Validate custom recipients if custom mode is selected
    if (emailUserType === "custom" && customRecipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one recipient or upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setStopEmailSending(false);
    setEmailProgress({
      total: 0,
      sent: 0,
      failed: 0,
      isRunning: true,
      results: [],
    });

    try {
      // Call the new backend endpoint that handles everything server-side
      const response = await apiClient<{
        success: boolean;
        dryRun: boolean;
        totalUsers: number;
        sent: number;
        failed: number;
        results: Array<{ email: string; name: string; success: boolean; error?: string }>;
        message: string;
      }>("/communication/bulk-email", {
        method: "POST",
        body: {
          userType: emailUserType,
          subject: emailSubject,
          htmlContent: emailBody,
          dryRun: false,
          delayMs: delayBetweenEmails,
          customRecipients: emailUserType === "custom" ? customRecipients : undefined,
        },
      });

      // Update progress with final results
      setEmailProgress({
        total: response.totalUsers,
        sent: response.sent,
        failed: response.failed,
        isRunning: false,
        results: response.results.map(r => ({
          email: r.email,
          username: r.name,
          success: r.success,
          error: r.error,
        })),
      });

      toast({
        title: "Email Sending Complete",
        description: response.message,
      });

    } catch (error: any) {
      toast({
        title: "Failed to send emails",
        description: error.message,
        variant: "destructive",
      });
      setEmailProgress(prev => ({ ...prev, isRunning: false }));
    }
  }, [emailSubject, emailBody, emailUserType, delayBetweenEmails, customRecipients, toast]);

  const handleStopEmailSending = () => {
    setStopEmailSending(true);
    toast({
      title: "Stopping...",
      description: "Email sending will stop after the current message.",
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.htmlContent);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for the template.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTemplate = await apiClient<EmailTemplate>("/templates", {
        method: "POST",
        body: {
          name: newTemplateName,
          slug: newTemplateName.toLowerCase().replace(/\s+/g, '-'),
          subject: emailSubject,
          htmlContent: emailBody,
          category: "custom",
          placeholders: ["name", "email", "expiryDate", "shopName"],
          isDefault: false,
          isActive: true,
        },
      });

      setTemplates([...templates, newTemplate]);
      setSaveTemplateDialog(false);
      setNewTemplateName("");
      toast({
        title: "Template saved",
        description: "Your email template has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await apiClient(`/templates/${templateId}`, { method: "DELETE" });
      setTemplates(templates.filter(t => t._id !== templateId));
      if (selectedTemplate === templateId) {
        setSelectedTemplate("");
      }
      toast({
        title: "Template deleted",
        description: "The template has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Bulk Communication">
      <div className="space-y-6">
        <Tabs defaultValue="sms" className="w-full">
              <TabsList>
                <TabsTrigger value="sms" data-testid="tab-bulk-sms">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Bulk SMS
                </TabsTrigger>
                <TabsTrigger value="email" data-testid="tab-bulk-email">
                  <Mail className="h-4 w-4 mr-2" />
                  Bulk Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sms">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Send Bulk SMS
                      {dryRunMode && (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          <TestTube className="h-3 w-3 mr-1" />
                          Dry Run Mode
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Send SMS messages one by one to avoid rate limits. Use dry run mode to test without sending real messages.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4 text-amber-600" />
                        <div>
                          <Label htmlFor="dry-run-toggle" className="font-medium">Dry Run Mode</Label>
                          <p className="text-xs text-muted-foreground">Simulate sending without actually calling the SMS API</p>
                        </div>
                      </div>
                      <Switch
                        id="dry-run-toggle"
                        checked={dryRunMode}
                        onCheckedChange={setDryRunMode}
                        disabled={smsProgress.isRunning}
                        data-testid="switch-dry-run"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target Users</Label>
                        <Select value={smsUserType} onValueChange={setSmsUserType} disabled={smsProgress.isRunning}>
                          <SelectTrigger data-testid="select-sms-user-type">
                            <SelectValue placeholder="Select user type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="trial_active">Trial Active</SelectItem>
                            <SelectItem value="trial_expired">Trial Expired</SelectItem>
                            <SelectItem value="subscribed">Subscribed</SelectItem>
                            <SelectItem value="subscription_expired">Subscription Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground" data-testid="text-sms-user-count">
                          {smsUserCount.loading ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {smsUserCount.withPhone.toLocaleString()} shops with phone numbers
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Delay Between Messages (ms)</Label>
                        <Input
                          type="number"
                          value={delayBetweenSms}
                          onChange={(e) => setDelayBetweenSms(Math.max(100, parseInt(e.target.value) || 500))}
                          min={100}
                          max={5000}
                          disabled={smsProgress.isRunning}
                          data-testid="input-sms-delay"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Type your SMS message here..."
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        rows={5}
                        disabled={smsProgress.isRunning}
                        data-testid="input-bulk-sms-message"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{smsMessage.length} characters</span>
                        <span>{Math.ceil(smsMessage.length / 160)} SMS segment(s)</span>
                      </div>
                    </div>

                    {smsProgress.isRunning && (
                      <div className="space-y-3 p-4 bg-muted/30 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Sending to: {smsProgress.currentUser || "..."}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {smsProgress.sent + smsProgress.failed} / {smsProgress.total}
                          </span>
                        </div>
                        <Progress 
                          value={smsProgress.total > 0 ? ((smsProgress.sent + smsProgress.failed) / smsProgress.total) * 100 : 0} 
                        />
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            {smsProgress.sent} sent
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            {smsProgress.failed} failed
                          </span>
                        </div>
                      </div>
                    )}

                    {!smsProgress.isRunning && smsProgress.results.length > 0 && (
                      <div className="space-y-2">
                        <Label>Last Results</Label>
                        <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-muted/30 rounded-md">
                          {smsProgress.results.slice(-10).map((result, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                              <span className="truncate">{result.username} ({result.phone})</span>
                              {result.success ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {dryRunMode ? "Simulated" : "Sent"}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {!smsProgress.isRunning ? (
                        <Button
                          onClick={startQueueSending}
                          disabled={!smsMessage.trim()}
                          data-testid="button-start-bulk-sms"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {dryRunMode ? "Start Dry Run" : "Start Sending"}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={handleStopSending}
                          data-testid="button-stop-bulk-sms"
                        >
                          <StopCircle className="h-4 w-4 mr-2" />
                          Stop Sending
                        </Button>
                      )}
                      
                      {smsProgress.isRunning && (
                        <Badge variant="secondary" className="animate-pulse">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Processing...
                        </Badge>
                      )}
                    </div>

                    {dryRunMode && (
                      <div className="flex items-center gap-2 text-amber-600 text-sm p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Dry run mode is enabled. No actual SMS messages will be sent.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Send Bulk Email (Queue-Based)</CardTitle>
                    <CardDescription>
                      Send emails one by one to avoid rate limits.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target Users</Label>
                        <Select value={emailUserType} onValueChange={setEmailUserType} disabled={emailProgress.isRunning}>
                          <SelectTrigger data-testid="select-email-user-type">
                            <SelectValue placeholder="Select user type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="trial_active">Trial Active</SelectItem>
                            <SelectItem value="trial_expired">Trial Expired</SelectItem>
                            <SelectItem value="subscribed">Subscribed</SelectItem>
                            <SelectItem value="subscription_expired">Subscription Expired</SelectItem>
                            <SelectItem value="custom">Custom Recipients</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground" data-testid="text-email-user-count">
                          {emailUserType === "custom" ? (
                            <span className="flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              {customRecipients.length} custom recipient{customRecipients.length !== 1 ? 's' : ''}
                            </span>
                          ) : emailUserCount.loading ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {emailUserCount.withEmail.toLocaleString()} shops with email addresses
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Delay Between Emails (ms)</Label>
                        <Input
                          type="number"
                          min={100}
                          max={5000}
                          value={delayBetweenEmails}
                          onChange={(e) => setDelayBetweenEmails(Math.max(100, parseInt(e.target.value) || 500))}
                          disabled={emailProgress.isRunning}
                          data-testid="input-email-delay"
                        />
                      </div>
                    </div>

                    {emailUserType === "custom" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Custom Recipients</Label>
                          {customRecipients.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearCustomRecipients}
                              disabled={emailProgress.isRunning}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Clear All
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                          <Input
                            placeholder="Name (optional)"
                            value={newRecipientName}
                            onChange={(e) => setNewRecipientName(e.target.value)}
                            disabled={emailProgress.isRunning}
                            data-testid="input-recipient-name"
                          />
                          <Input
                            placeholder="Email address"
                            type="email"
                            value={newRecipientEmail}
                            onChange={(e) => setNewRecipientEmail(e.target.value)}
                            disabled={emailProgress.isRunning}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomRecipient()}
                            data-testid="input-recipient-email"
                          />
                          <Button
                            onClick={addCustomRecipient}
                            disabled={emailProgress.isRunning}
                            data-testid="button-add-recipient"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Or</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="file"
                              accept=".csv,.txt"
                              onChange={handleCsvUpload}
                              className="hidden"
                              disabled={emailProgress.isRunning}
                              data-testid="input-csv-upload"
                            />
                            <Button variant="outline" size="sm" asChild disabled={emailProgress.isRunning}>
                              <span>
                                <Upload className="h-4 w-4 mr-1" />
                                Upload CSV
                              </span>
                            </Button>
                          </label>
                          {csvFileName && (
                            <span className="text-xs text-muted-foreground">
                              Last uploaded: {csvFileName}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          CSV format: name,email (one per line). Header row optional.
                        </p>

                        {customRecipients.length > 0 && (
                          <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2 bg-background">
                            {customRecipients.map((recipient, idx) => (
                              <div key={idx} className="flex items-center justify-between py-1 px-2 hover:bg-muted/50 rounded text-sm">
                                <span>
                                  <span className="font-medium">{recipient.name}</span>
                                  <span className="text-muted-foreground ml-2">({recipient.email})</span>
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeCustomRecipient(recipient.email)}
                                  disabled={emailProgress.isRunning}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Email Template</Label>
                      <div className="flex items-center gap-2">
                        <Select value={selectedTemplate} onValueChange={handleTemplateSelect} disabled={emailProgress.isRunning}>
                          <SelectTrigger className="flex-1" data-testid="select-email-template">
                            <SelectValue placeholder="Select a template or write custom..." />
                          </SelectTrigger>
                          <SelectContent>
                            {templatesLoading ? (
                              <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                            ) : templates.length === 0 ? (
                              <SelectItem value="none" disabled>No templates found</SelectItem>
                            ) : (
                              templates.map((template) => (
                                <SelectItem key={template._id} value={template._id}>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {template.name}
                                    {!template.isDefault && (
                                      <Badge variant="outline" className="text-xs ml-1">Custom</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {selectedTemplate && templates.find(t => t._id === selectedTemplate && !t.isDefault) && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteTemplate(selectedTemplate)}
                            disabled={emailProgress.isRunning}
                            data-testid="button-delete-template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input
                        placeholder="Email subject..."
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        disabled={emailProgress.isRunning}
                        data-testid="input-bulk-email-subject"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Message Body</Label>
                      <Textarea
                        placeholder="Type your email message here... Use {{name}} for recipient name."
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                        disabled={emailProgress.isRunning}
                        data-testid="input-bulk-email-body"
                      />
                      <p className="text-xs text-muted-foreground">
                        Available placeholders: {"{{name}}"}, {"{{email}}"}, {"{{expiryDate}}"}, {"{{promotionDetails}}"}
                      </p>
                    </div>

                    {emailProgress.isRunning && (
                      <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100">Processing bulk emails...</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              The server is sending emails to all matching users. This may take a few minutes depending on the number of recipients.
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Please wait - results will appear when complete. Do not close this page.
                        </p>
                      </div>
                    )}

                    {!emailProgress.isRunning && emailProgress.results.length > 0 && (
                      <div className="space-y-2">
                        <Label>Last Results</Label>
                        <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-muted/30 rounded-md">
                          {emailProgress.results.slice(-10).map((result, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                              <span className="truncate">{result.username} ({result.email})</span>
                              {result.success ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Sent
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        onClick={startEmailQueueSending}
                        disabled={!emailSubject?.trim() || !emailBody?.trim() || emailProgress.isRunning}
                        data-testid="button-start-bulk-email"
                      >
                        {emailProgress.isRunning ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Sending
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setPreviewDialog(true)}
                        disabled={!emailBody.trim() || emailProgress.isRunning}
                        data-testid="button-preview-email"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSaveTemplateDialog(true)}
                        disabled={!emailSubject?.trim() || !emailBody?.trim() || emailProgress.isRunning}
                        data-testid="button-save-template"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save as Template
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
      </div>

      <Dialog open={saveTemplateDialog} onOpenChange={setSaveTemplateDialog}>
        <DialogContent data-testid="dialog-save-template">
          <DialogHeader>
            <DialogTitle>Save Email Template</DialogTitle>
            <DialogDescription>
              Save this email as a template for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., Monthly Newsletter"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                data-testid="input-template-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} data-testid="button-confirm-save-template">
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden" data-testid="dialog-email-preview">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              This is how your email will appear to recipients
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md overflow-auto max-h-[60vh] bg-gray-100">
            <iframe
              srcDoc={emailBody.replace(/\{\{name\}\}/g, "John Doe").replace(/\{\{email\}\}/g, "john@example.com").replace(/\{\{expiryDate\}\}/g, "January 15, 2025").replace(/\{\{promotionDetails\}\}/g, "50% OFF on all subscriptions!").replace(/\{\{announcementContent\}\}/g, "We have exciting new features coming soon!")}
              title="Email Preview"
              className="w-full h-[500px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
