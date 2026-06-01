import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listApprovals, approveAction, rejectAction, deleteApproval, integrationsStatus } from "@/lib/api";
import { toast } from "sonner";

const PROVIDER_META = {
  gmail:    { icon: Mail,          label: "Gmail",    color: "#FF4D6D" },
  calendar: { icon: Calendar,      label: "Calendar", color: "#3DDC97" },
  slack:    { icon: MessageSquare, label: "Slack",    color: "#8A2BE2" },
  notion:   { icon: FileText,      label: "Notion",   color: "#fff" },
  hubspot:  { icon: Users,         label: "HubSpot",  color: "#FFB454" },
  internal: { icon: FileText,      label: "Internal", color: "#00F0FF" },
};

const STATUS_META = {
  pending:  { color: "#FFB454", label: "PENDING" },
  approved: { color: "#3DDC97", label: "APPROVED" },
  rejected: { color: "#888",    label: "REJECTED" },
  executed: { color: "#00F0FF", label: "EXECUTED" },
  failed:   { color: "#FF4D6D", label: "FAILED" },
};

export function Approvals() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [statusMap, setStatusMap] = useState({});
  const [active, setActive] = useState(null);

  const load = async () => {
    try {
      const [list, st] = await Promise.all([
        listApprovals(filter === "all" ? undefined : filter),
        integrationsStatus(),
      ]);
      setItems(list);
      setStatusMap(st);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const handleApprove = async (id) => {
    try {
      const updated = await approveAction(id);
      toast.success(
        updated?.execution_result?.mocked
          ? "Approved — execution MOCKED until API keys connected"
          : "Approved & executed"
      );
      if (active?.id === id) setActive(updated);
      load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Approve failed"); }
  };

  const handleReject = async (id) => {
    try {
      await rejectAction(id);
      toast.success("Rejected");
      if (active?.id === id) setActive(null);
      load();
    } catch { toast.error("Reject failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this draft?")) return;
    await deleteApproval(id);
    if (active?.id === id) setActive(null);
    load();
  };

  const counts = items.reduce((m, x) => { m[x.status] = (m[x.status] || 0) + 1; return m; }, {});

  return (
    <div className="p-6 md:p-10 max-w-[1500px] mx-auto" data-testid="approvals-page">
      <header className="mb-6">
        <div className="label-eyebrow">EXECUTION GATE</div>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">
          Approval <span className="text-cyan-300 font-semibold">Queue</span>
        </h1>
        <p className="mt-2 text-sm text-white/55 max-w-2xl">
          Every outbound action Eva drafts lands here first. You approve, reject, or delete. No external actions execute without your sign-off.
        </p>
      </header>

      {/* Integration status row */}
      <div className="eva-glass rounded-2xl p-4 mb-5" data-testid="integration-status-row">
        <div className="label-eyebrow mb-3">INTEGRATION STATUS</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(statusMap).map(([key, val]) => {
            const meta = PROVIDER_META[key] || PROVIDER_META.internal;
            const Icon = meta.icon;
            return (
              <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5" data-testid={`integ-${key}`}>
                <Icon size={14} style={{ color: meta.color }} />
                <span className="text-xs flex-1">{meta.label}</span>
                <span className={`text-[10px] font-mono uppercase tracking-widest ${val.connected ? "text-cyan-300" : "text-amber-300"}`}>
                  {val.connected ? "LIVE" : "MOCKED"}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[10px] font-mono text-white/40 tracking-widest uppercase">
          Connect real keys in /app/backend/.env to switch from MOCKED to LIVE execution.
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap" data-testid="approval-filters">
        {["pending", "executed", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`filter-${f}`}
            className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-full border transition ${
              filter === f
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 hover:border-white/20 text-white/60"
            }`}
          >
            {f}{f === "pending" && counts.pending ? ` (${counts.pending})` : ""}
          </button>
        ))}
      </div>

      <div className={`grid ${active ? "lg:grid-cols-[1fr_480px]" : ""} gap-6`}>
        <section data-testid="approvals-list">
          {items.length === 0 ? (
            <div className="eva-glass rounded-2xl p-10 text-center">
              <CheckCircle2 size={28} className="text-cyan-300 mx-auto" />
              <h3 className="mt-3 text-base font-semibold">No {filter !== "all" ? filter : ""} drafts</h3>
              <p className="text-xs text-white/45 mt-1">
                When Eva drafts an outbound action — an email, a Slack message, a Notion page — it will appear here for your review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((a) => {
                const meta = PROVIDER_META[a.provider] || PROVIDER_META.internal;
                const stMeta = STATUS_META[a.status] || STATUS_META.pending;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={a.id}
                    layout
                    className={`eva-glass rounded-2xl p-4 cursor-pointer transition hover:border-cyan-500/20 ${active?.id === a.id ? "border-cyan-500/40" : ""}`}
                    onClick={() => setActive(a)}
                    data-testid={`approval-${a.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${meta.color}14`, border: `1px solid ${meta.color}44` }}
                      >
                        <Icon size={16} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{a.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
                          <span style={{ color: meta.color }}>{meta.label}</span>
                          <span className="text-white/30">·</span>
                          <span style={{ color: stMeta.color }}>{stMeta.label}</span>
                          <span className="text-white/30">·</span>
                          <span className="text-white/40">{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      {a.status === "pending" && (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApprove(a.id); }}
                            data-testid={`approve-${a.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 text-xs flex items-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(a.id); }}
                            data-testid={`reject-${a.id}`}
                            className="px-2.5 py-1.5 rounded-lg btn-ghost text-xs flex items-center gap-1"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <AnimatePresence>
          {active && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="eva-glass rounded-2xl p-5 sticky top-6 self-start"
              data-testid="approval-detail"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <div className="label-eyebrow">DRAFT</div>
                  <h3 className="mt-1 text-base font-semibold tracking-tight truncate">{active.title}</h3>
                </div>
                <button onClick={() => handleDelete(active.id)} className="text-white/30 hover:text-red-300" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4 text-[10px] font-mono uppercase tracking-widest">
                <span style={{ color: (PROVIDER_META[active.provider] || PROVIDER_META.internal).color }}>
                  {(PROVIDER_META[active.provider] || PROVIDER_META.internal).label}
                </span>
                <span className="text-white/30">·</span>
                <span style={{ color: (STATUS_META[active.status] || STATUS_META.pending).color }}>
                  {(STATUS_META[active.status] || STATUS_META.pending).label}
                </span>
              </div>

              {active.notes && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/20 text-[11px] text-amber-200 flex gap-2">
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  <span>{active.notes}</span>
                </div>
              )}

              <div className="label-eyebrow mb-2">PAYLOAD</div>
              <pre className="text-[11px] font-mono whitespace-pre-wrap bg-white/[0.02] p-3 rounded-lg border border-white/5 max-h-60 overflow-y-auto text-white/70">
                {JSON.stringify(active.payload, null, 2)}
              </pre>

              {active.execution_result && (
                <>
                  <div className="label-eyebrow mt-4 mb-2">EXECUTION</div>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap bg-white/[0.02] p-3 rounded-lg border border-white/5 text-white/70">
                    {JSON.stringify(active.execution_result, null, 2)}
                  </pre>
                </>
              )}

              {active.status === "pending" && (
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => handleApprove(active.id)}
                    className="flex-1 btn-cyan rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                    data-testid="approve-detail-btn"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(active.id)}
                    className="btn-ghost rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
