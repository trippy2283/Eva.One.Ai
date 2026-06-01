import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeSession, onboard } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { EvaAvatar } from "@/components/EvaAvatar";

export function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(null);

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
        const data = await exchangeSession(sessionId);
        setUser(data.user);
        // First-run starter content
        try { await onboard(); } catch {}
        // Clean hash and navigate
        window.history.replaceState({}, document.title, "/");
        navigate("/", { replace: true, state: { user: data.user } });
      } catch (e) {
        console.error(e);
        setError("Authentication failed. Please try again.");
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#030304]" data-testid="auth-callback">
      <EvaAvatar state="thinking" size={120} />
      <div className="label-eyebrow">{error ? "ERROR" : "ESTABLISHING SECURE SESSION"}</div>
      {error && (
        <div className="text-sm text-red-300 max-w-md text-center">
          {error}
          <button
            onClick={() => (window.location.href = "/login")}
            className="ml-2 underline text-cyan-300"
          >
            Back to login
          </button>
        </div>
      )}
    </div>
  );
}
