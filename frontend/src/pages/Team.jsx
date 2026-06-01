import React, { useEffect, useState } from "react";
import { Plus, Users, Mail, Trash2, Copy, Crown, Shield, UserCog, User as UserIcon, Briefcase, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const ROLE_META = {
  owner:          { icon: Crown,    color: "#00F0FF", label: "Owner" },
  executive:      { icon: Briefcase,color: "#8A2BE2", label: "Executive" },
  admin:          { icon: Shield,   color: "#3DDC97", label: "Admin" },
  studio_operator:{ icon: UserCog,  color: "#FFB454", label: "Studio Operator" },
  member:         { icon: UserIcon, color: "#9CA3AF", label: "Member" },
};

export function Team() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", role: "member", expires_in_days: 7 });
  const [createdToken, setCreatedToken] = useState(null);

  const load = async () => {
    try {
      const [t, i] = await Promise.all([api.get("/team"), api.get("/invites")]);
      setTeam(t.data);
      setInvites(i.data);
    } catch (e) {
      if (e?.response?.status === 403) toast.error("Admin role required");
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.email) { toast.error("Email required"); return; }
    try {
      const res = await api.post("/invites", form);
      setCreatedToken(res.data.token);
      toast.success("Invite link created");
      setForm({ email: "", role: "member", expires_in_days: 7 });
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not create invite");
    }
  };

  const handleRevoke = async (token) => {
    if (!window.confirm("Revoke this invite?")) return;
    await api.delete(`/invites/${token}`);
    toast.success("Revoked");
    load();
  };

  const handleRoleChange = async (uid, role) => {
    try {
      await api.put(`/team/${uid}/role`, { role });
      toast.success("Role updated");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Update failed");
    }
  };

  const copyInvite = (token) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite URL copied");
  };

  const canManageRoles = user?.role === "owner";

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto" data-testid="team-page">
      <header className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="label-eyebrow">STUDIO OPERATORS</div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            <span className="text-cyan-300 font-semibold">Team</span> & Roles
          </h1>
          <p className="mt-2 text-sm text-white/55 max-w-2xl">
            Invite Mentally Creative Studios operators with scoped permissions. Invites use one-time secure tokens.
          </p>
        </div>
        <button
          onClick={() => { setShowInvite(true); setCreatedToken(null); }}
          className="btn-cyan rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2"
          data-testid="new-invite-btn"
        >
          <Plus size={14} /> Generate invite
        </button>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team members */}
        <section data-testid="team-list">
          <div className="label-eyebrow mb-3">MEMBERS ({team.length})</div>
          <div className="space-y-2">
            {team.map((m) => {
              const meta = ROLE_META[m.role] || ROLE_META.member;
              const Icon = meta.icon;
              return (
                <div key={m.user_id} className="eva-glass rounded-2xl p-4 flex items-center gap-3" data-testid={`member-${m.user_id}`}>
                  {m.picture ? (
                    <img src={m.picture} className="w-10 h-10 rounded-full border border-white/10" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm">{m.name?.[0]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{m.name}</div>
                    <div className="text-[11px] font-mono text-white/40 truncate">{m.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Icon size={14} style={{ color: meta.color }} />
                    {canManageRoles && m.role !== "owner" ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                        className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs"
                        data-testid={`role-select-${m.user_id}`}
                      >
                        {["executive", "admin", "studio_operator", "member"].map((r) => (
                          <option key={r} value={r} className="bg-[#0a0a0d]">{ROLE_META[r]?.label || r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-mono uppercase tracking-widest" style={{ color: meta.color }}>{meta.label}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Invites */}
        <section data-testid="invites-list">
          <div className="label-eyebrow mb-3">PENDING INVITES ({invites.filter((i) => i.status === "pending").length})</div>
          <div className="space-y-2">
            {invites.length === 0 && (
              <div className="eva-glass rounded-2xl p-6 text-center text-sm text-white/40">No invites yet.</div>
            )}
            {invites.map((inv) => {
              const meta = ROLE_META[inv.role] || ROLE_META.member;
              const Icon = meta.icon;
              return (
                <div key={inv.token} className="eva-glass rounded-2xl p-4 flex items-center gap-3" data-testid={`invite-${inv.token.slice(0,8)}`}>
                  <Mail size={16} className="text-white/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{inv.email}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-2 mt-0.5">
                      <Icon size={10} style={{ color: meta.color }} />
                      <span style={{ color: meta.color }}>{meta.label}</span>
                      <span>·</span>
                      <span>{inv.status}</span>
                      <span>·</span>
                      <span>expires {new Date(inv.expires_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => copyInvite(inv.token)} title="Copy invite link" className="btn-ghost p-1.5 rounded-lg">
                    <Copy size={13} />
                  </button>
                  <button onClick={() => handleRevoke(inv.token)} title="Revoke" className="text-white/30 hover:text-red-300 p-1.5">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInvite(false)}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="eva-glass-heavy rounded-2xl p-6 max-w-md w-full"
              data-testid="invite-modal"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="label-eyebrow">NEW INVITE</div>
                <button onClick={() => setShowInvite(false)} className="text-white/40"><X size={16} /></button>
              </div>

              {!createdToken ? (
                <>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="operator@mentallycreative.studio"
                    className="w-full bg-transparent border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500/40"
                    data-testid="invite-email-input"
                  />
                  <div className="mt-3">
                    <div className="label-eyebrow mb-1.5">ROLE</div>
                    <div className="grid grid-cols-2 gap-2">
                      {["executive", "admin", "studio_operator", "member"].map((r) => {
                        const meta = ROLE_META[r];
                        const Icon = meta.icon;
                        return (
                          <button
                            key={r}
                            onClick={() => setForm({ ...form, role: r })}
                            data-testid={`invite-role-${r}`}
                            className={`text-left px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition ${
                              form.role === r ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <Icon size={12} style={{ color: meta.color }} />
                            <span>{meta.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="label-eyebrow mb-1.5">EXPIRES IN (DAYS)</div>
                    <input
                      type="number" min={1} max={60}
                      value={form.expires_in_days}
                      onChange={(e) => setForm({ ...form, expires_in_days: parseInt(e.target.value || "7") })}
                      className="w-full bg-transparent border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    className="mt-5 btn-cyan rounded-xl px-4 py-2.5 text-sm w-full font-medium"
                    data-testid="create-invite-submit"
                  >
                    Generate one-time link
                  </button>
                </>
              ) : (
                <div>
                  <div className="text-sm text-cyan-300 mb-2">Invite created. Share this link:</div>
                  <div className="bg-white/[0.04] border border-cyan-500/20 rounded-xl px-3 py-2.5 text-xs font-mono break-all text-white/80">
                    {window.location.origin}/invite/{createdToken}
                  </div>
                  <button
                    onClick={() => { copyInvite(createdToken); setShowInvite(false); setCreatedToken(null); }}
                    className="mt-4 btn-cyan rounded-xl px-4 py-2.5 text-sm w-full font-medium"
                  >
                    Copy link & close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
