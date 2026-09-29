'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  telegram?: string;
  name: string;
  role: 'ADMIN' | 'RESELLER';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
}

export interface Reseller {
  id: string;
  telegram?: string;
  balance: string;
  currency: string;
  companyName?: string;
  pricingTier?: string;
}

interface AuthContextType {
  user: User | null;
  reseller: Reseller | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { telegram: string; email?: string; password: string; name: string; companyName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const refreshProfile = async () => {
    const savedToken = localStorage.getItem('sakura_token');
    if (!savedToken) {
      setUser(null);
      setReseller(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setUser({
          id: data.id,
          email: data.email,
          telegram: data.telegram,
          name: data.name,
          role: data.role,
          status: data.status,
        });
        if (data.reseller) {
          setReseller(data.reseller);
        }
        setToken(savedToken);
      } else {
        logout();
      }
    } catch {
      // Offline fallback: keep token if present or wait
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
    // Real-time profile and balance sync every 6 seconds
    const interval = setInterval(() => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('sakura_token') : null;
      if (saved) {
        refreshProfile();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || json.message || 'Login failed',
        };
      }

      const payload = json.data || json;
      const receivedToken = payload.accessToken;

      localStorage.setItem('sakura_token', receivedToken);
      setToken(receivedToken);
      setUser(payload.user);
      setReseller(payload.reseller || null);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to backend',
      };
    }
  };

  const register = async (data: { telegram: string; email?: string; password: string; name: string; companyName?: string }) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || json.message || 'Registration failed',
        };
      }

      const payload = json.data || json;
      const receivedToken = payload.accessToken;

      localStorage.setItem('sakura_token', receivedToken);
      setToken(receivedToken);
      setUser(payload.user);
      setReseller(payload.reseller || null);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to backend',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('sakura_token');
    setToken(null);
    setUser(null);
    setReseller(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        reseller,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
