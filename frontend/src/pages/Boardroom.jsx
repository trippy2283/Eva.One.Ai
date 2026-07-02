import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Lightbulb,
  Cpu,
  Megaphone,
  Calculator,
  Plus,
  Play,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import {
  listBoardroomSessions,
  createBoardroomSession,
  runBoardroom,
  getBoardroomSession,
  deleteBoardroomSession,
  getPersonas,
} from "@/lib/api";
import { toast } from "sonner";

const ICONS = { ceo: Crown, cpo: Lightbulb, cto: Cpu, cmo: Megaphone, cfo: Calculator };

export function Boardroom() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [active, setActive] = useState(null);
  const [running, setRunning] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");

  const load = useCallback(async () => {
    const [s, p] = await Promise.all([listBoardroomSessions(), getPersonas()]);
    setSessions(s);
    setPersonas(p);
    if (sessionId) {
      try { setActive(await getBoardroomSession(sessionId)); } catch { setActive(null); }
    } else if (s.length === 0) {
      setShowNew(true);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const personaMap = useMemo(() => Object.fromEntries(personas.map((p) => [p.id, p])), [personas]);

  const handleCreate = async () => {
    if (!topic.trim()) { toast.error("Topic required"); return; }
    setRunning(true);
    try {
      const created = await createBoardroomSession({ topic, context });
      setSessions((p) => [created, ...p]);
      navigate(`/boardroom/${created.id}`);
      toast.info("Convening the board…");
      const done = await runBoardroom(created.id);
      setActive(done);
      setSessions((p) => p.map((s) => (s.id === done.id ? done : s)));
      setShowNew(false);
      setTopic("");
      setContext("");
      toast.success("Board meeting complete");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Boardroom run failed");
    } finally {
      setRunning(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Delete this board session?")) return;
    await deleteBoardroomSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (active?.id === id) {
      setActive(null);
      navigate("/boardroom");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto" data-testid="boardroom-page">
      <header className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="label-eyebrow">VIRTUAL C-SUITE</div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            AI <span className="text-cyan-300 font-semibold">Boardroom</span>
          </h1>
          <p className="mt-2 text-sm text-white/55 max-w-2xl">
            Five executive personas debate your decision. Structured friction surfaces blind spots before you spend capital.
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setActive(null); navigate("/boardroom"); }}
          className="btn-cyan rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2"
          data-testid="convene-board-btn"
        >
          <Plus size={14} /> Convene board
        </button>
      </header>

      {/* Persona Roster */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6" data-testid="persona-roster">
        {personas.map((p) => {
          const Icon = ICONS[p.id] || Sparkles;
          return (
            <div key={p.id} className="eva-glass rounded-xl p-3 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${p.color}1a`, border: `1px solid ${p.color}55`, boxShadow: `0 0 16px ${p.color}33` }}
              >
                <Icon size={16} style={{ color: p.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 truncate">{p.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Sessions list */}
        <aside data-testid="boardroom-sessions-list">
          <div className="label-eyebrow mb-3">PAST MEETINGS</div>
          {sessions.length === 0 && (
            <div className="text-xs text-white/40">No meetings yet.</div>
          )}
          <div className="space-y-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActive(s); setShowNew(false); navigate(`/boardroom/${s.id}`); }}
                data-testid={`board-session-${s.id}`}
                className={`group w-full text-left px-3 py-2.5 rounded-xl border text-sm transition ${
                  active?.id === s.id
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-100"
                    : "border-white/5 hover:border-cyan-500/20 text-white/80 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 flex-1">{s.topic}</span>
                  <span
                    onClick={(e) => handleDelete(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-300 shrink-0"
                  >
                    <Trash2 size={11} />
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
                  <StatusPill status={s.status} />
                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Detail or new */}
        <section>
          {showNew && !active && (
            <NewMeetingForm
              topic={topic}
              context={context}
              setTopic={setTopic}
              setContext={setContext}
              onSubmit={handleCreate}
              running={running}
            />
          )}
          {active && !running && <MeetingResult session={active} personaMap={personaMap} onRerun={() => navigate(`/boardroom/${active.id}`)} />}
          {running && <MeetingInProgress topic={topic || active?.topic} />}
          {!showNew && !active && !running && (
            <div className="eva-glass rounded-2xl p-10 text-center">
              <div className="label-eyebrow">EMPTY</div>
              <h3 className="mt-3 text-lg font-semibold">Pick a past meeting or convene a new board.</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NewMeetingForm({ topic, context, setTopic, setContext, onSubmit, running }) {
  const examples = [
    "Should we launch a $49/mo paid tier now or stay free for 6 more months?",
    "We're losing 60% of users after day 3. What's the highest-leverage retention fix?",
    "Should we hire a senior engineer or invest the budget in marketing?",
    "Build vs buy: our analytics stack — should we use Posthog or roll our own?",
  ];
  return (
    <div className="eva-glass rounded-2xl p-6" data-testid="new-meeting-form">
      <div className="label-eyebrow">NEW BOARD MEETING</div>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">What decision needs the board?</h3>

      <div className="mt-5">
        <label className="label-eyebrow">TOPIC</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="State the decision or strategic question…"
          rows={2}
          data-testid="board-topic-input"
          className="mt-1.5 w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/40 resize-none placeholder:text-white/30"
        />
      </div>
      <div className="mt-4">
        <label className="label-eyebrow">CONTEXT (optional but recommended)</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Numbers, constraints, history. E.g., 200 users, 30% WAU, $8k/mo burn, 9-month runway"
          rows={4}
          data-testid="board-context-input"
          className="mt-1.5 w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/40 resize-none placeholder:text-white/30"
        />
      </div>

      <div className="mt-5">
        <div className="label-eyebrow mb-2">EXAMPLES</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setTopic(ex)}
              className="text-left text-xs px-3 py-2 rounded-lg border border-white/5 hover:border-cyan-500/30 text-white/70 hover:text-white transition"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!topic.trim() || running}
        data-testid="convene-submit-btn"
        className="mt-6 btn-cyan rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {running ? <><Loader2 size={14} className="animate-spin" /> Convening…</> : <><Play size={14} /> Convene the board</>}
      </button>
    </div>
  );
}

function MeetingInProgress({ topic }) {
  return (
    <div className="eva-glass rounded-2xl p-10 text-center" data-testid="meeting-running">
      <div className="flex justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Sparkles size={26} className="text-cyan-300" />
          </div>
        </div>
      </div>
      <div className="mt-5 label-eyebrow">BOARD IN SESSION</div>
      <h3 className="mt-2 text-lg font-semibold">CEO is calling the meeting to order.</h3>
      <p className="mt-2 text-sm text-white/55 max-w-md mx-auto">
        Five executives are debating. CFO is sharpening the numbers. Expect 20-40 seconds.
      </p>
      {topic && <div className="mt-4 text-xs italic text-white/50 max-w-xl mx-auto">"{topic}"</div>}
    </div>
  );
}

function MeetingResult({ session, personaMap }) {
  const r = session.result || {};
  return (
    <div data-testid="meeting-result">
      <div className="eva-glass rounded-2xl p-6 mb-4">
        <div className="label-eyebrow">AGENDA</div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{session.topic}</h2>
        {r.agenda && r.agenda !== session.topic && (
          <p className="mt-2 text-sm text-white/60">{r.agenda}</p>
        )}
        {session.context && (
          <details className="mt-3 text-xs text-white/40">
            <summary className="cursor-pointer hover:text-white/60">Context provided</summary>
            <pre className="mt-2 whitespace-pre-wrap font-mono">{session.context}</pre>
          </details>
        )}
      </div>

      {/* Rounds */}
      <div className="space-y-3 mb-4" data-testid="boardroom-rounds">
        {(r.rounds || []).map((round, i) => {
          const p = personaMap[round.persona] || { name: round.persona?.toUpperCase(), color: "#00F0FF" };
          const Icon = ICONS[round.persona] || Sparkles;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="eva-glass rounded-2xl p-5 flex gap-4"
              style={{ borderLeft: `3px solid ${p.color}` }}
              data-testid={`round-${round.persona}-${round.type}`}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${p.color}1a`, border: `1px solid ${p.color}55` }}
              >
                <Icon size={18} style={{ color: p.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: p.color }}>{p.name}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                    {round.type}
                  </span>
                </div>
                <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{round.content}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Synthesis */}
      {r.synthesis && (
        <div className="eva-glass rounded-2xl p-6 mb-4 eva-glow-cyan" data-testid="synthesis-block">
          <div className="flex items-center gap-2">
            <Crown size={18} className="text-cyan-300" />
            <div className="label-eyebrow text-cyan-300">CEO SYNTHESIS</div>
          </div>
          <p className="mt-3 text-base text-white/95 leading-relaxed">{r.synthesis}</p>
        </div>
      )}

      {/* Action plan + Risks */}
      <div className="grid md:grid-cols-2 gap-4">
        {r.action_plan?.length > 0 && (
          <div className="eva-glass rounded-2xl p-5" data-testid="action-plan-block">
            <div className="label-eyebrow text-cyan-300">ACTION PLAN</div>
            <ol className="mt-3 space-y-2">
              {r.action_plan.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/85">
                  <span className="font-mono text-cyan-300 shrink-0">{i + 1}.</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {r.risks?.length > 0 && (
          <div className="eva-glass rounded-2xl p-5" data-testid="risks-block">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-300" />
              <div className="label-eyebrow text-amber-300">RISKS</div>
            </div>
            <ul className="mt-3 space-y-2">
              {r.risks.map((rk, i) => (
                <li key={i} className="text-sm text-white/80 flex gap-2">
                  <span className="cyan-dot mt-1.5 shrink-0" style={{ background: "#FFB454", boxShadow: "0 0 8px #FFB454" }} />
                  <span>{rk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {r.confidence && (
        <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-white/40">
          Board confidence: <span className={
            r.confidence === "high" ? "text-cyan-300" :
            r.confidence === "medium" ? "text-amber-300" : "text-red-300"
          }>{r.confidence}</span>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: { color: "#888" },
    running: { color: "#8A2BE2" },
    complete: { color: "#00F0FF" },
    failed: { color: "#FF4D6D" },
  };
  const s = map[status] || map.pending;
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
      <span style={{ color: s.color }}>{status}</span>
    </span>
  );
}
