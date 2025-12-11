import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@shared/schema";
import { apiClient, setLoggedIn, isLoggedIn, setStoredUser, removeStoredUser, getStoredUser, clearAllAuthData, setStoredToken, getStoredToken } from "./api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getStoredToken();
      const storedUser = getStoredUser();
      
      if (token && storedUser) {
        // We have both token and user stored, restore the session
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoggedIn(true);
        } catch {
          // Invalid stored data, clear it
          clearAllAuthData();
        }
      } else if (isLoggedIn() && storedUser) {
        // Legacy: logged in flag but no token
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          removeStoredUser();
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient<{ user: User; token: string; expiresIn: number }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    setLoggedIn(true);
    setStoredToken(response.token);
    setStoredUser(response.user);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout errors
    }
    clearAllAuthData();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setStoredUser(updatedUser);
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
