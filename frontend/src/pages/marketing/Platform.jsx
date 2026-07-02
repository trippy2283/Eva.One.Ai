import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BrainCircuit, Box, ShoppingCart, Users, DollarSign,
  BarChart3, ShieldCheck, Zap, Layers, Cpu, GitBranch,
} from "lucide-react";
import { PageHero, SectionHeading, FeatureCard } from "@/components/marketing/PageSections";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";

const MODULES = [
  { icon: BrainCircuit, title: "AI Creation", body: "Generate next-gen models, assets and content with a unified creation engine." },
  { icon: Box, title: "3D Studio", body: "Design, sculpt and render immersive 3D experiences directly in the browser." },
  { icon: ShoppingCart, title: "Marketplace", body: "Publish, license and discover premium AI assets and tools in one economy." },
  { icon: Users, title: "Community", body: "Collaborate with creators, share workflows and grow your audience." },
  { icon: DollarSign, title: "Earnings", body: "Monetize creations with transparent royalties and instant payouts." },
  { icon: BarChart3, title: "Analytics", body: "Real-time dashboards for performance, revenue and engagement." },
];

const CAPS = [
  { icon: Zap, title: "Intelligent Automation", body: "Automate repetitive creative and operational tasks with agentic workflows." },
  { icon: ShieldCheck, title: "Secure & Decentralized", body: "Ownership-first architecture with end-to-end encryption and audit trails." },
  { icon: Layers, title: "Cross-Platform", body: "Web, desktop and mobile-ready with a consistent experience everywhere." },
  { icon: Cpu, title: "Multi-Model Engine", body: "Route across leading models for the right cost, speed and quality." },
  { icon: GitBranch, title: "Versioned Assets", body: "Every asset is tracked, branchable and reproducible by default." },
  { icon: BarChart3, title: "Live Insights", body: "Understand exactly what drives growth with real-time analytics." },
];

export function Platform() {
  const navigate = useNavigate();
  return (
    <div data-testid="eva-platform">
      <PageHero
        eyebrow="The EVA One Platform"
        title="One platform to create, explore and earn"
        subtitle="Powerful tools, real-time analytics and intelligent automation — a complete command center for AI innovation."
      >
        <button onClick={() => navigate("/login")} className="btn-eva rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-2">
          Launch App <ArrowRight size={16} />
        </button>
        <button onClick={() => navigate("/docs")} className="btn-eva-outline rounded-xl px-6 py-3 text-sm font-medium">
          Read the Docs
        </button>
      </PageHero>

      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Core Modules" title="Everything you need in one place" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((m, i) => <FeatureCard key={m.title} {...m} index={i} />)}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading center={false} eyebrow="Command Center" title="Real-time control over your AI economy" subtitle="Track earnings, monitor performance and manage every asset from a single intelligent dashboard." />
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Capabilities" title="Built for scale and ownership" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPS.map((c, i) => <FeatureCard key={c.title} {...c} index={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
