"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, setAuthHandlers, LoginDto } from "./api";

interface AuthState {
  token: string | null;
  role: string | null;
  initialized: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_STORAGE_KEY = "token";

function decodeRole(token: string): string | null {
  if (!token.includes(".")) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      setToken(stored);
      setRole(decodeRole(stored));
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    setAuthHandlers({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setRole(null);
        router.replace("/login");
      },
    });
  }, [router]);

  const login = useCallback(async (dto: LoginDto) => {
    const response = await apiLogin(dto);
    const accessToken = response.access_token;
    if (!accessToken) {
      throw new Error("Réponse d'authentification invalide");
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
    setRole(decodeRole(accessToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ token, role, initialized, login, logout }),
    [token, role, initialized, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
