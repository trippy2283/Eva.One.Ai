import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMe, logout as apiLogout, api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap bearer token from localStorage (fallback for blocked cross-site cookies)
  useEffect(() => {
    try {
      const t = localStorage.getItem("evaone_session_token");
      if (t) api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    } catch {}
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If returning from OAuth callback, AuthCallback page handles auth itself
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try { await apiLogout(); } catch {}
    try { localStorage.removeItem("evaone_session_token"); } catch {}
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
