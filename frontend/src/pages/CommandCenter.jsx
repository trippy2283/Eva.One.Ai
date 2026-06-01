import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Zap,
  Database,
  Mic,
  Cpu,
  Archive,
  FileText,
  MessagesSquare,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  dashboardStats,
  dashboardActivity,
  listProjects,
  createProject,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { EvaAvatar } from "@/components/EvaAvatar";
import { toast } from "sonner";

const MESH = "https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/6692735944b70e7bdbd07f0baa85544ac93e4d5e886af552b42e2d2ee09be9f1.png";

export function CommandCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [projects, setProjects] = useState([]);

  const load = async () => {
    try {
      const [s, a, p] = await Promise.all([
        dashboardStats(),
        dashboardActivity(),
        listProjects(),
      ]);
      setStats(s);
      setActivity(a);
      setProjects(p);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const handleQuickProject = async () => {
    const name = window.prompt("Project name?");
    if (!name) return;
    try {
      await createProject({ name, description: "", priority: "medium", progress: 0, status: "active" });
      toast.success("Project added");
      load();
    } catch {
      toast.error("Failed to create project");
    }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Late night ops";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="relative" data-testid="command-center">
      {/* Mesh backdrop */}
      <div
        className="absolute inset-0 -z-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `url(${MESH})`,
          backgroundSize: "cover",
          maskImage: "radial-gradient(ellipse at top, #000 30%, transparent 75%)",
        }}
      />

      <div className="relative p-6 md:p-10 max-w-[1400px] mx-auto">
        {/* Hero */}
        <section className="grid lg:grid-cols-[1fr_auto] gap-8 items-center mb-10" data-testid="hero-section">
          <div>
            <div className="label-eyebrow">EXECUTIVE COMMAND CENTER</div>
            <h1 className="mt-3 text-4xl md:text-5xl font-light tracking-tight">
              {greeting}, <span className="font-semibold text-white">{user?.name?.split(" ")[0] || "Operator"}</span>.
              <span className="block text-white/50 mt-2 text-2xl md:text-3xl font-light">
                Eva is ready when you are.
              </span>
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/chat")}
                className="btn-cyan px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                data-testid="quick-open-chat"
              >
                <MessagesSquare size={16} /> Start session with Eva
              </button>
              <button
                onClick={() => navigate("/files")}
                className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                data-testid="quick-open-files"
              >
                <FileText size={16} /> Upload a file
              </button>
              <button
                onClick={() => navigate("/vault")}
                className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                data-testid="quick-open-vault"
              >
                <Archive size={16} /> Open Vault
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <EvaAvatar state="idle" size={170} />
          </div>
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="stats-grid">
          <StatCard icon={MessagesSquare} label="Conversations" value={stats?.sessions ?? "—"} accent="cyan" />
          <StatCard icon={FileText} label="Files" value={stats?.files ?? "—"} sub={`${stats?.analyzed_files ?? 0} analyzed`} accent="cyan" />
          <StatCard icon={Archive} label="Vault notes" value={stats?.notes ?? "—"} accent="violet" />
          <StatCard icon={Target} label="Active projects" value={stats?.projects_active ?? "—"} sub={`${stats?.projects_total ?? 0} total`} accent="violet" />
        </section>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Left col */}
          <div className="space-y-6">
            {/* Projects */}
            <Panel
              title="Strategic priorities"
              eyebrow="ACTIVE PROJECTS"
              right={
                <button
                  onClick={handleQuickProject}
                  className="text-xs flex items-center gap-1 text-cyan-300 hover:text-cyan-200"
                  data-testid="add-project-btn"
                >
                  <Plus size={14} /> Add
                </button>
              }
            >
              {projects.length === 0 ? (
                <EmptyState
                  title="No projects yet"
                  hint="Anchor your work. Create the first priority to track progress here."
                />
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((p) => (
                    <ProjectRow key={p.id} project={p} onChange={load} />
                  ))}
                </div>
              )}
            </Panel>

            {/* Activity feed */}
            <Panel title="Recent activity" eyebrow="LIVE FEED">
              {activity.length === 0 ? (
                <EmptyState title="Quiet for now" hint="Activity will surface here as you work." />
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {activity.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="px-3 py-2.5 rounded-xl border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.02] transition flex gap-3 items-start"
                    >
                      <div className="mt-1 cyan-dot" style={{
                        background: a.type === "chat" ? "#00F0FF" : a.type === "note" ? "#8A2BE2" : "#fff",
                      }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{a.title}</div>
                        <div className="text-xs text-white/50 truncate">{a.preview}</div>
                      </div>
                      <div className="text-[10px] font-mono text-white/30">{formatTime(a.at)}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* Right col */}
          <div className="space-y-6">
            {/* System health */}
            <Panel title="System health" eyebrow="OPERATIONAL STATUS" testid="system-health">
              <div className="space-y-2.5">
                <HealthRow icon={Cpu} label="LLM Router" status={stats?.system_health?.llm} />
                <HealthRow icon={Database} label="Object Storage" status={stats?.system_health?.storage} />
                <HealthRow icon={Mic} label="Voice Engine" status={stats?.system_health?.voice} />
                <HealthRow icon={Archive} label="Knowledge Vault" status={stats?.system_health?.vault} />
              </div>
            </Panel>

            {/* Open action items */}
            <Panel title="Action items" eyebrow="EXTRACTED FROM FILES" testid="open-actions">
              {stats?.open_actions?.length ? (
                <ul className="space-y-2">
                  {stats.open_actions.map((a, i) => (
                    <li key={i} className="flex gap-2 items-start text-sm">
                      <CheckCircle2 size={14} className="mt-1 text-cyan-300 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white/90 leading-snug">{a.action}</div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5 truncate">
                          from {a.filename}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No items" hint="Upload & analyze a file to surface action items." />
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent = "cyan" }) {
  const color = accent === "violet" ? "#8A2BE2" : "#00F0FF";
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="eva-glass rounded-2xl p-5 eva-traced"
      data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="flex items-center justify-between">
        <div className="label-eyebrow">{label}</div>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="mt-3 text-3xl font-light tracking-tight font-mono" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-white/40 font-mono mt-1">{sub}</div>}
    </motion.div>
  );
}

function Panel({ title, eyebrow, right, children, testid }) {
  return (
    <div className="eva-glass rounded-2xl p-6" data-testid={testid}>
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="label-eyebrow">{eyebrow}</div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function HealthRow({ icon: Icon, label, status }) {
  const ok = status === "operational";
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-white/80">
        <Icon size={14} className="text-white/50" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-mono">
        <span className="cyan-dot" style={{ background: ok ? "#00F0FF" : "#FF6B6B", boxShadow: `0 0 8px ${ok ? "#00F0FF" : "#FF6B6B"}` }} />
        <span className={ok ? "text-cyan-300" : "text-red-300"}>{ok ? "OPERATIONAL" : "DEGRADED"}</span>
      </div>
    </div>
  );
}

function ProjectRow({ project, onChange }) {
  const colors = { critical: "#FF4D6D", high: "#FFB454", medium: "#00F0FF", low: "#8A2BE2" };
  const c = colors[project.priority] || "#00F0FF";
  return (
    <div className="border border-white/5 rounded-xl p-3.5 hover:border-cyan-500/20 transition" data-testid={`project-${project.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="cyan-dot" style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
            <span className="text-sm font-medium truncate">{project.name}</span>
          </div>
          {project.description && (
            <div className="text-xs text-white/50 mt-1 line-clamp-1">{project.description}</div>
          )}
        </div>
        <span className="text-[10px] font-mono uppercase text-white/40 tracking-widest">{project.priority}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: c, boxShadow: `0 0 8px ${c}` }} />
        </div>
        <span className="text-[10px] font-mono text-white/40">{project.progress}%</span>
      </div>
    </div>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="text-sm text-white/60">{title}</div>
      {hint && <div className="text-xs text-white/40 mt-1">{hint}</div>}
    </div>
  );
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  } catch {
    return "";
  }
}
