"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  Bell,
  Check,
  Clock,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Circle,
  AlarmClock,
} from "lucide-react";
import { reminderService, Reminder } from "@/lib/reminderService";

const FIXED_BG = "#e8ecf4";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 18px",
  borderRadius: 16,
  border: "none",
  background: FIXED_BG,
  boxShadow:
    "inset 4px 4px 8px rgba(163,177,198,0.55), inset -4px -4px 8px rgba(255,255,255,0.85)",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 15,
  color: "#1e2a3a",
  outline: "none",
  resize: "none" as const,
};

const REPEAT_OPTIONS: { id: Reminder["repeat"]; label: string; icon: React.ReactNode }[] = [
  { id: "none",   label: "No Repeat",  icon: <Clock size={14} strokeWidth={2.5} /> },
  { id: "daily",  label: "Daily",      icon: <RefreshCw size={14} strokeWidth={2.5} /> },
  { id: "weekly", label: "Weekly",     icon: <Calendar size={14} strokeWidth={2.5} /> },
];

function isOverdue(remind_at: string, done: boolean) {
  return !done && new Date(remind_at) < new Date();
}

function formatDateTime(dt: string) {
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// ── Add / Edit Modal ────────────────────────────────────────────────────────
function ReminderModal({
  reminder,
  onClose,
  onSave,
}: {
  reminder: Reminder | null;
  onClose: () => void;
  onSave: (data: { title: string; note: string; remind_at: string; repeat: Reminder["repeat"] }) => Promise<void>;
}) {
  const toLocalDT = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const defaultDT = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [title, setTitle]       = useState(reminder?.title ?? "");
  const [note, setNote]         = useState(reminder?.note ?? "");
  const [remindAt, setRemindAt] = useState(reminder ? toLocalDT(reminder.remind_at) : defaultDT());
  const [repeat, setRepeat]     = useState<Reminder["repeat"]>(reminder?.repeat ?? "none");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const handleSave = async () => {
    if (!title.trim()) { setError("Please add a title."); return; }
    if (!remindAt)     { setError("Please set a date and time."); return; }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        note: note.trim(),
        remind_at: new Date(remindAt).toISOString(),
        repeat,
      });
      onClose();
    } catch {
      setError("Failed to save reminder.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      key="reminder-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center",
        justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
          borderRadius: 32, background: FIXED_BG,
          boxShadow: "12px 12px 30px rgba(0,0,0,0.2), -10px -10px 30px rgba(255,255,255,0.9)",
          padding: "36px 34px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 24, color: "#1e2a3a", margin: 0 }}>
            {reminder ? "Edit Reminder ✏️" : "New Reminder ⏰"}
          </h2>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
              background: FIXED_BG, boxShadow: "4px 4px 10px rgba(163,177,198,0.6), -4px -4px 10px rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#9aa5b4" }}>
            <X size={17} strokeWidth={2.5} />
          </motion.button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title */}
          <div>
            <label style={{ fontFamily: "DM Sans", fontSize: 12, fontWeight: 800, color: "#9aa5b4",
              textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              Title *
            </label>
            <input type="text" placeholder="e.g. Call the dentist" value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              style={inputStyle} />
          </div>

          {/* Note */}
          <div>
            <label style={{ fontFamily: "DM Sans", fontSize: 12, fontWeight: 800, color: "#9aa5b4",
              textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              Extra Note
            </label>
            <textarea placeholder="Any extra details…" value={note}
              onChange={(e) => setNote(e.target.value)} rows={3}
              style={inputStyle} />
          </div>

          {/* Date & Time */}
          <div>
            <label style={{ fontFamily: "DM Sans", fontSize: 12, fontWeight: 800, color: "#9aa5b4",
              textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              Date & Time *
            </label>
            <input type="datetime-local" value={remindAt}
              onChange={(e) => { setRemindAt(e.target.value); setError(""); }}
              style={{ ...inputStyle, colorScheme: "light" }} />
          </div>

          {/* Repeat */}
          <div>
            <label style={{ fontFamily: "DM Sans", fontSize: 12, fontWeight: 800, color: "#9aa5b4",
              textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
              Repeat
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {REPEAT_OPTIONS.map((opt) => {
                const selected = repeat === opt.id;
                return (
                  <motion.button key={opt.id} whileTap={{ scale: 0.95 }} onClick={() => setRepeat(opt.id)}
                    style={{ flex: 1, padding: "12px 10px", borderRadius: 50, border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      fontFamily: "DM Sans", fontSize: 13, fontWeight: 700,
                      background: selected ? "linear-gradient(135deg, #f15a2b, #ee5a24)" : FIXED_BG,
                      color: selected ? "white" : "#9aa5b4",
                      boxShadow: selected
                        ? "inset 3px 3px 6px rgba(0,0,0,0.18)"
                        : "4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.85)",
                      transition: "all 0.2s ease" }}>
                    {opt.icon}{opt.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ color: "#f15a2b", fontFamily: "DM Sans", fontSize: 14, fontWeight: 700, margin: 0 }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Save */}
          <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
            disabled={saving}
            style={{ width: "100%", padding: "15px", borderRadius: 50, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #f15a2b, #ee5a24)", color: "white",
              fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 16,
              boxShadow: "6px 6px 16px rgba(241,90,43,0.4), -4px -4px 12px rgba(255,255,255,0.8)",
              opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : reminder ? "Save Changes →" : "Set Reminder →"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Reminder Card ───────────────────────────────────────────────────────────
function ReminderCard({
  reminder,
  onEdit,
  onDelete,
  onToggleDone,
}: {
  reminder: Reminder;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDone: () => void;
}) {
  const overdue = isOverdue(reminder.remind_at, reminder.done);
  const repeatOpt = REPEAT_OPTIONS.find((r) => r.id === reminder.repeat);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{
        borderRadius: 22,
        padding: "20px 22px",
        background: FIXED_BG,
        boxShadow: "6px 6px 16px rgba(163,177,198,0.45), -6px -6px 16px rgba(255,255,255,0.9)",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        cursor: "pointer",
        opacity: reminder.done ? 0.6 : 1,
        borderLeft: `4px solid ${
          reminder.done ? "#00b894" : overdue ? "#f15a2b" : "#4facfe"
        }`,
        transition: "opacity 0.2s, border-color 0.2s",
      }}
      onClick={onEdit}
    >
      {/* Done toggle */}
      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.88 }}
        onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
        style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", flexShrink: 0,
          background: reminder.done ? "#00b89420" : FIXED_BG,
          boxShadow: "4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.9)",
          display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
        {reminder.done
          ? <CheckCircle2 size={18} color="#00b894" strokeWidth={2.5} />
          : <Circle size={18} color="#9aa5b4" strokeWidth={2} />}
      </motion.button>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 16, color: "#1e2a3a",
          margin: "0 0 4px", textDecoration: reminder.done ? "line-through" : "none",
          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
        }}>
          {reminder.title}
        </h3>
        {reminder.note && (
          <p style={{ fontFamily: "DM Sans", fontSize: 13, color: "#636e72", margin: "0 0 8px",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const, lineHeight: 1.5 }}>
            {reminder.note}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5,
            fontFamily: "DM Sans", fontSize: 12, fontWeight: 700,
            color: reminder.done ? "#00b894" : overdue ? "#f15a2b" : "#4facfe" }}>
            <AlarmClock size={13} strokeWidth={2.5} />
            {formatDateTime(reminder.remind_at)}
          </span>
          {reminder.repeat !== "none" && (
            <span style={{ display: "flex", alignItems: "center", gap: 4,
              fontFamily: "DM Sans", fontSize: 11, fontWeight: 700, color: "#9aa5b4",
              background: "#e8ecf4", padding: "2px 8px", borderRadius: 50,
              boxShadow: "2px 2px 4px rgba(163,177,198,0.4), -2px -2px 4px rgba(255,255,255,0.8)" }}>
              <RefreshCw size={10} strokeWidth={2.5} />
              {repeatOpt?.label}
            </span>
          )}
          {overdue && (
            <span style={{ fontFamily: "DM Sans", fontSize: 11, fontWeight: 800, color: "#f15a2b",
              background: "#f15a2b18", padding: "2px 8px", borderRadius: 50 }}>Overdue</span>
          )}
          {reminder.done && (
            <span style={{ fontFamily: "DM Sans", fontSize: 11, fontWeight: 800, color: "#00b894",
              background: "#00b89418", padding: "2px 8px", borderRadius: 50 }}>Done ✓</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{ width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer", flexShrink: 0,
          background: "rgba(241,90,43,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Trash2 size={13} color="#f15a2b" strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "done">("upcoming");
  const [modal, setModal] = useState<"add" | Reminder | null>(null);

  const load = async () => {
    try {
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = reminders.filter((r) => {
    if (filter === "done")     return r.done;
    if (filter === "upcoming") return !r.done;
    return true;
  });

  const handleSave = async (data: { title: string; note: string; remind_at: string; repeat: Reminder["repeat"] }) => {
    if (modal === "add") {
      const created = await reminderService.addReminder(data);
      setReminders((prev) => [...prev, created].sort((a, b) =>
        new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime()));
    } else if (modal && typeof modal === "object") {
      const updated = await reminderService.updateReminder(modal.id, data);
      setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
  };

  const handleDelete = async (id: string) => {
    await reminderService.deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleDone = async (reminder: Reminder) => {
    const updated = await reminderService.updateReminder(reminder.id, { done: !reminder.done });
    setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const upcoming = reminders.filter((r) => !r.done).length;
  const overdueCount = reminders.filter((r) => isOverdue(r.remind_at, r.done)).length;

  const FILTERS: { id: typeof filter; label: string }[] = [
    { id: "upcoming", label: `Upcoming (${upcoming})` },
    { id: "done",     label: `Done (${reminders.filter((r) => r.done).length})` },
    { id: "all",      label: `All (${reminders.length})` },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 28, color: "#1e2a3a", margin: 0 }}>
            Reminders ⏰
          </h1>
          <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "#9aa5b4", margin: "4px 0 0" }}>
            {upcoming} upcoming
            {overdueCount > 0 && (
              <span style={{ color: "#f15a2b", fontWeight: 700 }}> · {overdueCount} overdue</span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ y: -1, boxShadow: "6px 6px 16px rgba(241,90,43,0.45), -2px -2px 8px rgba(255,255,255,0.6)" }}
          whileTap={{ scale: 0.97 }} onClick={() => setModal("add")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 22px",
            borderRadius: 50, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #f15a2b, #ee5a24)", color: "white",
            fontFamily: "DM Sans", fontWeight: 700, fontSize: 15,
            boxShadow: "5px 5px 12px rgba(241,90,43,0.4), -2px -2px 6px rgba(255,255,255,0.5)",
            whiteSpace: "nowrap" }}>
          <Plus size={17} strokeWidth={2.5} /> New Reminder
        </motion.button>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <motion.button key={f.id} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f.id)}
              style={{ padding: "9px 20px", borderRadius: 50, border: "none", cursor: "pointer",
                fontFamily: "DM Sans", fontSize: 13, fontWeight: 700,
                background: active ? "linear-gradient(135deg, #f15a2b, #ee5a24)" : FIXED_BG,
                color: active ? "white" : "#9aa5b4",
                boxShadow: active
                  ? "inset 3px 3px 6px rgba(0,0,0,0.15)"
                  : "4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.9)",
                transition: "all 0.2s ease" }}>
              {f.label}
            </motion.button>
          );
        })}
      </div>

      {/* ── List ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", border: "4px solid #f15a2b",
              borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: 280, gap: 16 }}>
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity }}
              style={{ width: 80, height: 80, borderRadius: 24,
                background: "linear-gradient(135deg, #e8ecf4, #d8dfe8)",
                boxShadow: "6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.9)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={38} color="#f15a2b" />
            </motion.div>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 22, color: "#1e2a3a", margin: 0 }}>
              {filter === "done" ? "Nothing done yet" : filter === "upcoming" ? "All clear! 🎉" : "No reminders yet"}
            </h3>
            <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "#9aa5b4", margin: 0 }}>
              {filter === "done" ? "Complete a reminder to see it here" : 'Tap "New Reminder" to add one'}
            </p>
          </motion.div>
        ) : (
          <motion.div layout style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 24 }}>
            <AnimatePresence>
              {filtered.map((r) => (
                <ReminderCard key={r.id} reminder={r}
                  onEdit={() => setModal(r)}
                  onDelete={() => handleDelete(r.id)}
                  onToggleDone={() => handleToggleDone(r)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal !== null && (
          <ReminderModal
            reminder={modal === "add" ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
