import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { listMemories, createMemory, updateMemory, deleteMemory } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "working_style", label: "Working style", desc: "How you like to work, communicate, decide", color: "#00F0FF" },
  { id: "priority",      label: "Priorities",    desc: "What matters most right now",             color: "#8A2BE2" },
  { id: "decision",      label: "Decisions",     desc: "Choices you've made that future plans should respect", color: "#3DDC97" },
  { id: "person",        label: "People",        desc: "Co-founders, clients, advisors, recurring contacts", color: "#FFB454" },
  { id: "preference",    label: "Preferences",   desc: "Style, tone, format you favor",            color: "#FF4D6D" },
  { id: "context",       label: "Ongoing context", desc: "Anything Eva should know about your situation",     color: "#fff" },
];

export function Memory() {
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [editor, setEditor] = useState(null);

  const load = async () => {
    try { setItems(await listMemories(activeCat || undefined)); }
    catch (e) { console.error(e); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [activeCat]);

  const openNew = (category = "context") =>
    setEditor({ category, label: "", content: "", importance: 6 });
  const openEdit = (m) => setEditor({ ...m });

  const handleSave = async () => {
    if (!editor.label.trim() || !editor.content.trim()) { toast.error("Label and content required"); return; }
    try {
      if (editor.id) {
        await updateMemory(editor.id, {
          label: editor.label, content: editor.content,
          importance: editor.importance, category: editor.category,
        });
        toast.success("Memory updated");
      } else {
        await createMemory({
          category: editor.category, label: editor.label,
          content: editor.content, importance: editor.importance,
        });
        toast.success("Memory saved");
      }
      setEditor(null);
      load();
    } catch { toast.error("Save failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this memory?")) return;
    await deleteMemory(id);
    if (editor?.id === id) setEditor(null);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto" data-testid="memory-page">
      <header className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="label-eyebrow">PERSISTENT INTELLIGENCE</div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            Long-term <span className="text-cyan-300 font-semibold">Memory</span>
          </h1>
          <p className="mt-2 text-sm text-white/55 max-w-2xl">
            Eva pulls these into every chat and board meeting. Higher importance = stronger weight on responses.
          </p>
        </div>
        <button
          onClick={() => openNew()}
          className="btn-cyan rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2"
          data-testid="new-memory-btn"
        >
          <Plus size={14} /> Add memory
        </button>
      </header>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6" data-testid="memory-categories">
        <button
          onClick={() => setActiveCat(null)}
          className={`text-[11px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full border transition ${
            !activeCat ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/60 hover:border-white/20"
          }`}
        >
          ALL ({items.length})
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            data-testid={`cat-${c.id}`}
            className={`text-[11px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full border transition ${
              activeCat === c.id ? "bg-white/[0.06] text-white" : "border-white/10 text-white/60 hover:border-white/20"
            }`}
            style={activeCat === c.id ? { borderColor: c.color + "66" } : {}}
          >
            <span style={{ color: c.color }}>● </span>{c.label}
          </button>
        ))}
      </div>

      <div className={`grid ${editor ? "lg:grid-cols-[1fr_460px]" : ""} gap-6`}>
        <section data-testid="memory-list">
          {items.length === 0 ? (
            <div className="eva-glass rounded-2xl p-10 text-center">
              <Brain size={28} className="text-cyan-300 mx-auto" />
              <h3 className="mt-3 text-base font-semibold">Eva has no long-term memory yet.</h3>
              <p className="text-xs text-white/45 mt-1 max-w-md mx-auto">
                Add decisions, working style, priorities, key people. Eva references these in every chat and board meeting from now on.
              </p>
              <button onClick={() => openNew()} className="mt-5 btn-cyan rounded-xl px-4 py-2 text-sm">Add first memory</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((m) => {
                const cat = CATEGORIES.find((c) => c.id === m.category) || CATEGORIES[CATEGORIES.length - 1];
                return (
                  <motion.div
                    key={m.id}
                    layout
                    whileHover={{ y: -2 }}
                    onClick={() => openEdit(m)}
                    className="eva-glass rounded-2xl p-4 cursor-pointer"
                    style={{ borderLeft: `3px solid ${cat.color}` }}
                    data-testid={`mem-${m.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: cat.color }}>
                          {cat.label}
                        </div>
                        <h4 className="mt-1 text-sm font-semibold tracking-tight truncate">{m.label}</h4>
                      </div>
                      <ImportanceBars value={m.importance} />
                    </div>
                    <p className="mt-2 text-xs text-white/60 leading-relaxed line-clamp-3">{m.content}</p>
                    <div className="mt-2 text-[10px] font-mono text-white/30">
                      via {m.source} · {new Date(m.updated_at).toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <AnimatePresence>
          {editor && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="eva-glass rounded-2xl p-5 sticky top-6 self-start"
              data-testid="memory-editor"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="label-eyebrow">{editor.id ? "EDIT" : "NEW"} MEMORY</div>
                <button onClick={() => setEditor(null)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="mb-3">
                <div className="label-eyebrow mb-1.5">CATEGORY</div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setEditor({ ...editor, category: c.id })}
                      className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border ${
                        editor.category === c.id ? "bg-white/[0.06] text-white" : "border-white/10 text-white/50"
                      }`}
                      style={editor.category === c.id ? { borderColor: c.color + "66" } : {}}
                    >
                      <span style={{ color: c.color }}>●</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                value={editor.label}
                onChange={(e) => setEditor({ ...editor, label: e.target.value })}
                placeholder="Short label (e.g., 'Communication style')"
                data-testid="memory-label-input"
                className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-white/30 border-b border-white/10 pb-2"
              />
              <textarea
                value={editor.content}
                onChange={(e) => setEditor({ ...editor, content: e.target.value })}
                placeholder="Detailed memory Eva should retain… e.g., 'I prefer crisp bullets, no flowery prose. Decisions over options.'"
                rows={6}
                data-testid="memory-content-input"
                className="mt-3 w-full bg-transparent text-sm outline-none placeholder:text-white/30 resize-none"
              />

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <div className="label-eyebrow">IMPORTANCE</div>
                  <div className="text-xs font-mono text-cyan-300">{editor.importance}/10</div>
                </div>
                <input
                  type="range"
                  min="1" max="10"
                  value={editor.importance}
                  onChange={(e) => setEditor({ ...editor, importance: parseInt(e.target.value) })}
                  data-testid="memory-importance-slider"
                  className="w-full accent-cyan-400 mt-2"
                />
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleSave}
                  className="btn-cyan rounded-xl px-4 py-2 text-sm flex items-center gap-2 flex-1 justify-center"
                  data-testid="save-memory-btn"
                >
                  <Save size={14} /> Save
                </button>
                {editor.id && (
                  <button onClick={() => handleDelete(editor.id)} className="btn-ghost rounded-xl px-3 py-2 text-sm text-red-300">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ImportanceBars({ value }) {
  return (
    <div className="flex items-end gap-0.5 shrink-0" title={`Importance ${value}/10`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(value / 2);
        return (
          <div key={i} className="w-1 rounded-full" style={{
            height: `${(i + 1) * 3 + 4}px`,
            background: filled ? "#00F0FF" : "rgba(255,255,255,0.1)",
            boxShadow: filled ? "0 0 4px #00F0FF" : "none",
          }} />
        );
      })}
    </div>
  );
}
