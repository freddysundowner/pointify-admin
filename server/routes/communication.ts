import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";
import * as Brevo from "@getbrevo/brevo";

const EMAIL_SETTING_NAME = "EMAIL_CONFIG";

export function registerCommunicationRoutes(app: Express) {
  app.get("/api/communication", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { status, type, user, to, fromDate, toDate, page = 1, limit = 20 } = req.query;

      let endpoint = `/communication?page=${page}&limit=${limit}`;
      if (status) endpoint += `&status=${encodeURIComponent(status as string)}`;
      if (type) endpoint += `&type=${encodeURIComponent(type as string)}`;
      if (user) endpoint += `&user=${encodeURIComponent(user as string)}`;
      if (to) endpoint += `&to=${encodeURIComponent(to as string)}`;
      if (fromDate) endpoint += `&fromDate=${encodeURIComponent(fromDate as string)}`;
      if (toDate) endpoint += `&toDate=${encodeURIComponent(toDate as string)}`;

      const result = await apiRequest(endpoint, { token: session.token });
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/communication", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { to, body, type, subject, user } = req.body;

      if (!to || !body) {
        return res.status(400).json({ error: "Recipient and message body are required" });
      }

      const result = await apiRequest("/communication", {
        method: "POST",
        body: { to, body, type, subject, user },
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  // Fetch shop owners by subscription type for queue-based sending (with pagination)
  // Uses /shop endpoint with subscriptionStatus (active/expired) and subscriptionType (trial/production)
  app.get("/api/communication/users-by-type", async (req: Request, res: Response) => {
    // Disable caching for this endpoint
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { userType = "all", page = "1", limit = "50" } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;

      // Build shop endpoint with filters based on userType
      // userType maps to: all, trial_active, trial_expired, subscribed (production active), subscription_expired (production expired)
      let endpoint = `/shop?page=${pageNum}&limit=${limitNum}`;
      
      if (userType === "trial_active") {
        endpoint += "&subscriptionStatus=active&subscriptionType=trial";
      } else if (userType === "trial_expired") {
        endpoint += "&subscriptionStatus=expired&subscriptionType=trial";
      } else if (userType === "subscribed") {
        endpoint += "&subscriptionStatus=active&subscriptionType=production";
      } else if (userType === "subscription_expired") {
        endpoint += "&subscriptionStatus=expired&subscriptionType=production";
      }
      // "all" = no additional filters

      // Fetch shops from /shop endpoint with pagination and filters
      const shopsResult = await apiRequest<any>(endpoint, { token: session.token });
      const allShops = shopsResult?.shops || shopsResult?.data || shopsResult || [];
      const totalFromApi = shopsResult?.totalShops || shopsResult?.total || allShops.length;

      // Filter shops that have adminId with phone numbers
      const filteredShops = allShops.filter((shop: any) => {
        const admin = shop.adminId;
        if (!admin) return false;
        const phoneNumber = admin.phone || admin.contact || admin.mobile || admin.phoneNumber || admin.tel;
        const hasPhone = phoneNumber && typeof phoneNumber === 'string' && phoneNumber.trim() !== "";
        return hasPhone;
      });
      

      // Return shop owners with phone numbers
      const usersWithPhone = filteredShops.map((shop: any) => {
        const admin = shop.adminId;
        return {
          _id: admin._id || shop._id,
          username: admin.username || admin.name || shop.name,
          phone: admin.phone || admin.contact || admin.mobile || admin.phoneNumber || admin.tel,
          email: admin.email,
          shopName: shop.name,
          shopId: shop._id,
        };
      });

      res.status(200).json({
        total: totalFromApi,
        page: pageNum,
        limit: limitNum,
        hasMore: pageNum * limitNum < totalFromApi,
        users: usersWithPhone,
      });
    } catch (error: any) {
      console.error("Error fetching users by type:", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  // Fetch shop owners with email for bulk email sending (with pagination and userType support)
  // Uses /shop endpoint with subscriptionStatus (active/expired) and subscriptionType (trial/production)
  app.get("/api/communication/users-with-email", async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { userType = "all", page = "1", limit = "50" } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;

      // Build shop endpoint with filters based on userType
      // userType maps to: all, trial_active, trial_expired, subscribed (production active), subscription_expired (production expired)
      let endpoint = `/shop?page=${pageNum}&limit=${limitNum}`;
      
      if (userType === "trial_active") {
        endpoint += "&subscriptionStatus=active&subscriptionType=trial";
      } else if (userType === "trial_expired") {
        endpoint += "&subscriptionStatus=expired&subscriptionType=trial";
      } else if (userType === "subscribed") {
        endpoint += "&subscriptionStatus=active&subscriptionType=production";
      } else if (userType === "subscription_expired") {
        endpoint += "&subscriptionStatus=expired&subscriptionType=production";
      }
      // "all" = no additional filters

      // Fetch shops from /shop endpoint with pagination and filters
      const shopsResult = await apiRequest<any>(endpoint, { token: session.token });
      const allShops = shopsResult?.shops || shopsResult?.data || shopsResult || [];
      const totalFromApi = shopsResult?.totalShops || shopsResult?.total || allShops.length;

      // Filter shops that have adminId with email addresses
      const filteredShops = allShops.filter((shop: any) => {
        const admin = shop.adminId;
        if (!admin) return false;
        const email = admin.email;
        const hasEmail = email && typeof email === 'string' && email.trim() !== "" && email.includes('@');
        return hasEmail;
      });
      

      // Return shop owners with email addresses
      const usersWithEmail = filteredShops.map((shop: any) => {
        const admin = shop.adminId;
        return {
          _id: admin._id || shop._id,
          username: admin.username || admin.name || shop.name,
          email: admin.email,
          phone: admin.phone || admin.contact || admin.mobile || admin.phoneNumber || admin.tel,
          shopName: shop.name,
          shopId: shop._id,
        };
      });

      res.status(200).json({
        total: totalFromApi,
        page: pageNum,
        limit: limitNum,
        hasMore: pageNum * limitNum < totalFromApi,
        users: usersWithEmail,
      });
    } catch (error: any) {
      console.error("Error fetching users with email:", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  // Send single email (for queue-based sending)
  app.post("/api/communication/email/single", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { email, message, subject, userId, dryRun = false } = req.body;

      if (!email || !message) {
        return res.status(400).json({ error: "Email and message are required" });
      }

      if (dryRun) {
        // Simulate sending - just return success after a small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return res.json({
          success: true,
          dryRun: true,
          message: "Email simulated (dry run)",
          email,
        });
      }

      // Actually send the email via external API
      const result = await apiRequest("/communication", {
        method: "POST",
        body: {
          to: email,
          body: message,
          subject: subject || "Message from ReggyPOS",
          type: "email",
          user: userId,
        },
        token: session.token,
      });

      res.json({
        success: true,
        dryRun: false,
        message: "Email sent",
        email,
        result,
      });
    } catch (error: any) {
      console.error("Error sending single email:", error);
      res.status(error.status || 500).json({ 
        success: false,
        error: error.message,
      });
    }
  });

  // Send single SMS (for queue-based sending)
  app.post("/api/communication/sms/single", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { phone, message, userId, dryRun = false } = req.body;

      if (!phone || !message) {
        return res.status(400).json({ error: "Phone and message are required" });
      }

      if (dryRun) {
        // Simulate sending - just return success after a small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return res.json({
          success: true,
          dryRun: true,
          message: "SMS simulated (dry run)",
          phone,
        });
      }

      // Actually send the SMS via external API
      const result = await apiRequest("/communication", {
        method: "POST",
        body: {
          to: phone,
          body: message,
          type: "sms",
          user: userId,
        },
        token: session.token,
      });

      res.json({
        success: true,
        dryRun: false,
        message: "SMS sent",
        phone,
        result,
      });
    } catch (error: any) {
      console.error("Error sending single SMS:", error);
      res.status(error.status || 500).json({ 
        success: false,
        error: error.message,
      });
    }
  });

  app.post("/api/communication/bulk/sms", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { userType, message, user } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!userType) {
        return res.status(400).json({ error: "User type is required" });
      }

      const result = await apiRequest("/communication/bulk/sms", {
        method: "POST",
        body: { userType, message, user },
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/communication/bulk", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { type, body, subject, recipients, user } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: "Recipients array is required" });
      }

      if (!body) {
        return res.status(400).json({ error: "Message body is required" });
      }

      const result = await apiRequest("/communication/bulk", {
        method: "POST",
        body: { type, body, subject, recipients, user },
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/communication/:id/resend", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const { to } = req.body;

      const result = await apiRequest(`/communication/${id}/resend`, {
        method: "POST",
        body: to ? { to } : undefined,
        token: session.token,
      });

      res.json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  // Bulk email sending via Brevo - handles everything server-side
  app.post("/api/communication/bulk-email", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { 
        userType = "all", 
        subject, 
        htmlContent, 
        dryRun = true,
        delayMs = 500,
        customRecipients 
      } = req.body;

      if (!subject || !htmlContent) {
        return res.status(400).json({ error: "Subject and HTML content are required" });
      }

      // Validate custom recipients if userType is "custom"
      if (userType === "custom") {
        if (!customRecipients || !Array.isArray(customRecipients) || customRecipients.length === 0) {
          return res.status(400).json({ error: "Custom recipients are required when using custom target type" });
        }
      }

      // Fetch Brevo settings from ReggyPOS API
      const emailConfig = await apiRequest<any>(`/settings?type=${EMAIL_SETTING_NAME}`, {
        token: session.token,
      });
      
      const settings = emailConfig?.setting || emailConfig;
      const brevoApiKey = settings?.BREVO_API_KEY;
      const senderEmail = settings?.BREVO_SENDER_EMAIL;
      const senderName = settings?.BREVO_SENDER_NAME || "ReggyPOS";
      
      // Log key info for debugging (masked)

      if (!dryRun && (!brevoApiKey || !senderEmail)) {
        return res.status(400).json({ 
          error: "Brevo settings not configured. Please configure them in Settings > Email." 
        });
      }

      // Initialize Brevo API (only if not dry run)
      let brevoApi: any = null;
      if (!dryRun && brevoApiKey) {
        brevoApi = new Brevo.TransactionalEmailsApi();
        (brevoApi as any).authentications.apiKey.apiKey = brevoApiKey;
      }

      // Track results
      const results: Array<{ email: string; name: string; success: boolean; error?: string }> = [];
      const sentEmails = new Set<string>(); // For duplicate prevention
      let totalUsers = 0;

      // Handle custom recipients
      if (userType === "custom") {
        totalUsers = customRecipients.length;
        console.log(`[Bulk Email] Starting ${dryRun ? 'DRY RUN' : 'LIVE'} for ${totalUsers} custom recipients`);

        for (const recipient of customRecipients) {
          const email = recipient.email?.toLowerCase().trim();
          
          // Skip if no email or already sent
          if (!email || sentEmails.has(email)) {
            continue;
          }

          sentEmails.add(email);
          const name = recipient.name || email;

          // Replace template variables
          const personalizedHtml = htmlContent
            .replace(/\{\{name\}\}/gi, name)
            .replace(/\{\{email\}\}/gi, email);

          try {
            if (dryRun) {
              // Simulate sending
              await new Promise(resolve => setTimeout(resolve, 50));
              results.push({ email, name, success: true });
            } else {
              // Actually send via Brevo
              await brevoApi.sendTransacEmail({
                to: [{ email, name }],
                sender: { email: senderEmail, name: senderName },
                subject: subject.replace(/\{\{name\}\}/gi, name),
                htmlContent: personalizedHtml,
              });
              results.push({ email, name, success: true });
            }
          } catch (error: any) {
            const errorMsg = error.response?.body?.message || error.response?.text || error.message;
            results.push({ email, name, success: false, error: errorMsg });
            console.error(`[Bulk Email] Failed for ${email}:`, errorMsg);
            if (error.response?.body) {
              console.error(`[Bulk Email] Brevo error details:`, JSON.stringify(error.response.body));
            }
          }

          // Delay between emails
          if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }

        const sent = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`[Bulk Email] Completed: ${sent} sent, ${failed} failed`);

        return res.json({
          success: true,
          dryRun,
          totalUsers,
          sent,
          failed,
          results,
          message: dryRun 
            ? `Dry run complete: ${sent} emails would be sent, ${failed} would fail`
            : `Email sending complete: ${sent} sent, ${failed} failed`
        });
      }

      // Build query params based on userType (for non-custom types)
      const buildQueryParams = (page: number, limit: number) => {
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
        }
        
        return params.toString();
      };

      let currentPage = 1;

      // First request to get total count
      const firstQueryParams = buildQueryParams(1, 50);
      const firstResponse = await apiRequest<{
        admins: Array<{ _id: string; email: string; phone: string; primaryShop: { _id: string; name: string } }>;
        totalAdmins: number;
        totalPages: number;
        currentPage: number;
      }>(`/admin/users/subscriptions?${firstQueryParams}`, { token: session.token });

      totalUsers = firstResponse.totalAdmins || 0;
      const totalPages = firstResponse.totalPages || 1;

      if (totalUsers === 0) {
        return res.json({
          success: true,
          dryRun,
          totalUsers: 0,
          sent: 0,
          failed: 0,
          results: [],
          message: "No users found for the selected filter"
        });
      }

      console.log(`[Bulk Email] Starting ${dryRun ? 'DRY RUN' : 'LIVE'} for ${totalUsers} users, ${totalPages} pages`);

      // Process all pages
      let adminsToProcess = firstResponse.admins.filter(a => a.email);

      while (currentPage <= totalPages) {
        // Process current batch
        for (const admin of adminsToProcess) {
          const email = admin.email?.toLowerCase().trim();
          
          // Skip if no email or already sent
          if (!email || sentEmails.has(email)) {
            continue;
          }

          sentEmails.add(email);
          const name = admin.primaryShop?.name || email;

          // Replace template variables
          const personalizedHtml = htmlContent
            .replace(/\{\{name\}\}/gi, name)
            .replace(/\{\{email\}\}/gi, email);

          try {
            if (dryRun) {
              // Simulate sending
              await new Promise(resolve => setTimeout(resolve, 50));
              results.push({ email, name, success: true });
            } else {
              // Actually send via Brevo
              await brevoApi.sendTransacEmail({
                to: [{ email, name }],
                sender: { email: senderEmail, name: senderName },
                subject: subject.replace(/\{\{name\}\}/gi, name),
                htmlContent: personalizedHtml,
              });
              results.push({ email, name, success: true });
            }
          } catch (error: any) {
            const errorMsg = error.response?.body?.message || error.response?.text || error.message;
            results.push({ email, name, success: false, error: errorMsg });
            console.error(`[Bulk Email] Failed for ${email}:`, errorMsg);
            if (error.response?.body) {
              console.error(`[Bulk Email] Brevo error details:`, JSON.stringify(error.response.body));
            }
          }

          // Delay between emails
          if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }

        // Fetch next page
        currentPage++;
        if (currentPage <= totalPages) {
          const nextQueryParams = buildQueryParams(currentPage, 50);
          const nextResponse = await apiRequest<{
            admins: Array<{ _id: string; email: string; phone: string; primaryShop: { _id: string; name: string } }>;
            totalAdmins: number;
            totalPages: number;
            currentPage: number;
          }>(`/admin/users/subscriptions?${nextQueryParams}`, { token: session.token });
          
          adminsToProcess = nextResponse.admins.filter(a => a.email);
        }
      }

      const sent = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`[Bulk Email] Completed: ${sent} sent, ${failed} failed`);

      res.json({
        success: true,
        dryRun,
        totalUsers,
        sent,
        failed,
        results,
        message: dryRun 
          ? `Dry run complete: ${sent} emails would be sent, ${failed} would fail`
          : `Email sending complete: ${sent} sent, ${failed} failed`
      });

    } catch (error: any) {
      console.error("[Bulk Email] Error:", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  });
}
