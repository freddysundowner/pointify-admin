// Generate a unique session ID that persists across page reloads
function getSessionId(): string {
  let sessionId = localStorage.getItem("pointify_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("pointify_session_id", sessionId);
  }
  return sessionId;
}

// Token storage
export function getStoredToken(): string | null {
  return localStorage.getItem("pointify_token");
}

export function setStoredToken(token: string): void {
  localStorage.setItem("pointify_token", token);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Session-Id": getSessionId(),
    ...options.headers,
  };

  // Add auth token if available
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add user data for server-side access
  const userData = localStorage.getItem("pointify_user");
  if (userData) {
    headers["X-User-Data"] = userData;
  }

  const config: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`/api${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json();
}

// Auth helpers - persist login state across page reloads
export function isLoggedIn(): boolean {
  return localStorage.getItem("pointify_logged_in") === "true";
}

export function setLoggedIn(value: boolean): void {
  if (value) {
    localStorage.setItem("pointify_logged_in", "true");
  } else {
    localStorage.removeItem("pointify_logged_in");
  }
}

export function getStoredUser(): string | null {
  return localStorage.getItem("pointify_user");
}

export function setStoredUser(user: unknown): void {
  localStorage.setItem("pointify_user", JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem("pointify_user");
  localStorage.removeItem("pointify_logged_in");
}

export function clearAllAuthData(): void {
  localStorage.removeItem("pointify_user");
  localStorage.removeItem("pointify_logged_in");
  localStorage.removeItem("pointify_session_id");
  localStorage.removeItem("pointify_token");
}
