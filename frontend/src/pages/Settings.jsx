import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listModels } from "@/lib/api";
import { Cpu, ShieldCheck, Volume2, KeyRound, Sparkles, Check, X as XIcon } from "lucide-react";
import { EvaAvatar } from "@/components/EvaAvatar";

export function Settings() {
  const { user, logout } = useAuth();
  const [models, setModels] = useState([]);

  useEffect(() => {
    listModels().then(setModels).catch(() => {});
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-[1100px] mx-auto" data-testid="settings-page">
      <header className="mb-8">
        <div className="label-eyebrow">SYSTEM PREFERENCES</div>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">Settings</h1>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Identity */}
          <Card title="Identity" eyebrow="ACCOUNT" icon={ShieldCheck}>
            <div className="flex items-center gap-4">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="w-14 h-14 rounded-full border border-white/10" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-lg">{user?.name?.[0]}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs font-mono text-white/40 truncate">{user?.email}</div>
              </div>
              <button onClick={logout} className="btn-ghost px-3 py-1.5 rounded-lg text-xs" data-testid="logout-settings">Sign out</button>
            </div>
          </Card>

          {/* Models */}
          <Card title="Multi-Model Routing" eyebrow="AI ENGINE" icon={Cpu}>
            <p className="text-sm text-white/55 mb-3">
              Eva uses the model you pick in each chat session. Available routes:
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {models.map((m) => (
                <div key={m.id} className="border border-white/5 rounded-xl px-3 py-2.5 flex items-center justify-between" data-testid={`settings-model-${m.id}`}>
                  <div>
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">{m.provider}</div>
                  </div>
                  <Sparkles size={14} className="text-cyan-300" />
                </div>
              ))}
            </div>
          </Card>

          {/* Voice */}
          <Card title="Voice Engine" eyebrow="AUDIO LAYER" icon={Volume2}>
            <p className="text-sm text-white/55">
              Speech-to-text via OpenAI Whisper. Text-to-speech via OpenAI TTS (nova voice). Mic permission required.
            </p>
            <div className="mt-3 text-[11px] font-mono text-white/40 tracking-widest">
              · WHISPER-1 · TTS-1 · 25MB AUDIO LIMIT
            </div>
          </Card>

          {/* Keys */}
          <Card title="API Keys" eyebrow="INTEGRATIONS" icon={KeyRound}>
            <p className="text-sm text-white/55">
              EvaOne uses the Emergent Universal LLM Key for Claude, GPT, Gemini, Whisper, and TTS — all routed through a single secure credential.
            </p>
            <div className="mt-2 text-xs text-cyan-300 font-mono">EMERGENT_LLM_KEY · ACTIVE</div>
          </Card>

          {/* Capabilities — transparency */}
          <Card title="What Eva can & can't do" eyebrow="TRANSPARENCY" icon={ShieldCheck}>
            <p className="text-xs text-white/50 mb-4">
              Eva is direct about her limits. No claimed actions, no fake integrations.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div data-testid="capabilities-can">
                <div className="label-eyebrow text-cyan-300 mb-2">CAN DO TODAY</div>
                <ul className="space-y-1.5">
                  {[
                    "Chat, reason, plan, summarize",
                    "Analyze uploaded files (PDF, DOCX, XLSX, CSV, TXT, images, audio)",
                    "Read & write to your Knowledge Vault",
                    "Voice input (Whisper) & voice replies (OpenAI TTS)",
                    "Surface dashboards, projects, action items",
                    "Switch between Claude, GPT-5, Gemini per session",
                  ].map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                      <Check size={13} className="text-cyan-300 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div data-testid="capabilities-cannot">
                <div className="label-eyebrow text-white/50 mb-2">CAN'T DO (YET)</div>
                <ul className="space-y-1.5">
                  {[
                    "No access to her own configuration, subscription, or backend systems",
                    "No live internet — no real-time pricing, browsing, or external lookups",
                    "No outbound actions — won't send emails, post to Slack, charge payments, or deploy code",
                    "No third-party tool writes (Gmail, Calendar, Notion, HubSpot, Linear) — Phase 2",
                    "No cross-session memory unless you pin it to the Vault",
                    "No knowledge past model training cutoff unless you provide it",
                  ].map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                      <XIcon size={13} className="text-white/40 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 text-[10px] font-mono text-white/40 tracking-widest uppercase border-t border-white/5 pt-3">
              Approval-first execution — Eva drafts, you decide.
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <div className="eva-glass rounded-2xl p-6 text-center" data-testid="eva-presence">
            <div className="label-eyebrow mb-3">EVA PRESENCE</div>
            <div className="flex justify-center">
              <EvaAvatar state="idle" size={140} showLabel={false} />
            </div>
            <div className="mt-4 text-xs text-white/60">
              Eva is calibrated and standing by. Voice & vision layers are active.
            </div>
          </div>
          <div className="eva-glass rounded-2xl p-5">
            <div className="label-eyebrow">PHASE 2 ROADMAP</div>
            <ul className="mt-3 space-y-1.5 text-xs text-white/60">
              <li>· Agent Forge — modular agents</li>
              <li>· Workflow Engine — multi-step orchestration</li>
              <li>· Approval Queue — execution gating</li>
              <li>· Revenue Intelligence — offer & pricing</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, eyebrow, icon: Icon, children }) {
  return (
    <div className="eva-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="label-eyebrow">{eyebrow}</div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        <Icon size={16} className="text-cyan-300" />
      </div>
      {children}
    </div>
  );
}
