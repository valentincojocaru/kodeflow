import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "client" | "admin";
  company?: string;
  phone?: string;
  avatar_color?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
  adminSecret?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("pykode_token"));
  const [loading, setLoading] = useState(true);

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    let data: any = {};
    try {
      const text = await res.text();
      if (text) data = JSON.parse(text);
    } catch {
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      return data;
    }
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }, [token]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiFetch("/api/auth/me")
      .then(setUser)
      .catch(() => { localStorage.removeItem("pykode_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, [token, apiFetch]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("pykode_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (regData: RegisterData) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(regData),
    });
    localStorage.setItem("pykode_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("pykode_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export async function authFetch(url: string, token: string | null, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let data: any = {};
  try {
    const text = await res.text();
    if (text) data = JSON.parse(text);
  } catch {
    if (!res.ok) throw new Error(`Server error (${res.status})`);
    return data;
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
