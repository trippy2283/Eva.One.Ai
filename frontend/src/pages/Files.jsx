import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listFiles,
  uploadFile,
  analyzeFile,
  deleteFile,
  getFile,
} from "@/lib/api";
import { toast } from "sonner";

export function Files() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(null); // file detail
  const [analyzingId, setAnalyzingId] = useState(null);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const load = async () => {
    try {
      setFiles(await listFiles());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const rec = await uploadFile(file, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      toast.success(`Uploaded ${rec.filename}`);
      load();
      // Auto-analyze if extractable
      if (rec.extracted_text_preview) {
        autoAnalyze(rec.id);
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const autoAnalyze = async (id) => {
    setAnalyzingId(id);
    try {
      await analyzeFile(id);
      toast.success("Analysis complete");
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzingId(id);
    try {
      const rec = await analyzeFile(id);
      setActive(rec);
      toast.success("Analysis complete");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await deleteFile(id);
      if (active?.id === id) setActive(null);
      load();
    } catch { toast.error("Delete failed"); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove("border-cyan-500/50");
    const f = e.dataTransfer.files?.[0];
    if (f) handleUpload(f);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current?.classList.add("border-cyan-500/50");
  };
  const handleDragLeave = () => {
    dropRef.current?.classList.remove("border-cyan-500/50");
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto" data-testid="files-page">
      <header className="mb-6">
        <div className="label-eyebrow">DOCUMENT INTELLIGENCE</div>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">
          File <span className="text-cyan-300 font-semibold">Intelligence</span>
        </h1>
        <p className="mt-2 text-sm text-white/50 max-w-xl">
          Upload PDF, DOCX, XLSX, CSV, TXT, or images. Eva extracts summaries, key points, and action items.
        </p>
      </header>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center eva-glass transition-colors mb-6"
        data-testid="upload-dropzone"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center eva-glow-cyan">
            <Upload size={22} className="text-cyan-300" />
          </div>
          <div className="text-sm">
            <button
              onClick={() => inputRef.current?.click()}
              className="text-cyan-300 underline-offset-2 hover:underline"
              data-testid="upload-browse-btn"
            >
              Browse a file
            </button>
            <span className="text-white/50"> or drop one here</span>
          </div>
          <div className="text-[10px] font-mono text-white/30 tracking-widest">
            PDF · DOCX · XLSX · CSV · TXT · IMAGES · AUDIO · MAX 25MB
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
          accept=".pdf,.docx,.xlsx,.csv,.txt,.json,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.m4a"
          data-testid="file-input"
        />
        {uploading && (
          <div className="mt-4 max-w-md mx-auto">
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-[10px] font-mono text-white/40 mt-1">UPLOADING {progress}%</div>
          </div>
        )}
      </div>

      <div className={`grid ${active ? "lg:grid-cols-[1fr_480px]" : ""} gap-6`}>
        <section data-testid="files-list">
          <div className="label-eyebrow mb-3">YOUR FILES</div>
          {files.length === 0 ? (
            <div className="eva-glass rounded-2xl p-10 text-center">
              <div className="text-sm text-white/50">No files yet. Upload your first document.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((f) => (
                <motion.div
                  key={f.id}
                  layout
                  className="eva-glass rounded-2xl p-4 flex items-start gap-4 hover:border-cyan-500/20 cursor-pointer"
                  onClick={() => setActive(f)}
                  data-testid={`file-${f.id}`}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-cyan-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{f.filename}</span>
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="text-[11px] font-mono text-white/40 mt-1">
                      {formatBytes(f.size)} · {new Date(f.created_at).toLocaleString()}
                    </div>
                    {f.summary && (
                      <div className="text-xs text-white/60 mt-2 line-clamp-2">{f.summary}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {f.extracted_text_preview && f.status !== "analyzed" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAnalyze(f.id); }}
                        disabled={analyzingId === f.id}
                        className="btn-cyan rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5"
                        data-testid={`analyze-${f.id}`}
                      >
                        {analyzingId === f.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        Analyze
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                      className="text-white/30 hover:text-red-300 p-1"
                      data-testid={`delete-${f.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <AnimatePresence>
          {active && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="eva-glass rounded-2xl p-5 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto"
              data-testid="file-detail"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <div className="label-eyebrow">DOCUMENT</div>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight truncate">{active.filename}</h3>
                </div>
                <button onClick={() => setActive(null)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4 text-[11px] font-mono text-white/40">
                <StatusBadge status={active.status} />
                <span>{formatBytes(active.size)}</span>
              </div>

              {!active.summary && active.extracted_text_preview && (
                <button
                  onClick={() => handleAnalyze(active.id)}
                  disabled={analyzingId === active.id}
                  className="btn-cyan rounded-xl px-4 py-2 text-sm w-full flex items-center justify-center gap-2 mb-4"
                  data-testid="analyze-detail-btn"
                >
                  {analyzingId === active.id ? (
                    <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
                  ) : (
                    <><Sparkles size={14} /> Run Eva analysis</>
                  )}
                </button>
              )}

              {!active.extracted_text_preview && (
                <div className="text-xs text-white/40 bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-4">
                  No extractable text. Binary or media files are stored but cannot be summarized as text.
                </div>
              )}

              {active.summary && (
                <Section title="Summary">
                  <p className="text-sm text-white/85 leading-relaxed">{active.summary}</p>
                </Section>
              )}
              {active.key_points?.length > 0 && (
                <Section title="Key points">
                  <ul className="space-y-1.5">
                    {active.key_points.map((k, i) => (
                      <li key={i} className="text-sm text-white/80 flex gap-2">
                        <span className="cyan-dot mt-1.5 shrink-0" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {active.action_items?.length > 0 && (
                <Section title="Action items">
                  <ul className="space-y-1.5">
                    {active.action_items.map((a, i) => (
                      <li key={i} className="text-sm text-white/85 flex gap-2">
                        <CheckCircle2 size={14} className="mt-0.5 text-cyan-300 shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {active.extracted_text_preview && (
                <Section title="Text preview">
                  <pre className="text-[11px] font-mono whitespace-pre-wrap text-white/50 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5 max-h-48 overflow-y-auto">
                    {active.extracted_text_preview}
                  </pre>
                </Section>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="label-eyebrow mb-2">{title}</div>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    uploaded: { text: "UPLOADED", color: "text-white/50", dot: "#fff" },
    analyzing: { text: "ANALYZING", color: "text-violet-300", dot: "#8A2BE2" },
    analyzed: { text: "ANALYZED", color: "text-cyan-300", dot: "#00F0FF" },
    failed: { text: "FAILED", color: "text-red-300", dot: "#FF4D6D" },
  };
  const s = map[status] || map.uploaded;
  return (
    <span className={`text-[10px] font-mono tracking-widest uppercase flex items-center gap-1 ${s.color}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot, boxShadow: `0 0 6px ${s.dot}` }} />
      {s.text}
    </span>
  );
}

function formatBytes(b) {
  if (!b) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
