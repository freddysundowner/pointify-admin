import type { Express, Request, Response } from "express";
import { getSession, apiRequest } from "./utils";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const API_BASE_URL = "https://sandbox.pointifypos.com";

const SMS_SETTING_NAME = "SMS_CONFIG";
const EMAIL_SETTING_NAME = "EMAIL_CONFIG";
const PERMISSIONS_SETTING_NAME = "ATTENDANT_PERMISSIONS";
const THEME_SETTING_NAME = "theme";

export function registerSettingsRoutes(app: Express) {
  // Get SMS settings
  app.get("/api/settings/sms", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Fetch settings from external API using type parameter
      const smsConfig = await apiRequest<any>(`/settings?type=${SMS_SETTING_NAME}`, {
        token: session.token,
      });
      
      // API returns settings directly at root level
      const settings = smsConfig?.setting || smsConfig;
      
      if (settings?.SMS_API_KEY || settings?.SMS_END_POINT || settings?.SMS_SHORT_CODE) {
        const apiKey = settings.SMS_API_KEY || "";
        res.json({
          SMS_API_KEY: apiKey ? "••••••••" + apiKey.slice(-4) : "",
          SMS_END_POINT: settings.SMS_END_POINT || "",
          SMS_SHORT_CODE: settings.SMS_SHORT_CODE || "",
        });
      } else {
        res.json({
          SMS_API_KEY: "",
          SMS_END_POINT: "",
          SMS_SHORT_CODE: "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching SMS settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Save SMS settings
  app.post("/api/settings/sms", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { SMS_API_KEY, SMS_END_POINT, SMS_SHORT_CODE } = req.body;

      // Get existing settings to preserve API key if masked version is sent
      let finalApiKey = SMS_API_KEY;
      
      if (SMS_API_KEY && SMS_API_KEY.startsWith("••••")) {
        // User sent masked version, fetch current value
        try {
          const smsConfig = await apiRequest<any>(`/settings?type=${SMS_SETTING_NAME}`, {
            token: session.token,
          });
          const settings = smsConfig?.setting || smsConfig;
          if (settings?.SMS_API_KEY) {
            finalApiKey = settings.SMS_API_KEY;
          }
        } catch {
          // Ignore error, use masked value
        }
      }

      // Save to external API with MongoDB schema format
      await apiRequest(`/settings`, {
        method: "POST",
        token: session.token,
        body: {
          name: SMS_SETTING_NAME,
          sync: false,
          setting: {
            SMS_API_KEY: finalApiKey,
            SMS_END_POINT: SMS_END_POINT || "",
            SMS_SHORT_CODE: SMS_SHORT_CODE || "",
          },
        },
      });

      res.json({ message: "SMS settings saved successfully" });
    } catch (error: any) {
      console.error("Error saving SMS settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get raw SMS settings (for internal use when sending SMS)
  app.get("/api/settings/sms/raw", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Fetch settings from external API using type parameter
      const smsConfig = await apiRequest<any>(`/settings?type=${SMS_SETTING_NAME}`, {
        token: session.token,
      });
      
      const settings = smsConfig?.setting || smsConfig;
      
      if (settings?.SMS_API_KEY || settings?.SMS_END_POINT || settings?.SMS_SHORT_CODE) {
        res.json({
          SMS_API_KEY: settings.SMS_API_KEY || "",
          SMS_END_POINT: settings.SMS_END_POINT || "",
          SMS_SHORT_CODE: settings.SMS_SHORT_CODE || "",
        });
      } else {
        res.json({
          SMS_API_KEY: "",
          SMS_END_POINT: "",
          SMS_SHORT_CODE: "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching raw SMS settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get Email settings (Brevo)
  app.get("/api/settings/email", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Fetch settings from external API using type parameter
      const emailConfig = await apiRequest<any>(`/settings?type=${EMAIL_SETTING_NAME}`, {
        token: session.token,
      });
      
      // API returns settings directly at root level
      const settings = emailConfig?.setting || emailConfig;
      
      if (settings?.BREVO_API_KEY || settings?.BREVO_SENDER_EMAIL || settings?.BREVO_SENDER_NAME) {
        const apiKey = settings.BREVO_API_KEY || "";
        res.json({
          BREVO_API_KEY: apiKey ? "••••••••" + apiKey.slice(-4) : "",
          BREVO_SENDER_EMAIL: settings.BREVO_SENDER_EMAIL || "",
          BREVO_SENDER_NAME: settings.BREVO_SENDER_NAME || "",
        });
      } else {
        res.json({
          BREVO_API_KEY: "",
          BREVO_SENDER_EMAIL: "",
          BREVO_SENDER_NAME: "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching email settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Save Email settings (Brevo)
  app.post("/api/settings/email", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } = req.body;

      let finalApiKey = BREVO_API_KEY;
      
      if (BREVO_API_KEY && BREVO_API_KEY.startsWith("••••")) {
        try {
          const emailConfig = await apiRequest<any>(`/settings?type=${EMAIL_SETTING_NAME}`, {
            token: session.token,
          });
          const settings = emailConfig?.setting || emailConfig;
          if (settings?.BREVO_API_KEY) {
            finalApiKey = settings.BREVO_API_KEY;
          }
        } catch {
          // Ignore error, use masked value
        }
      }

      await apiRequest(`/settings`, {
        method: "POST",
        token: session.token,
        body: {
          name: EMAIL_SETTING_NAME,
          sync: false,
          setting: {
            BREVO_API_KEY: finalApiKey,
            BREVO_SENDER_EMAIL: BREVO_SENDER_EMAIL || "",
            BREVO_SENDER_NAME: BREVO_SENDER_NAME || "",
          },
        },
      });

      res.json({ message: "Email settings saved successfully" });
    } catch (error: any) {
      console.error("Error saving email settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get raw Email settings (for internal use when sending emails)
  app.get("/api/settings/email/raw", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Fetch settings from external API using type parameter
      const emailConfig = await apiRequest<any>(`/settings?type=${EMAIL_SETTING_NAME}`, {
        token: session.token,
      });
      
      const settings = emailConfig?.setting || emailConfig;
      
      if (settings?.BREVO_API_KEY || settings?.BREVO_SENDER_EMAIL || settings?.BREVO_SENDER_NAME) {
        res.json({
          BREVO_API_KEY: settings.BREVO_API_KEY || "",
          BREVO_SENDER_EMAIL: settings.BREVO_SENDER_EMAIL || "",
          BREVO_SENDER_NAME: settings.BREVO_SENDER_NAME || "",
        });
      } else {
        res.json({
          BREVO_API_KEY: "",
          BREVO_SENDER_EMAIL: "",
          BREVO_SENDER_NAME: "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching raw email settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get Theme settings
  app.get("/api/settings/theme", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const themeConfig = await apiRequest<any>(`/themes`, {
        token: session.token,
      });
      
      console.log("[API] Theme settings response:", JSON.stringify(themeConfig));
      
      res.json(themeConfig || {});
    } catch (error: any) {
      console.error("Error fetching theme settings:", error);
      res.json({});
    }
  });

  // Save Theme settings (JSON only, no file)
  app.post("/api/settings/theme", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const themeData = req.body;

      await apiRequest(`/themes`, {
        method: "POST",
        token: session.token,
        body: themeData,
      });

      res.json({ message: "Theme settings saved successfully" });
    } catch (error: any) {
      console.error("Error saving theme settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Save Theme settings with file upload
  app.post("/api/settings/theme/upload", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const formData = new FormData();
      
      // Add all text fields
      Object.keys(req.body).forEach(key => {
        formData.append(key, req.body[key]);
      });

      // Add image file if present
      if (req.file) {
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("image", blob, req.file.originalname);
      }

      const response = await fetch(`${API_BASE_URL}/themes`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save theme");
      }

      const result = await response.json();
      res.json(result);
    } catch (error: any) {
      console.error("Error saving theme with upload:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get Permissions settings
  app.get("/api/settings/permissions", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const permissionsConfig = await apiRequest<any>(`/settings?type=${PERMISSIONS_SETTING_NAME}`, {
        token: session.token,
      });
      
      const settings = permissionsConfig?.setting || permissionsConfig;
      
      if (settings?.permissions && Array.isArray(settings.permissions)) {
        res.json({ permissions: settings.permissions });
      } else {
        res.json({ permissions: [] });
      }
    } catch (error: any) {
      console.error("Error fetching permissions settings:", error);
      res.json({ permissions: [] });
    }
  });

  // Save Permissions settings
  app.post("/api/settings/permissions", async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({ error: "Permissions must be an array" });
      }

      await apiRequest(`/settings`, {
        method: "POST",
        token: session.token,
        body: {
          name: PERMISSIONS_SETTING_NAME,
          sync: false,
          setting: {
            permissions: permissions,
          },
        },
      });

      res.json({ message: "Permissions saved successfully" });
    } catch (error: any) {
      console.error("Error saving permissions:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
