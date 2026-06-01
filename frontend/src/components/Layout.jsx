import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  MessagesSquare,
  Archive,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Crown,
  CheckSquare,
  Brain,
  Users,
  Heart,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Footer } from "@/components/Footer";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutGrid, testid: "nav-command-center", end: true, role: "guest" },
  { to: "/chat", label: "EvaOne Chat", icon: MessagesSquare, testid: "nav-eva-chat", role: "guest" },
  { to: "/boardroom", label: "Boardroom", icon: Crown, testid: "nav-boardroom", role: "member" },
  { to: "/approvals", label: "Approvals", icon: CheckSquare, testid: "nav-approvals", role: "member" },
  { to: "/memory", label: "Memory", icon: Brain, testid: "nav-memory", role: "member" },
  { to: "/vault", label: "Vault", icon: Archive, testid: "nav-vault", role: "member" },
  { to: "/files", label: "Files", icon: FileText, testid: "nav-files", role: "guest" },
  { to: "/team", label: "Team", icon: Users, testid: "nav-team", role: "admin" },
  { to: "/health", label: "Health", icon: Heart, testid: "nav-health", role: "admin" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testid: "nav-settings", role: "guest" },
];

const ROLE_ORDER = { guest: 0, member: 1, studio_operator: 2, admin: 3, executive: 4, owner: 5 };
function canSee(userRole, minRole) {
  return (ROLE_ORDER[userRole] ?? 0) >= (ROLE_ORDER[minRole] ?? 0);
}

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (user) api.get("/me/usage").then((r) => setUsage(r.data)).catch(() => {});
  }, [user]);

  const visibleNav = NAV.filter((n) => canSee(user?.role || "guest", n.role));

  return (
    <div className="min-h-screen flex bg-[#030304] text-white">
      {/* Left rail */}
      <aside
        className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 z-40 eva-glass-heavy border-r border-white/5"
        data-testid="left-rail"
      >
        <div className="px-6 pt-7 pb-5">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
            data-testid="brand-logo"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/30 to-violet-500/30 border border-cyan-400/30 flex items-center justify-center eva-glow-cyan">
              <Sparkles size={18} className="text-cyan-300" />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-white/50">EVAONE</div>
              <div className="text-sm font-semibold tracking-tight">Executive OS</div>
              <div className="text-[9px] font-mono text-white/35 mt-0.5">MENTALLY CREATIVE STUDIOS</div>
            </div>
          </div>
        </div>

        <div className="px-3 mt-2 space-y-1 flex-1 overflow-y-auto">
          <div className="label-eyebrow px-3 py-2">Workspace</div>
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={item.testid}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                    : "text-white/70 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`
              }
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="px-3 pb-5 space-y-3">
          {usage && (
            <button
              onClick={() => navigate("/pricing")}
              className="w-full text-left eva-glass rounded-xl p-3 hover:border-cyan-500/30 transition"
              data-testid="usage-pill"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
                <span className="text-white/40">PLAN</span>
                <span className="text-cyan-300">{usage.plan?.toUpperCase()}</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/45 mb-1">
                  <span>CHATS</span>
                  <span>{usage.chat_used} / {usage.chat_quota}</span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (usage.chat_used / Math.max(1, usage.chat_quota)) * 100)}%`, boxShadow: "0 0 8px #00F0FF" }} />
                </div>
              </div>
              {usage.is_guest && (
                <div className="mt-2 text-[10px] text-amber-300 font-mono uppercase tracking-widest flex items-center gap-1">
                  <Zap size={9} /> Guest mode — sign in to save
                </div>
              )}
            </button>
          )}
          <div className="eva-glass rounded-xl p-3 flex items-center gap-3" data-testid="user-card">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-9 h-9 rounded-full border border-white/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm">
                {user?.name?.[0] || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate flex items-center gap-1">
                {user?.name}
                {user?.role === "owner" && <Crown size={11} className="text-cyan-300" />}
              </div>
              <div className="text-[11px] text-white/40 truncate font-mono uppercase tracking-widest">
                {user?.is_guest ? "GUEST" : user?.role?.toUpperCase()}
              </div>
            </div>
            <button
              onClick={logout}
              data-testid="logout-button"
              className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-cyan-300 transition"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 eva-glass-heavy border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-300" />
          <span className="font-mono text-[11px] tracking-[0.3em]">EVAONE.AI</span>
        </div>
        <button onClick={logout} className="text-xs text-white/60">Logout</button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 eva-glass-heavy border-t border-white/5 flex overflow-x-auto">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[72px] py-2 text-[10px] shrink-0 ${
                isActive ? "text-cyan-300" : "text-white/60"
              }`
            }
            data-testid={`mobile-${item.testid}`}
          >
            <item.icon size={18} />
            <span className="mt-0.5">{item.label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0 flex flex-col min-h-screen">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
