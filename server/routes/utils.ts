import type { Request } from "express";

// URL of the ReggyPOS API (set REGGYPOS_API_URL in .env), without a trailing slash.
export const REGGYPOS_API_URL = (process.env.REGGYPOS_API_URL || "http://localhost:3000").replace(/\/+$/, "");

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const config: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const url = `${REGGYPOS_API_URL}${endpoint}`;
  console.log(`[API] ${config.method} ${url}`);
  
  const response = await fetch(url, config);
  
  // Handle 204 No Content responses (common for DELETE)
  if (response.status === 204) {
    return { success: true } as T;
  }

  const contentType = response.headers.get("content-type") || "";
  
  // Check if response body is empty
  const text = await response.text();
  if (!text || text.trim() === "") {
    if (response.ok) {
      return { success: true } as T;
    }
    const error = new Error("Empty response from API") as any;
    error.status = response.status;
    throw error;
  }
  
  if (!contentType.includes("application/json")) {
    console.error(`[API] Non-JSON response from ${url}:`, text.substring(0, 200));
    const error = new Error("API returned non-JSON response") as any;
    error.status = response.status;
    throw error;
  }

  const data = JSON.parse(text);

  if (!response.ok) {
    const error = new Error(data.error || data.message || "Request failed") as any;
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getSession(req: Request): { token: string; user: any } | undefined {
  // The admin server keeps no sessions of its own: every request must carry the
  // staff token, which the ReggyPOS API verifies on each call.
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return undefined;
  const token = authHeader.substring(7).trim();
  if (!token) return undefined;
  let user: any = {};
  const userDataHeader = req.headers["x-user-data"] as string;
  if (userDataHeader) {
    try {
      user = JSON.parse(userDataHeader);
    } catch {
      user = {};
    }
  }
  return { token, user };
}
