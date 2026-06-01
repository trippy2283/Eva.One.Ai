import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, ArrowLeft, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { Footer } from "@/components/Footer";

const PERSONA_COLORS = {
  ceo: "#00F0FF", cpo: "#8A2BE2", cto: "#3DDC97", cmo: "#FFB454", cfo: "#FF4D6D",
  coo: "#7DD3FC", legal: "#CBD5E1", investor: "#F472B6",
};

export function PublicShowcase() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/public/boardroom").then((r) => setList(r.data)).catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-[#030304] text-white" data-testid="public-showcase">
      <header className="px-6 py-5 border-b border-white/5 sticky top-0 eva-glass-heavy z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm hover:text-cyan-300">
            <Sparkles size={14} className="text-cyan-300" /> EvaOne
          </Link>
          <Link to="/" className="text-xs text-white/55 hover:text-white flex items-center gap-1"><ArrowLeft size={12}/> Home</Link>
        </div>
      </header>

      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="label-eyebrow">PUBLIC SHOWCASE</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-light tracking-tight">
            Real board meetings <span className="text-cyan-300 font-semibold">EvaOne ran</span>.
          </h1>
          <p className="mt-4 text-sm text-white/55 max-w-2xl mx-auto">
            Owners publish completed Boardroom sessions here. See structured executive debate before you sign up.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4" data-testid="showcase-grid">
          {list.length === 0 && (
            <div className="md:col-span-2 eva-glass rounded-2xl p-10 text-center text-sm text-white/45">
              No published board sessions yet. Sign up and publish your own.
            </div>
          )}
          {list.map((s) => (
            <Link
              key={s.id}
              to={`/showcase/${s.id}`}
              className="eva-glass rounded-2xl p-6 hover:border-cyan-500/30 transition eva-traced block"
              data-testid={`showcase-card-${s.id}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Crown size={14} className="text-cyan-300" />
                <span className="label-eyebrow">BOARDROOM</span>
              </div>
              <h3 className="text-base font-semibold tracking-tight line-clamp-2">{s.topic}</h3>
              {s.result?.synthesis && (
                <p className="mt-2 text-sm text-white/55 line-clamp-3">{s.result.synthesis}</p>
              )}
              <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
                {(s.result?.rounds || []).slice(0, 6).map((r, i) => (
                  <span key={i} className="w-2 h-2 rounded-full" style={{ background: PERSONA_COLORS[r.persona] || "#fff" }} />
                ))}
                <span className="ml-2">{(s.result?.action_plan || []).length} actions</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export function PublicShowcaseDetail() {
  const { sid } = useParams();
  const [doc, setDoc] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get(`/public/boardroom/${sid}`).then((r) => setDoc(r.data)).catch((e) => setErr(e?.response?.data?.detail || "Not found"));
  }, [sid]);

  if (err) return (
    <div className="min-h-screen bg-[#030304] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-sm text-red-300">{err}</div>
        <Link to="/showcase" className="mt-4 inline-block btn-ghost rounded-lg px-4 py-2 text-xs">Back to showcase</Link>
      </div>
    </div>
  );
  if (!doc) return <div className="min-h-screen bg-[#030304] flex items-center justify-center text-white/45 text-sm">Loading…</div>;
  const r = doc.result || {};

  return (
    <div className="min-h-screen bg-[#030304] text-white" data-testid="public-showcase-detail">
      <header className="px-6 py-5 border-b border-white/5 sticky top-0 eva-glass-heavy z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm hover:text-cyan-300">
            <Sparkles size={14} className="text-cyan-300" /> EvaOne
          </Link>
          <Link to="/showcase" className="text-xs text-white/55 hover:text-white flex items-center gap-1"><ArrowLeft size={12}/> Showcase</Link>
        </div>
      </header>

      <section className="px-6 py-14 max-w-3xl mx-auto">
        <div className="label-eyebrow">PUBLISHED BOARDROOM</div>
        <h1 className="mt-3 text-3xl md:text-4xl font-light tracking-tight">{doc.topic}</h1>
        {r.agenda && <p className="mt-3 text-sm text-white/60">{r.agenda}</p>}

        <div className="mt-8 space-y-3">
          {(r.rounds || []).map((round, i) => {
            const color = PERSONA_COLORS[round.persona] || "#00F0FF";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="eva-glass rounded-2xl p-5"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold uppercase" style={{ color }}>{round.persona}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{round.type}</span>
                </div>
                <p className="text-sm text-white/85 leading-relaxed">{round.content}</p>
              </motion.div>
            );
          })}
        </div>

        {r.synthesis && (
          <div className="mt-6 eva-glass rounded-2xl p-6 eva-glow-cyan">
            <div className="flex items-center gap-2"><Crown size={16} className="text-cyan-300" /> <span className="label-eyebrow text-cyan-300">CEO SYNTHESIS</span></div>
            <p className="mt-3 text-base text-white/95 leading-relaxed">{r.synthesis}</p>
          </div>
        )}

        {r.action_plan?.length > 0 && (
          <div className="mt-4 eva-glass rounded-2xl p-5">
            <div className="label-eyebrow text-cyan-300">ACTION PLAN</div>
            <ol className="mt-3 space-y-2">
              {r.action_plan.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/85">
                  <span className="font-mono text-cyan-300 shrink-0">{i + 1}.</span><span>{a}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-white/55">Want one of these for your own decision?</p>
          <Link to="/" className="mt-3 btn-cyan rounded-xl px-5 py-3 text-sm font-medium inline-block">Run your own boardroom</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
