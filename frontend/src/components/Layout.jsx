import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  MessagesSquare,
  Archive,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutGrid, testid: "nav-command-center", end: true },
  { to: "/chat", label: "Eva Chat", icon: MessagesSquare, testid: "nav-eva-chat" },
  { to: "/vault", label: "Vault", icon: Archive, testid: "nav-vault" },
  { to: "/files", label: "Files", icon: FileText, testid: "nav-files" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testid: "nav-settings" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
              <div className="font-mono text-[10px] tracking-[0.3em] text-white/50">EVAONE.AI</div>
              <div className="text-sm font-semibold tracking-tight">Executive OS</div>
            </div>
          </div>
        </div>

        <div className="px-3 mt-2 space-y-1 flex-1">
          <div className="label-eyebrow px-3 py-2">Workspace</div>
          {NAV.map((item) => (
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

        <div className="px-3 pb-5">
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
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-[11px] text-white/40 truncate font-mono">{user?.email}</div>
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
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 eva-glass-heavy border-t border-white/5 grid grid-cols-5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-[10px] ${
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
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
