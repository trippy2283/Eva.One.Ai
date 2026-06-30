import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Loader2, Lock } from "lucide-react";
import { api, sendMessage, createSession } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { EvaAvatar } from "@/components/EvaAvatar";
import { toast } from "sonner";

/**
 * Embedded Eva preview chat for the public landing page.
 * - First message auto-creates a guest session (no login needed)
 * - Tracks guest usage; at quota shows clear "sign up to continue" CTA
 * - All messages persist on backend under the guest user
 */
export function LandingChatPreview() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I'm Eva — your AI Chief of Staff. Ask me anything strategic. Free preview: 5 messages, no signup needed.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [evaState, setEvaState] = useState("idle");
  const [sessionId, setSessionId] = useState(null);
  const [usage, setUsage] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (user) api.get("/me/usage").then((r) => setUsage(r.data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const ensureGuestAndSession = async () => {
    let currentUser = user;
    if (!currentUser) {
      const res = await api.post("/guest/start", {});
      currentUser = res.data.user;
      setUser(currentUser);
    }
    if (sessionId) return { user: currentUser, sid: sessionId };
    const s = await createSession({ model: "claude-sonnet-4-6" });
    setSessionId(s.id);
    return { user: currentUser, sid: s.id };
  };

  const refreshUsage = async () => {
    try { setUsage((await api.get("/me/usage")).data); } catch {}
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    setEvaState("thinking");
    setMessages((m) => [...m, { role: "user", content: text }]);

    try {
      const { sid } = await ensureGuestAndSession();
      const res = await sendMessage(sid, { content: text, model: "claude-sonnet-4-6" });
      setMessages((m) => [...m, { role: "assistant", content: res.assistant_message.content }]);
      setEvaState("speaking");
      setTimeout(() => setEvaState("idle"), 800);
      refreshUsage();
    } catch (e) {
      const status = e?.response?.status;
      const detail = e?.response?.data?.detail || "Eva couldn't respond.";
      if (status === 402) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "You've reached the free preview limit. Sign in or sign up to continue with Eva — and unlock memory, file intelligence, and the AI Boardroom.",
            cta: true,
          },
        ]);
      } else {
        toast.error(detail);
      }
      setEvaState("idle");
    } finally {
      setSending(false);
    }
  };

  const handleSignIn = () => {
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const isGuestQuota = usage && usage.is_guest;
  const remaining = usage ? Math.max(0, usage.chat_quota - usage.chat_used) : 5;
  const atLimit = usage && usage.chat_used >= usage.chat_quota;

  return (
    <div className="eva-glass rounded-3xl overflow-hidden eva-glow-cyan" data-testid="landing-preview-chat">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 eva-glass-heavy">
        <EvaAvatar state={evaState} size={42} showLabel={false} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">Try Eva — Live preview</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">
            {atLimit ? "PREVIEW LIMIT REACHED" : `${remaining} OF ${usage?.chat_quota || 5} FREE MESSAGES LEFT`}
          </div>
        </div>
        <button
          onClick={handleSignIn}
          data-testid="preview-sign-in"
          className="btn-cyan rounded-lg px-3 py-1.5 text-xs font-medium hidden sm:flex items-center gap-1.5"
        >
          <Lock size={11} /> Sign in
        </button>
      </div>

      <div ref={scrollerRef} className="px-5 py-5 h-[360px] overflow-y-auto space-y-3" data-testid="preview-messages">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-cyan-500/10 border border-cyan-500/30 text-white"
                  : "eva-glass text-white/90"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.cta && (
                <button
                  onClick={handleSignIn}
                  className="mt-3 btn-cyan rounded-lg px-3 py-1.5 text-xs font-medium w-full"
                  data-testid="preview-cta-signin"
                >
                  Sign in with Google to continue
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex">
            <div className="eva-glass rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <Loader2 size={12} className="text-cyan-300 animate-spin" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/55">Eva is thinking</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/5 eva-glass-heavy">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            rows={1}
            disabled={atLimit}
            placeholder={atLimit ? "Sign in to keep going…" : "Ask Eva anything strategic…"}
            data-testid="preview-input"
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-white/30 py-2 px-2 max-h-32 disabled:opacity-50"
            style={{ minHeight: "36px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || atLimit}
            data-testid="preview-send"
            className="btn-cyan p-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <div className="mt-2 text-[10px] font-mono text-white/35 tracking-widest text-center uppercase">
          No signup · Real Claude responses · Limited to 5 messages
        </div>
      </div>
    </div>
  );
}
