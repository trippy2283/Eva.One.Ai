import React from "react";
import {
  LayoutDashboard, Sparkles, Box, ShoppingCart, BarChart3,
  Users, DollarSign, Settings, Search, Bell, ChevronDown, ChevronRight,
} from "lucide-react";
import { EvaLogo } from "@/components/marketing/EvaLogo";

const SIDEBAR = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Sparkles, label: "AI Creation" },
  { icon: Box, label: "3D Studio" },
  { icon: ShoppingCart, label: "Marketplace" },
  { icon: BarChart3, label: "Analytics", chevron: true },
  { icon: Users, label: "Community" },
  { icon: DollarSign, label: "Earnings" },
  { icon: Settings, label: "Settings" },
];

const STATS = [
  { label: "Total Earned", value: "$12,045,230", spark: true },
  { label: "Active Users", value: "128K", delta: "+12.3%" },
  { label: "AI Assets Created", value: "24.5K", delta: "+8.7%" },
  { label: "Uptime", value: "Always Active", sub: "Uptime" },
];

const ACTIVITY = [
  { label: "New asset purchased", time: "2m ago" },
  { label: "Model published", time: "15m ago" },
  { label: "Royalty earned", time: "1h ago" },
];

// A smooth performance-chart polyline
const CHART = "0,70 12,55 24,62 36,40 48,48 60,28 72,36 84,20 96,30 108,16";

export function DashboardPreview() {
  return (
    <div className="eva-panel overflow-hidden rounded-2xl shadow-2xl">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <EvaLogo size={22} to="#" />
        <div className="flex items-center gap-3 text-white/50">
          <Search size={15} />
          <Bell size={15} />
          <span className="flex items-center gap-1 text-xs">
            <span className="w-5 h-5 rounded-full bg-violet-500/30 border border-violet-400/40" />
            <ChevronDown size={13} />
          </span>
        </div>
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="hidden sm:block w-40 border-r border-white/5 p-2.5 space-y-1">
          {SIDEBAR.map((s) => (
            <div
              key={s.label}
              className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[11px] ${
                s.active
                  ? "bg-gradient-to-r from-violet-600/40 to-blue-600/30 text-white border border-violet-400/30"
                  : "text-white/55"
              }`}
            >
              <span className="flex items-center gap-2">
                <s.icon size={13} />
                {s.label}
              </span>
              {s.chevron && <ChevronRight size={11} />}
            </div>
          ))}
        </aside>

        {/* main */}
        <div className="flex-1 p-3 space-y-3 min-w-0">
          {/* stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {STATS.map((st) => (
              <div key={st.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <div className="text-[9px] uppercase tracking-wide text-white/45">{st.label}</div>
                <div className="mt-1 text-sm font-semibold text-white truncate">{st.value}</div>
                {st.delta && <div className="text-[9px] text-emerald-400 mt-0.5">{st.delta}</div>}
                {st.sub && <div className="text-[9px] text-white/40 mt-0.5">{st.sub}</div>}
                {st.spark && (
                  <svg viewBox="0 0 108 40" className="w-full h-5 mt-1" preserveAspectRatio="none">
                    <polyline
                      points="0,34 18,26 36,30 54,14 72,20 90,8 108,12"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* performance chart */}
            <div className="lg:col-span-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-white/70">Performance Overview</span>
                <span className="text-[9px] text-white/40 border border-white/10 rounded px-1.5 py-0.5">
                  This Month
                </span>
              </div>
              <svg viewBox="0 0 108 80" className="w-full h-24" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={`${CHART} 108,80 0,80`} fill="url(#perfFill)" />
                <polyline points={CHART} fill="none" stroke="#8b5cf6" strokeWidth="2" />
              </svg>
            </div>

            {/* coming soon */}
            <div className="rounded-lg border border-violet-400/20 bg-gradient-to-b from-violet-600/10 to-transparent p-3 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl eva-ring flex items-center justify-center mb-2">
                <Box size={16} className="text-violet-200" />
              </div>
              <div className="text-xs font-semibold text-white">Coming Soon</div>
              <div className="text-[9px] text-white/50 mt-1">Exciting new features are on the way.</div>
            </div>
          </div>

          {/* recent activity */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[11px] text-white/70 mb-2">Recent Activity</div>
            <div className="space-y-1.5">
              {ACTIVITY.map((a) => (
                <div key={a.label} className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-2 text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {a.label}
                  </span>
                  <span className="text-white/35">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
