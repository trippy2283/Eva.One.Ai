import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Play, Plus, BrainCircuit, Box, ShoppingCart, Users,
  DollarSign, CheckCircle2,
} from "lucide-react";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";

const HERO_IMG = "/assets/eva-hero.png";
const PORTAL_IMG = "/assets/eva-portal.png";

const PILLARS = [
  { icon: BrainCircuit, title: "AI CREATION", body: "Create next-gen AI assets, models and content." },
  { icon: Box, title: "3D STUDIO", body: "Design, build and bring your ideas to life in 3D." },
  { icon: ShoppingCart, title: "MARKETPLACE", body: "Buy, sell and discover premium AI assets & tools." },
  { icon: Users, title: "COMMUNITY", body: "Connect, collaborate and grow together." },
  { icon: DollarSign, title: "EARN", body: "Monetize your creations and earn in the new AI economy." },
];

const COMMAND_FEATURES = [
  "Real-time performance & insights",
  "AI-powered automation",
  "Secure, scalable & decentralized",
  "Cross-platform & easy to integrate",
];

export function Home() {
  const navigate = useNavigate();
  const launch = () => navigate("/login");

  return (
    <div data-testid="eva-home">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 lg:pt-24 lg:pb-20 grid lg:grid-cols-2 gap-10 items-center">
          {/* copy */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block rounded-full border border-violet-400/25 px-4 py-1.5 eva-eyebrow"
            >
              The Next Generation AI Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 text-6xl sm:text-7xl font-bold tracking-tight eva-wordmark leading-none"
            >
              EVA ONE
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg sm:text-xl font-light tracking-[0.35em] text-white/80"
            >
              CREATE • EXPLORE • EARN
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 text-base sm:text-lg text-white/65 max-w-lg leading-relaxed"
            >
              EVA One empowers creators, developers and visionaries to build, own
              and monetize the future with artificial intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={launch}
                className="btn-eva rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-2"
                data-testid="hero-launch"
              >
                Launch App <ArrowRight size={16} />
              </button>
              <button className="btn-eva-outline rounded-xl px-6 py-3 text-sm font-medium flex items-center gap-2">
                <span className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center">
                  <Play size={11} className="ml-0.5" />
                </span>
                Watch Trailer
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex items-center gap-10"
            >
              <div>
                <div className="text-3xl font-bold text-white">120+</div>
                <div className="text-xs text-white/50 mt-1">Creators</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <div className="text-3xl font-bold eva-text-gradient">Always Active</div>
                <div className="text-xs text-white/50 mt-1">Uptime</div>
              </div>
            </motion.div>
          </div>

          {/* visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src={HERO_IMG || "/placeholder.svg"}
                alt="EVA One neural AI figure holding a glowing orb"
                className="w-full h-auto select-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#050509]" />
            </div>

            {/* floating card: EVA panel */}
            <div className="absolute top-6 right-4 sm:right-6 eva-panel px-4 py-3 hidden sm:block">
              <div className="text-xs font-semibold tracking-[0.2em] eva-text-gradient">EVA</div>
              <ul className="mt-2 space-y-1 text-[9px] text-white/55">
                <li>◦ AI CREATION</li>
                <li>◦ 3D STUDIO</li>
                <li>◦ MARKETPLACE</li>
                <li>◦ COMMUNITY</li>
              </ul>
            </div>

            {/* floating card: earnings */}
            <div className="absolute bottom-8 right-2 sm:right-4 eva-panel px-4 py-3 hidden sm:block">
              <div className="text-[8px] uppercase tracking-widest text-white/45">Total Earned</div>
              <div className="text-sm font-bold text-white">$12,045,230</div>
              <svg viewBox="0 0 90 24" className="w-24 h-6 mt-1" preserveAspectRatio="none">
                <polyline
                  points="0,20 15,15 30,17 45,8 60,12 75,4 90,7"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================== TRUSTED BY ======================== */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto eva-panel p-6 sm:p-8">
          <div className="eva-eyebrow">
            Trusted by innovators & creators worldwide{" "}
            <span className="text-violet-300">companies</span>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="rounded-xl border border-dashed border-violet-400/40 px-6 py-4 flex items-center gap-3 text-violet-200/80">
              <span className="w-8 h-8 rounded-full border border-violet-400/40 flex items-center justify-center">
                <Plus size={15} />
              </span>
              <span className="text-xs font-medium leading-tight">
                YOUR COMPANY<br />COULD BE HERE
              </span>
            </div>
            <p className="text-sm text-white/45 max-w-xl">
              Please contact us when wanting / willing to be added to the landing
              page — inquire and more, thank you.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== BUILT FOR THE FUTURE ===================== */}
      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-[0.15em] eva-text-gradient">
            BUILT FOR THE FUTURE
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="eva-panel eva-panel-hover p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-full eva-ring flex items-center justify-center">
                  <p.icon size={22} className="text-violet-200" />
                </div>
                <h3 className="mt-5 text-sm font-bold tracking-wide text-white">{p.title}</h3>
                <p className="mt-2 text-xs text-white/50 leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMMAND CENTER ===================== */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eva-eyebrow">The EVA One Platform</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight leading-tight">
              Your Command Center<br />for AI Innovation
            </h2>
            <p className="mt-5 text-base text-white/60 max-w-md leading-relaxed">
              Powerful tools, real-time analytics and intelligent automation — all
              in one place.
            </p>
            <ul className="mt-8 space-y-4">
              {COMMAND_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 size={18} className="text-violet-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/platform")}
              className="mt-9 btn-eva-outline rounded-xl px-6 py-3 text-sm font-medium flex items-center gap-2"
            >
              Explore Platform <ArrowRight size={16} />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* ===================== CTA BANNER ===================== */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-7xl mx-auto eva-panel overflow-hidden">
          <div className="grid md:grid-cols-[220px_1fr_auto] items-center gap-6 p-6 sm:p-10">
            <img
              src={PORTAL_IMG || "/placeholder.svg"}
              alt="Glowing energy portal"
              className="w-40 h-40 mx-auto object-cover rounded-2xl"
              draggable={false}
            />
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold eva-text-gradient leading-tight">
                The Future Is Ours to Build.<br />Be Part of EVA One.
              </h2>
              <p className="mt-3 text-sm text-white/55">
                Join thousands of creators shaping the future with AI.
              </p>
            </div>
            <button
              onClick={launch}
              className="btn-eva rounded-xl px-7 py-4 text-sm font-semibold flex items-center gap-2 justify-center whitespace-nowrap"
            >
              Launch App Now <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
