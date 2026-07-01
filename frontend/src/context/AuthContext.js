import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMe, logout as apiLogout, api } from "@/lib/api";

const AuthContext = createContext(null);

const SESSION_KEY = "evaone_session_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap bearer token from localStorage (fallback when browser blocks cross-site cookies).
  // NOTE: httpOnly cookies are still set primarily; localStorage is a secondary fallback.
  useEffect(() => {
    try {
      const t = localStorage.getItem(SESSION_KEY);
      if (t) api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    } catch (e) {
      console.debug("localStorage unavailable — falling back to cookie-only auth", e?.message);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch (e) {
      if (e?.response?.status && e.response.status !== 401) {
        console.warn("Auth check failed:", e.response.status, e.response.data);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.warn("Logout API call failed (proceeding with local cleanup):", e?.message);
    }
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.debug("localStorage removeItem failed:", e?.message);
    }
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refresh: checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
