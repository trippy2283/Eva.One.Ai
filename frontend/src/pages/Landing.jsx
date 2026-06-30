import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Crown, Brain, Archive, FileText, MessagesSquare, CheckCircle2, Zap } from "lucide-react";
import { EvaAvatar } from "@/components/EvaAvatar";
import { Footer } from "@/components/Footer";
import { LandingChatPreview } from "@/components/LandingChatPreview";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/b1c8a9bc524f253fb31cd77143c1ed2f841f8739c4c735e8f9da827bdadd0a57.png";

export function Landing() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleGuest = async () => {
    try {
      const res = await api.post("/guest/start", {});
      setUser(res.data.user);
      navigate("/chat");
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = () => {
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-[#030304] text-white" data-testid="landing-page">
      {/* Top nav */}
      <header className="fixed top-0 inset-x-0 z-50 eva-glass-heavy border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/30 to-violet-500/30 border border-cyan-400/30 flex items-center justify-center">
              <Sparkles size={14} className="text-cyan-300" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">EvaOne</div>
              <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">Mentally Creative Studios</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-white/70 hover:text-white">Features</a>
            <a href="#pricing" className="text-white/70 hover:text-white">Pricing</a>
            <Link to="/showcase" className="text-white/70 hover:text-white" data-testid="nav-showcase">Boardroom Showcase</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGuest}
              data-testid="try-guest-btn"
              className="btn-ghost rounded-lg px-3 py-1.5 text-xs font-medium hidden sm:block"
            >
              Try as guest
            </button>
            <button
              onClick={handleLogin}
              data-testid="sign-in-btn"
              className="btn-cyan rounded-lg px-4 py-1.5 text-xs font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="pt-32 pb-20 px-6 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(3,3,4,0.85), rgba(3,3,4,0.95)), url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="label-eyebrow"
            >
              AI EXECUTIVE OPERATING SYSTEM · BUILT BY MENTALLY CREATIVE STUDIOS
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05]"
            >
              The AI <span className="text-cyan-300 font-semibold">Chief of Staff</span><br/>
              for founders and operators.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base md:text-lg text-white/65 max-w-xl leading-relaxed"
            >
              EvaOne turns information into action. Chat. Vault. File intelligence. A virtual C-suite that
              debates your decisions. Voice. Memory. Approval-gated execution.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={handleGuest}
                data-testid="hero-try-guest"
                className="btn-cyan rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2"
              >
                <Zap size={14} /> Try as guest — no signup
              </button>
              <button
                onClick={handleLogin}
                data-testid="hero-sign-in"
                className="btn-ghost rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2"
              >
                Sign in with Google <ArrowRight size={14} />
              </button>
            </motion.div>
            <div className="mt-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
              Guest mode: 5 chats · 3 file uploads · no signup required
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-md mx-auto lg:max-w-none"
          >
            <LandingChatPreview />
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="label-eyebrow">CAPABILITIES</div>
            <h2 className="mt-3 text-4xl font-light tracking-tight">Built for the way founders actually work.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="eva-glass rounded-2xl p-6 eva-traced"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                  <m.icon size={18} className="text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{m.title}</h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">{m.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="label-eyebrow">PRICING</div>
          <h2 className="mt-3 text-4xl font-light tracking-tight">Pay only when you scale.</h2>
          <p className="mt-3 text-sm text-white/55 max-w-xl mx-auto">
            Free forever for individuals. Unlock the Boardroom, voice, and integrations on paid tiers.
          </p>
          <button
            onClick={() => navigate("/pricing")}
            data-testid="see-pricing-btn"
            className="mt-7 btn-cyan rounded-xl px-5 py-3 text-sm font-medium inline-flex items-center gap-2"
          >
            See all plans <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
          <EvaAvatar state="idle" size={120} showLabel={false} />
          <h2 className="mt-6 text-3xl font-light tracking-tight">
            Brief Eva. Decide. Execute.
          </h2>
          <p className="mt-3 text-sm text-white/55">
            Eva drafts. You approve. EvaOne never claims actions it hasn't taken.
          </p>
          <div className="mt-7 flex justify-center gap-3 flex-wrap">
            <button onClick={handleGuest} className="btn-cyan rounded-xl px-5 py-3 text-sm font-medium">
              Try as guest
            </button>
            <button onClick={handleLogin} className="btn-ghost rounded-xl px-5 py-3 text-sm font-medium">
              Sign in with Google
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const MODULES = [
  { icon: MessagesSquare, title: "EvaOne Chat",     body: "Multi-model AI (Claude, GPT, Gemini). Memory across sessions. Auto-aware of your workspace." },
  { icon: Crown,          title: "AI Boardroom",     body: "Virtual C-suite of 8 personas debates your decision. Structured friction surfaces blind spots." },
  { icon: Archive,        title: "Knowledge Vault",  body: "Notes, memories, files. Pinned, tagged, searchable. The institutional memory you've always lacked." },
  { icon: FileText,       title: "File Intelligence",body: "Upload PDFs, docs, sheets. Eva extracts summaries, key points, and concrete action items." },
  { icon: Brain,          title: "Long-Term Memory", body: "Persistent profile of your working style, decisions, people, and priorities — auto-applied." },
  { icon: CheckCircle2,   title: "Approval Queue",   body: "Drafts of every outbound action land here. You approve. Then it executes. Never before." },
];
