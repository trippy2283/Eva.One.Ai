import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";
import { api } from "@/lib/api";
import { EvaAvatar } from "@/components/EvaAvatar";

export function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/invites/preview/${token}`)
      .then((r) => setInvite(r.data))
      .catch((e) => setError(e?.response?.data?.detail || "Invalid invite"));
  }, [token]);

  const handleAccept = () => {
    // Save token so backend can match after Google OAuth roundtrip — handled by email match.
    sessionStorage.setItem("evaone_invite_token", token);
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-[#030304] text-white flex items-center justify-center px-6" data-testid="invite-accept-page">
      <div className="eva-glass rounded-3xl p-10 max-w-md w-full text-center eva-glow-cyan">
        <div className="flex justify-center">
          <EvaAvatar state="idle" size={110} showLabel={false} />
        </div>
        {!invite && !error && (
          <div className="mt-6">
            <Loader2 size={24} className="text-cyan-300 mx-auto animate-spin" />
            <div className="label-eyebrow mt-3">CHECKING INVITE</div>
          </div>
        )}
        {error && (
          <div className="mt-6">
            <XCircle size={28} className="text-red-300 mx-auto" />
            <h2 className="mt-3 text-lg font-semibold">{error}</h2>
            <button onClick={() => navigate("/")} className="mt-5 btn-ghost rounded-xl px-4 py-2 text-sm">Back home</button>
          </div>
        )}
        {invite && (
          <div className="mt-6">
            <Shield size={26} className="text-cyan-300 mx-auto" />
            <div className="label-eyebrow mt-3 text-cyan-300">EVAONE INVITATION</div>
            <h2 className="mt-3 text-2xl font-light tracking-tight">
              You've been invited to join as
            </h2>
            <div className="mt-2 text-cyan-300 text-3xl font-semibold uppercase tracking-tight">
              {invite.role.replace("_", " ")}
            </div>
            <p className="mt-4 text-xs text-white/55">
              Invited as <span className="text-white font-mono">{invite.email}</span><br/>
              by {invite.invited_by_email}
            </p>
            <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-white/35">
              Expires {new Date(invite.expires_at).toLocaleString()}
            </p>
            {invite.status !== "pending" ? (
              <div className="mt-6 text-amber-300 text-sm">This invite is already {invite.status}.</div>
            ) : (
              <button
                onClick={handleAccept}
                data-testid="accept-invite-btn"
                className="mt-6 btn-cyan rounded-xl px-5 py-3 text-sm w-full font-medium"
              >
                Accept & sign in with Google
              </button>
            )}
            <div className="mt-3 text-[10px] font-mono text-white/30 tracking-widest">
              You must use the email <span className="text-white/60">{invite.email}</span> when signing in.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
