import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { EvaAvatar } from "@/components/EvaAvatar";

export function BillingSuccess() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState("checking");
  const [planId, setPlanId] = useState(null);
  const polled = useRef(false);

  useEffect(() => {
    if (polled.current) return;
    polled.current = true;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (!sid) { setStatus("error"); return; }

    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const res = await api.get(`/billing/status/${sid}`);
        setPlanId(res.data.plan_id);
        if (res.data.payment_status === "paid" && res.data.status === "complete") {
          setStatus("paid");
          if (refresh) refresh();
          return;
        }
        if (res.data.status === "expired") { setStatus("expired"); return; }
        if (attempts >= 10) { setStatus("timeout"); return; }
        setTimeout(poll, 2000);
      } catch {
        if (attempts >= 5) setStatus("error");
        else setTimeout(poll, 2000);
      }
    };
    poll();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-[#030304] text-white flex items-center justify-center px-6" data-testid="billing-success-page">
      <div className="eva-glass rounded-3xl p-10 max-w-md w-full text-center eva-glow-cyan">
        <div className="flex justify-center mb-6">
          <EvaAvatar state={status === "paid" ? "speaking" : "thinking"} size={120} showLabel={false} />
        </div>

        {status === "checking" && (
          <>
            <Loader2 size={26} className="text-cyan-300 mx-auto animate-spin" />
            <div className="label-eyebrow mt-4">CONFIRMING PAYMENT</div>
            <h2 className="mt-2 text-xl font-semibold">Eva is finalizing your upgrade…</h2>
          </>
        )}
        {status === "paid" && (
          <>
            <CheckCircle2 size={28} className="text-cyan-300 mx-auto" />
            <div className="label-eyebrow mt-4 text-cyan-300">UPGRADED</div>
            <h2 className="mt-2 text-2xl font-semibold">
              Welcome to <span className="text-cyan-300">{planId ? planId.toUpperCase() : "your new plan"}</span>.
            </h2>
            <p className="mt-2 text-sm text-white/55">
              All gated features just unlocked. Eva is ready when you are.
            </p>
            <button
              onClick={() => navigate("/")}
              data-testid="enter-eva-btn"
              className="mt-7 btn-cyan rounded-xl px-5 py-3 text-sm font-medium w-full"
            >
              Enter the command center
            </button>
          </>
        )}
        {(status === "expired" || status === "timeout" || status === "error") && (
          <>
            <XCircle size={26} className="text-red-300 mx-auto" />
            <div className="label-eyebrow mt-4 text-red-300">
              {status === "expired" ? "SESSION EXPIRED" : status === "timeout" ? "TIMED OUT" : "ERROR"}
            </div>
            <h2 className="mt-2 text-xl font-semibold">Couldn't confirm payment.</h2>
            <p className="mt-2 text-sm text-white/55">No charge was made. Try again or contact support.</p>
            <button onClick={() => navigate("/pricing")} className="mt-6 btn-cyan rounded-xl px-5 py-3 text-sm w-full">
              Back to pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
}
