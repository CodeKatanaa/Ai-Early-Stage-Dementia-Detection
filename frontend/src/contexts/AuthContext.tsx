/**
 * AuthContext.tsx  — UPDATED
 * ───────────────────────────
 * Replace the original src/contexts/AuthContext.tsx with this file.
 *
 * Changes from original:
 *  - login() and signup() now call the Flask backend (apiLogin / apiSignup)
 *  - Token is stored in localStorage via api.ts helpers
 *  - History is fetched from /api/history (not localStorage)
 *  - addTestResult() POSTs to /api/assess via the ScreeningTest page
 *    (the context just refreshes history from the server)
 *  - Backward-compatible: all component imports of useAuth() still work.
 */

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from "react";
import {
  apiLogin, apiSignup, apiLogout, apiGetMe, apiGetHistory,
  getToken, clearToken,
  type BackendUser, type TestResult,
} from "@/services/api";

// ── Types (kept compatible with original) ─────────────────────────────────
export interface UserProfile {
  fullName:       string;
  age:            number;
  email:          string;
  phone:          string;
  caretakerName:  string;
  caretakerPhone: string;
  password:       string;   // kept for interface compat — never sent to backend
  avatar?:        string;
}

export type { TestResult };

interface AuthContextType {
  user:            UserProfile | null;
  backendUser:     BackendUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  history:         TestResult[];
  login:           (email: string, password: string) => Promise<boolean>;
  signup:          (profile: UserProfile) => Promise<void>;
  logout:          () => void;
  updateProfile:   (profile: Partial<UserProfile>) => void;
  addTestResult:   (result: TestResult) => void;
  refreshHistory:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// ── Map backend user → UserProfile (frontend shape) ───────────────────────
function toProfile(u: BackendUser): UserProfile {
  return {
    fullName:       u.full_name || "",
    age:            u.age || 0,
    email:          u.email || "",
    phone:          u.phone || "",
    caretakerName:  u.caretaker_name || "",
    caretakerPhone: u.caretaker_phone || "",
    password:       "",        // never stored on client
    avatar:         u.avatar,
  };
}

// ──────────────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,        setUser]        = useState<UserProfile | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [history,     setHistory]     = useState<TestResult[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  // ── Restore session on mount ───────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (!token) { setIsLoading(false); return; }
      try {
        const bu = await apiGetMe();
        setBackendUser(bu);
        setUser(toProfile(bu));
        const hist = await apiGetHistory();
        setHistory(hist);
      } catch {
        clearToken();           // token expired / invalid
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiLogin(email, password);
      setBackendUser(res.user);
      setUser(toProfile(res.user));
      // Load history
      const hist = await apiGetHistory();
      setHistory(hist);
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Signup ────────────────────────────────────────────────────────────
  const signup = useCallback(async (profile: UserProfile): Promise<void> => {
    const res = await apiSignup({
      fullName:        profile.fullName,
      age:             profile.age,
      email:           profile.email,
      phone:           profile.phone,
      caretakerName:   profile.caretakerName,
      caretakerPhone:  profile.caretakerPhone,
      password:        profile.password,
      confirmPassword: profile.password,
    });
    setBackendUser(res.user);
    setUser(toProfile(res.user));
    setHistory([]);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setBackendUser(null);
    setHistory([]);
  }, []);

  // ── Update profile (optimistic) ───────────────────────────────────────
  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...partial } : null);
  }, []);

  // ── Add result (called by ResultsPage after navigation) ───────────────
  const addTestResult = useCallback((result: TestResult) => {
    setHistory(prev => {
      // avoid duplicates by id
      const exists = prev.some(r => r.id === result.id);
      return exists ? prev : [result, ...prev];
    });
  }, []);

  // ── Refresh history from server ───────────────────────────────────────
  const refreshHistory = useCallback(async () => {
    try {
      const hist = await apiGetHistory();
      setHistory(hist);
    } catch { /* silently fail */ }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, backendUser, isAuthenticated: !!user, isLoading,
      history, login, signup, logout, updateProfile,
      addTestResult, refreshHistory,
    }}>
      {children}
    </AuthContext.Provider>
  );
};