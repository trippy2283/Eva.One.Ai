import React from "react";
import { EvaAvatar } from "@/components/EvaAvatar";

const BG = "https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/b1c8a9bc524f253fb31cd77143c1ed2f841f8739c4c735e8f9da827bdadd0a57.png";

export function Login() {
  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(3,3,4,0.7), rgba(3,3,4,0.85)), url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          "radial-gradient(circle at 30% 30%, rgba(0,240,255,0.08), transparent 50%)," +
          "radial-gradient(circle at 70% 70%, rgba(138,43,226,0.06), transparent 50%)"
      }} />

      <div className="relative w-full max-w-md eva-glass rounded-3xl p-10 eva-glow-cyan" data-testid="login-card">
        <div className="flex flex-col items-center text-center">
          <EvaAvatar state="idle" size={130} showLabel={false} />
          <div className="label-eyebrow mt-6">EVAONE.AI · MENTALLY CREATIVE STUDIOS</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Your <span className="text-cyan-300">executive AI</span> awaits.
          </h1>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            Sign in to enter the command center. Eva is calibrated, your vault is encrypted, and your projects are ready.
          </p>

          <button
            data-testid="google-login-button"
            onClick={handleGoogle}
            className="mt-8 w-full btn-cyan rounded-xl px-5 py-3 font-medium flex items-center justify-center gap-3 transition"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="mt-6 flex items-center gap-2 text-[11px] text-white/40 font-mono tracking-widest uppercase">
            <span className="cyan-dot" /> Secure session · 7 day token · httpOnly cookie
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#00F0FF" d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.78 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.77 3.76 1.43l2.56-2.46C16.7 3.95 14.6 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.66 8.65-8.82 0-.6-.07-1.05-.15-1.5z"/>
    </svg>
  );
}
