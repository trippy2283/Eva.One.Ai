import React, { useEffect, useState } from "react";
import { Heart, Activity, Database, Cpu, Mic, CreditCard, ShieldAlert, RefreshCw, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

const ICON_MAP = {
  "MongoDB": Database,
  "Object Storage": Database,
  "LLM Router": Cpu,
  "Voice Engine": Mic,
  "Billing (Stripe)": CreditCard,
};

export function Health() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData((await api.get("/health/diagnostics")).data); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto" data-testid="health-page">
      <header className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="label-eyebrow">RESPONSIBLE SELF-HEALING · MONITOR MODE</div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            System <span className="text-cyan-300 font-semibold">Health</span>
          </h1>
          <p className="mt-2 text-sm text-white/55 max-w-2xl">
            EvaOne continuously monitors itself. Diagnostics, alerts, recovery suggestions — never silent code edits.
          </p>
        </div>
        <button onClick={load} className="btn-ghost rounded-lg px-3 py-2 text-xs flex items-center gap-2" data-testid="refresh-health">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Refresh
        </button>
      </header>

      {data && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`eva-glass rounded-2xl p-6 mb-5 flex items-center gap-4 ${data.overall === "operational" ? "eva-glow-cyan" : ""}`}
            data-testid="overall-status"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
              background: data.overall === "operational" ? "rgba(0,240,255,0.1)" : "rgba(255,77,109,0.1)",
              border: `1px solid ${data.overall === "operational" ? "rgba(0,240,255,0.3)" : "rgba(255,77,109,0.3)"}`,
            }}>
              <Heart size={22} style={{ color: data.overall === "operational" ? "#00F0FF" : "#FF4D6D" }} />
            </div>
            <div className="flex-1">
              <div className="label-eyebrow">OVERALL STATUS</div>
              <div className="text-2xl font-semibold tracking-tight mt-1">
                EvaOne is <span style={{ color: data.overall === "operational" ? "#00F0FF" : "#FF4D6D" }}>{data.overall}</span>
              </div>
              <div className="text-[10px] font-mono text-white/40 mt-1 tracking-widest">
                MODE: {data.self_healing_mode?.toUpperCase()} · LAST CHECK {new Date(data.checked_at).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="subsystem-grid">
            {data.checks.map((c, i) => {
              const Icon = ICON_MAP[c.name] || Activity;
              const ok = c.status === "operational";
              return (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="eva-glass rounded-2xl p-5"
                  data-testid={`check-${c.name.replace(/[^a-z]/gi,'').toLowerCase()}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={ok ? "text-cyan-300" : "text-red-300"} />
                      <div>
                        <div className="text-sm font-semibold">{c.name}</div>
                        <div className="text-[10px] font-mono uppercase tracking-widest mt-0.5"
                             style={{ color: ok ? "#00F0FF" : "#FF4D6D" }}>{c.status}</div>
                      </div>
                    </div>
                    <span className="cyan-dot" style={{ background: ok ? "#00F0FF" : "#FF4D6D", boxShadow: `0 0 10px ${ok ? "#00F0FF" : "#FF4D6D"}` }} />
                  </div>
                  {c.error && <div className="mt-3 text-xs text-red-300 line-clamp-3">{c.error}</div>}
                  {!c.error && <div className="mt-3 text-xs text-white/45">All systems nominal.</div>}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 eva-glass rounded-2xl p-5" data-testid="recovery-info">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={14} className="text-amber-300" />
              <div className="label-eyebrow text-amber-300">RECOVERY POLICY</div>
            </div>
            <ul className="space-y-1.5 text-xs text-white/65">
              <li>· Auto-retry on transient LLM / storage failures (no code edits)</li>
              <li>· Anomalies are surfaced to admins, not auto-fixed</li>
              <li>· Code changes always require: <span className="text-cyan-300">Owner/Admin approval → Review → Deploy → Audit</span></li>
              <li>· Every self-action attempt is recorded in the audit log</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
