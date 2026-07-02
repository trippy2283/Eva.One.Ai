import React, { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pin, Tag, Trash2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} from "@/lib/api";
import { toast } from "sonner";

export function Vault() {
  const [notes, setNotes] = useState([]);
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [editor, setEditor] = useState(null); // {id?, title, content, tags, pinned}
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listNotes(q || undefined, activeTag || undefined);
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [q, activeTag]);

  useEffect(() => { load(); }, [load]);

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  const openNew = () => setEditor({ title: "", content: "", tags: [], pinned: false });
  const openEdit = (n) => setEditor({ ...n });

  const handleSave = async () => {
    if (!editor.title.trim()) { toast.error("Title required"); return; }
    try {
      if (editor.id) {
        await updateNote(editor.id, {
          title: editor.title,
          content: editor.content,
          tags: editor.tags,
          pinned: editor.pinned,
        });
        toast.success("Note saved");
      } else {
        await createNote({
          title: editor.title,
          content: editor.content,
          tags: editor.tags,
          pinned: editor.pinned,
        });
        toast.success("Note created");
      }
      setEditor(null);
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      toast.success("Deleted");
      if (editor?.id === id) setEditor(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const togglePin = async (n) => {
    try {
      await updateNote(n.id, { pinned: !n.pinned });
      load();
    } catch {}
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto" data-testid="vault-page">
      <header className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="label-eyebrow">INSTITUTIONAL MEMORY</div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">Knowledge <span className="text-cyan-300 font-semibold">Vault</span></h1>
        </div>
        <button onClick={openNew} className="btn-cyan rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2" data-testid="new-note-btn">
          <Plus size={14} /> New note
        </button>
      </header>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="eva-glass rounded-xl flex items-center gap-2 px-3 py-2 flex-1 min-w-[240px]">
          <Search size={14} className="text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes…"
            data-testid="vault-search"
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-white/30"
          />
        </div>
        {activeTag && (
          <button
            onClick={() => setActiveTag(null)}
            className="btn-ghost rounded-xl px-3 py-2 text-xs flex items-center gap-1.5"
          >
            <Tag size={12} /> {activeTag} <X size={12} />
          </button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(activeTag === t ? null : t)}
              data-testid={`tag-${t}`}
              className={`text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border transition ${
                activeTag === t
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-white/10 hover:border-white/20 text-white/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className={`grid ${editor ? "lg:grid-cols-[1fr_460px]" : ""} gap-6`}>
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start" data-testid="notes-grid">
          {loading && <div className="text-sm text-white/40 col-span-full">Loading…</div>}
          {!loading && notes.length === 0 && (
            <div className="col-span-full eva-glass rounded-2xl p-10 text-center">
              <div className="label-eyebrow">EMPTY VAULT</div>
              <h3 className="mt-3 text-lg font-semibold">Capture your first insight.</h3>
              <p className="text-sm text-white/50 mt-1">Notes become Eva's long-term context. Pin the ones that matter.</p>
              <button onClick={openNew} className="mt-5 btn-cyan rounded-xl px-4 py-2 text-sm">Create first note</button>
            </div>
          )}
          {notes.map((n) => (
            <motion.div
              key={n.id}
              layout
              whileHover={{ y: -2 }}
              className="eva-glass rounded-2xl p-4 cursor-pointer group eva-traced relative"
              onClick={() => openEdit(n)}
              data-testid={`note-${n.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold tracking-tight line-clamp-2">{n.title}</h4>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(n); }}
                  className={n.pinned ? "text-cyan-300" : "text-white/30 hover:text-white/70"}
                  title={n.pinned ? "Unpin" : "Pin"}
                >
                  <Pin size={13} />
                </button>
              </div>
              <p className="mt-2 text-xs text-white/55 leading-relaxed line-clamp-4 whitespace-pre-wrap">{n.content}</p>
              {n.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {n.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/[0.04] text-white/50">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 text-[10px] font-mono text-white/30">{new Date(n.updated_at).toLocaleDateString()}</div>
            </motion.div>
          ))}
        </section>

        <AnimatePresence>
          {editor && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="eva-glass rounded-2xl p-5 sticky top-6 self-start"
              data-testid="note-editor"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="label-eyebrow">{editor.id ? "EDIT NOTE" : "NEW NOTE"}</div>
                <button onClick={() => setEditor(null)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <input
                value={editor.title}
                onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                placeholder="Title"
                data-testid="editor-title"
                className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/30 border-b border-white/10 pb-2"
              />
              <textarea
                value={editor.content}
                onChange={(e) => setEditor({ ...editor, content: e.target.value })}
                placeholder="Capture knowledge, observations, decisions…"
                rows={10}
                data-testid="editor-content"
                className="mt-3 w-full bg-transparent text-sm outline-none placeholder:text-white/30 resize-none"
              />
              <div className="mt-3">
                <div className="label-eyebrow mb-1.5">TAGS</div>
                <input
                  value={(editor.tags || []).join(", ")}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="strategy, q1, sales"
                  data-testid="editor-tags"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/30 border border-white/10 rounded-lg px-3 py-2"
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={!!editor.pinned}
                  onChange={(e) => setEditor({ ...editor, pinned: e.target.checked })}
                  className="accent-cyan-400"
                />
                Pin to top
              </label>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={handleSave} className="btn-cyan rounded-xl px-4 py-2 text-sm flex items-center gap-2 flex-1 justify-center" data-testid="save-note-btn">
                  <Save size={14} /> Save
                </button>
                {editor.id && (
                  <button
                    onClick={() => handleDelete(editor.id)}
                    className="btn-ghost rounded-xl px-3 py-2 text-sm text-red-300 hover:text-red-200"
                  >
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
