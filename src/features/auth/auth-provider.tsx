import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, ApiError } from "@/lib/api/client";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/api/auth-storage";
import { accountKeys } from "@/lib/account/queries";
import type { CustomerUser } from "@/lib/account/types";

interface AuthResponse {
  token: string;
  user: CustomerUser;
}

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<CustomerUser>;
  register: (name: string, email: string, password: string) => Promise<CustomerUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>("/api/auth/login", { email, password });
      setAuthToken(res.token);
      setToken(res.token);
      queryClient.setQueryData(accountKeys.me, res.user);
      return res.user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<AuthResponse>("/api/auth/register", { name, email, password });
      setAuthToken(res.token);
      setToken(res.token);
      queryClient.setQueryData(accountKeys.me, res.user);
      return res.user;
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
    queryClient.removeQueries({ queryKey: accountKeys.me });
    queryClient.removeQueries({ queryKey: ["admin"] });
  }, [queryClient]);

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), login, register, logout }),
    [token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
