import type { Express, Request, Response } from "express";
import { apiRequest, getSession } from "./utils";

export function registerAuthRoutes(app: Express) {
  // Demo mode: when DEMO_LOGIN_EMAIL and DEMO_LOGIN_PASSWORD are set in .env,
  // the login page pre-fills them. Leave them empty on a real installation.
  app.get("/api/demo-login", (_req: Request, res: Response) => {
    const email = process.env.DEMO_LOGIN_EMAIL || "";
    const password = process.env.DEMO_LOGIN_PASSWORD || "";
    res.json(email && password ? { enabled: true, email, password } : { enabled: false });
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const result = await apiRequest("/staff", {
        method: "POST",
        body: { email, password },
      });

      res.json({
        user: result.userdata,
        token: result.token,
        expiresIn: result.expiresIn,
      });
    } catch (error: any) {
      res.status(error.status || 401).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ user: session.user });
  });
}
