import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeSession, onboard, api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { EvaAvatar } from "@/components/EvaAvatar";

export function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("Establishing secure session");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) {
      setError("Missing session_id in callback URL.");
      return;
    }
    const sessionId = decodeURIComponent(m[1]);

    (async () => {
      try {
        setStage("Verifying with Google");
        const data = await exchangeSession(sessionId);
        // Store session_token in localStorage as a fallback in case the
        // cross-site cookie was blocked by the browser.
        if (data?.session_token) {
          try { localStorage.setItem("evaone_session_token", data.session_token); } catch {}
          api.defaults.headers.common["Authorization"] = `Bearer ${data.session_token}`;
        }
        setUser(data.user);
        setStage("Initializing workspace");
        try { await onboard(); } catch {}
        window.history.replaceState({}, document.title, "/");
        navigate("/", { replace: true });
      } catch (e) {
        console.error("Auth callback error", e);
        const detail = e?.response?.data?.detail || e?.message || "Authentication failed.";
        setError(detail);
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#030304] px-6" data-testid="auth-callback">
      <EvaAvatar state={error ? "idle" : "thinking"} size={120} />
      <div className="label-eyebrow">{error ? "AUTH ERROR" : stage}</div>
      {!error && (
        <div className="text-xs font-mono text-white/40 tracking-widest uppercase">One moment…</div>
      )}
      {error && (
        <div className="text-sm text-red-300 max-w-md text-center">
          {error}
          <div className="mt-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="btn-ghost rounded-lg px-4 py-2 text-xs"
              data-testid="auth-error-back"
            >
              Back to home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
