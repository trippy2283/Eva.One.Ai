import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

const FEATURE_LABELS = {
  vault: "Knowledge Vault",
  long_term_memory: "Long-term memory",
  multi_model: "Multi-model routing",
  boardroom: "AI Boardroom (5–8 personas)",
  voice: "Voice mode",
  integrations: "Integrations (Gmail, Slack, Notion, HubSpot)",
  agent_workflows: "Agent workflows",
  advanced_automations: "Advanced automations",
  priority_models: "Priority model access",
  team_collab: "Team collaboration",
  multi_user: "Multi-user workspace",
  shared_vault: "Shared vault",
  team_agents: "Team agents",
  admin_controls: "Admin controls",
  analytics: "Analytics",
};

const TIER_HIGHLIGHTS = {
  free:      ["25 chats/month", "3 file uploads/month", "Single model (Claude)", "Limited memory"],
  creator:   ["250 chats/month", "25 file uploads", "Vault + Long-term memory", "3 models"],
  founder:   ["1,000 chats/month", "100 uploads", "Boardroom AI", "Voice mode", "Integrations"],
  executive: ["5,000 chats/month", "500 uploads", "Advanced automations", "Priority models", "Team collab"],
  studio:    ["25,000 chats/month", "5,000 uploads", "Multi-user workspace", "Shared vault & team agents", "Admin controls + analytics"],
};

const POPULAR = "founder";

export function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    api.get("/plans").then((r) => setPlans(r.data)).catch(() => {});
  }, []);

  const handleCheckout = async (planId) => {
    if (!user || user.is_guest) {
      // Force signup for guests
      const redirect = window.location.origin + "/pricing";
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
      return;
    }
    if (planId === "free") {
      navigate("/");
      return;
    }
    setLoading(planId);
    try {
      const res = await api.post("/billing/checkout", {
        plan_id: planId,
        origin_url: window.location.origin,
      });
      window.location.href = res.data.url;
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not start checkout");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030304] text-white" data-testid="pricing-page">
      <header className="px-6 py-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm hover:text-cyan-300" data-testid="back-home">
            <Sparkles size={14} className="text-cyan-300" /> EvaOne
          </button>
          {user && !user.is_guest && (
            <div className="text-xs text-white/50 font-mono">
              Current: <span className="text-cyan-300 uppercase">{user.plan}</span>
            </div>
          )}
        </div>
      </header>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="label-eyebrow">PRICING</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-light tracking-tight">
            Scale Eva to <span className="text-cyan-300 font-semibold">your stage</span>.
          </h1>
          <p className="mt-4 text-sm text-white/55">
            Start free. Upgrade when EvaOne becomes the operating system of your day.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-5 gap-3" data-testid="plans-grid">
          {plans.map((p, i) => {
            const popular = p.id === POPULAR;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`eva-glass rounded-2xl p-6 flex flex-col ${popular ? "eva-glow-cyan border-cyan-500/40" : ""}`}
                data-testid={`plan-${p.id}`}
              >
                {popular && (
                  <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-300 mb-2">MOST POPULAR</div>
                )}
                <div className="text-lg font-semibold tracking-tight">{p.label}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-light text-white">${p.price}</span>
                  <span className="text-xs text-white/40">/ mo</span>
                </div>

                <ul className="mt-5 space-y-2 flex-1">
                  {(TIER_HIGHLIGHTS[p.id] || []).map((line, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-white/75">
                      <Check size={12} className={popular ? "text-cyan-300 mt-1 shrink-0" : "text-white/50 mt-1 shrink-0"} />
                      <span>{line}</span>
                    </li>
                  ))}
                  {p.features.slice(0, 6).map((f) => (
                    <li key={f} className="flex gap-2 text-xs text-white/55">
                      <Check size={11} className="text-white/30 mt-1 shrink-0" />
                      <span>{FEATURE_LABELS[f] || f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(p.id)}
                  disabled={loading === p.id || (user?.plan === p.id && !user?.is_guest)}
                  data-testid={`subscribe-${p.id}`}
                  className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${
                    popular ? "btn-cyan" : "btn-ghost"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {loading === p.id ? <Loader2 size={14} className="animate-spin" /> : null}
                  {user?.plan === p.id && !user?.is_guest
                    ? "Current plan"
                    : p.id === "free"
                      ? "Stay free"
                      : <>Subscribe <ArrowRight size={12} /></>}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto mt-10 text-center text-[11px] font-mono uppercase tracking-widest text-white/40">
          Test mode active · Use Stripe test card 4242 4242 4242 4242 · Any future date · Any CVC
        </div>
      </section>

      <Footer />
    </div>
  );
}
