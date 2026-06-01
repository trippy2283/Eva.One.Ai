import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Send,
  Plus,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  Trash2,
  Library,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listSessions,
  createSession,
  deleteSession,
  listMessages,
  sendMessage,
  listModels,
  transcribeAudio,
  speakText,
} from "@/lib/api";
import { EvaAvatar } from "@/components/EvaAvatar";
import { toast } from "sonner";

function renderMarkdown(md) {
  // Tiny markdown: paragraphs, bold, italic, code, headings, lists
  if (!md) return "";
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c}</code></pre>`);
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  // Bold + italic
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Lists
  html = html.replace(/^(?:- |\* )(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]+?<\/li>)/g, (m) => `<ul>${m}</ul>`);
  // Paragraphs
  html = html
    .split(/\n{2,}/)
    .map((p) => (p.match(/^<(h\d|ul|pre)/) ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`))
    .join("");
  return html;
}

export function EvaChat() {
  const navigate = useNavigate();
  const { sessionId: routeSid } = useParams();
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [evaState, setEvaState] = useState("idle"); // idle | listening | thinking | speaking
  const [recording, setRecording] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [attachVault, setAttachVault] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const audioRef = useRef(null);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const scrollerRef = useRef(null);
  const textareaRef = useRef(null);

  // load sessions + models
  useEffect(() => {
    (async () => {
      try {
        const [s, m] = await Promise.all([listSessions(), listModels()]);
        setSessions(s);
        setModels(m);
        if (!routeSid && s.length > 0) {
          navigate(`/chat/${s[0].id}`, { replace: true });
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  // load messages for active session
  useEffect(() => {
    if (!routeSid) { setMessages([]); return; }
    (async () => {
      try {
        const m = await listMessages(routeSid);
        setMessages(m);
        const sess = sessions.find((x) => x.id === routeSid);
        if (sess?.model) setModel(sess.model);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [routeSid, sessions.length]);

  // auto-scroll
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === routeSid),
    [sessions, routeSid]
  );
  const activeModel = useMemo(
    () => models.find((m) => m.id === model),
    [models, model]
  );

  const handleNewSession = async () => {
    try {
      const s = await createSession({ model });
      setSessions((prev) => [s, ...prev]);
      navigate(`/chat/${s.id}`);
    } catch {
      toast.error("Could not create session");
    }
  };

  const handleDeleteSession = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (routeSid === id) navigate("/chat", { replace: true });
    } catch { toast.error("Failed to delete"); }
  };

  const ensureSession = async () => {
    if (routeSid) return routeSid;
    const s = await createSession({ model });
    setSessions((prev) => [s, ...prev]);
    navigate(`/chat/${s.id}`, { replace: true });
    return s.id;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const sid = await ensureSession();
    setInput("");
    setSending(true);
    setEvaState("thinking");

    // optimistic user message
    const tempUser = {
      id: `tmp_${Date.now()}`,
      session_id: sid,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUser]);

    try {
      const res = await sendMessage(sid, { content: text, model, attach_vault_context: attachVault });
      setMessages((prev) =>
        prev.filter((m) => m.id !== tempUser.id).concat([res.user_message, res.assistant_message])
      );
      // refresh sessions to get new title
      try { setSessions(await listSessions()); } catch {}
      if (voiceOn) {
        await speakResponse(res.assistant_message.content);
      } else {
        setEvaState("idle");
      }
    } catch (e) {
      console.error(e);
      toast.error("Eva could not respond");
      setMessages((prev) => prev.filter((m) => m.id !== tempUser.id));
      setEvaState("idle");
    } finally {
      setSending(false);
    }
  };

  const speakResponse = async (text) => {
    try {
      setEvaState("speaking");
      const blob = await speakText(text.slice(0, 1500));
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setEvaState("idle");
          URL.revokeObjectURL(url);
        };
        await audioRef.current.play();
      } else {
        setEvaState("idle");
      }
    } catch (e) {
      console.error("TTS failed", e);
      setEvaState("idle");
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        setRecording(false);
        setEvaState("thinking");
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          const { text } = await transcribeAudio(blob);
          if (text) {
            setInput((prev) => (prev ? prev + " " + text : text));
            textareaRef.current?.focus();
          }
        } catch (err) {
          toast.error("Could not transcribe");
        } finally {
          setEvaState("idle");
        }
      };
      mediaRecRef.current = rec;
      rec.start();
      setRecording(true);
      setEvaState("listening");
    } catch {
      toast.error("Microphone access denied");
    }
  };

  return (
    <div className="h-[100vh] md:h-screen flex" data-testid="eva-chat-page">
      {/* Sessions sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 eva-glass-heavy" data-testid="chat-sessions">
        <div className="p-4 flex items-center justify-between">
          <div className="label-eyebrow">SESSIONS</div>
          <button
            onClick={handleNewSession}
            className="btn-cyan px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"
            data-testid="new-session-btn"
          >
            <Plus size={12} /> New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {sessions.length === 0 && (
            <div className="text-xs text-white/40 px-3 py-6 text-center">
              No conversations yet. Start one with Eva.
            </div>
          )}
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/chat/${s.id}`)}
              data-testid={`session-${s.id}`}
              className={`group w-full text-left px-3 py-2.5 rounded-xl text-sm transition border ${
                routeSid === s.id
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-100"
                  : "border-transparent hover:bg-white/[0.03] text-white/80"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate flex-1">{s.title}</span>
                <span
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-300"
                >
                  <Trash2 size={12} />
                </span>
              </div>
              <div className="text-[10px] font-mono text-white/30 mt-0.5">{s.model}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat panel */}
      <section className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="px-4 md:px-8 py-4 border-b border-white/5 flex items-center justify-between gap-3 eva-glass-heavy">
          <div className="flex items-center gap-3 min-w-0">
            <EvaAvatar state={evaState} size={42} showLabel={false} />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{activeSession?.title || "New conversation"}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                EVA · {evaState}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Model selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu((v) => !v)}
                className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"
                data-testid="model-selector"
              >
                <Sparkles size={12} className="text-cyan-300" />
                <span className="hidden sm:inline">{activeModel?.label || model}</span>
                <ChevronDown size={12} />
              </button>
              <AnimatePresence>
                {showModelMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 mt-2 w-56 eva-glass-heavy rounded-xl p-1.5 z-50 border border-white/10"
                  >
                    {models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setModel(m.id);
                          setShowModelMenu(false);
                        }}
                        data-testid={`model-option-${m.id}`}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-white/[0.05] ${
                          model === m.id ? "text-cyan-300" : "text-white/80"
                        }`}
                      >
                        <span>{m.label}</span>
                        <span className="text-[9px] font-mono text-white/40 uppercase">{m.provider}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setAttachVault((v) => !v)}
              title="Attach Vault context"
              data-testid="attach-vault-toggle"
              className={`btn-ghost px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${attachVault ? "border-cyan-500/40 text-cyan-300" : ""}`}
            >
              <Library size={12} /> <span className="hidden sm:inline">Vault</span>
            </button>
            <button
              onClick={() => setVoiceOn((v) => !v)}
              title="Toggle Eva voice"
              data-testid="voice-toggle"
              className={`btn-ghost px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 ${voiceOn ? "text-cyan-300" : ""}`}
            >
              {voiceOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6" data-testid="messages-area">
          {messages.length === 0 && !sending && (
            <Welcome onPrompt={(t) => setInput(t)} />
          )}
          <div className="max-w-3xl mx-auto space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} />
              ))}
            </AnimatePresence>
            {sending && <ThinkingBubble />}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-white/5 px-4 md:px-8 py-4 eva-glass-heavy">
          <div className="max-w-3xl mx-auto">
            <div className="eva-glass rounded-2xl p-3 flex items-end gap-2">
              <button
                onClick={toggleRecording}
                title={recording ? "Stop recording" : "Voice input"}
                data-testid="mic-button"
                className={`p-2.5 rounded-xl transition ${recording ? "bg-cyan-500/20 text-cyan-300 eva-glow-cyan" : "btn-ghost"}`}
              >
                {recording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Brief Eva. Strategize. Decide."
                data-testid="chat-input"
                className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-white/30 py-2.5 px-2 max-h-40"
                style={{ minHeight: "40px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                data-testid="send-button"
                className="btn-cyan p-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="mt-2 text-[10px] font-mono text-white/30 tracking-widest text-center uppercase">
              Eva drafts. You decide. No external actions are executed without approval.
            </div>
          </div>
        </div>
        <audio ref={audioRef} className="hidden" />
      </section>
    </div>
  );
}

function MessageBubble({ m }) {
  const isUser = m.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`message-${m.role}`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-full shrink-0 mt-0.5 overflow-hidden ring-1 ring-cyan-500/30">
          <img
            src="https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/d209384f8f582cfd8a09ff3a082bbc2aaf53b1f2c8b0258e5311ea51bf9b7cc7.png"
            alt="Eva"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-cyan-500/10 border border-cyan-500/30 text-white"
            : "eva-glass text-white/95"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{m.content}</div>
        ) : (
          <div className="eva-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
        )}
        {m.model && !isUser && (
          <div className="mt-2 text-[9px] font-mono uppercase tracking-widest text-white/30">via {m.model}</div>
        )}
      </div>
    </motion.div>
  );
}

function ThinkingBubble() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
      <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-violet-500/40">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/95cf2cb9370384de0b0a289c416dcd84b6f461ec8247eb034a7852ba885283ba.png"
          alt="Thinking"
          className="w-full h-full object-cover eva-avatar-thinking"
        />
      </div>
      <div className="eva-glass rounded-2xl px-4 py-3 flex items-center gap-2">
        <span className="cyan-dot" style={{ animation: "eva-idle-pulse 1s infinite" }} />
        <span className="text-xs text-white/60 font-mono tracking-widest uppercase">Eva is processing</span>
      </div>
    </motion.div>
  );
}

function Welcome({ onPrompt }) {
  const prompts = [
    "Draft a 5-step launch plan for my new product.",
    "Summarize my last uploaded file and extract action items.",
    "Review my project priorities and tell me what to focus on this week.",
    "Brainstorm 3 ways to monetize my expertise.",
  ];
  return (
    <div className="max-w-3xl mx-auto py-8 md:py-14 text-center" data-testid="chat-welcome">
      <div className="flex justify-center">
        <EvaAvatar state="idle" size={120} />
      </div>
      <h2 className="mt-6 text-2xl md:text-3xl font-light tracking-tight">
        Brief me, and I will <span className="text-cyan-300 font-semibold">orchestrate</span>.
      </h2>
      <p className="mt-2 text-sm text-white/50 max-w-md mx-auto">
        Eva turns your inputs into structured plans, summaries, and decisions — never claims, only proposals.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onPrompt(p)}
            className="text-left text-sm px-4 py-3 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/[0.04] transition"
            data-testid={`prompt-${i}`}
          >
            <span className="text-white/80">{p}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 max-w-xl mx-auto text-[10px] font-mono tracking-widest text-white/40 uppercase border-t border-white/5 pt-4">
        Eva limits: no live internet · no outbound emails/messages · no third-party writes yet · no cross-session memory unless saved to Vault
      </div>
    </div>
  );
}
