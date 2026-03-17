"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pin,
  Trash2,
  X,
  Check,
  FileText,
  Search,
  PinOff,
} from "lucide-react";
import { noteService, Note } from "@/lib/noteService";

// ── Pastel colour palette ──────────────────────────────────────────────────
const NOTE_COLORS = [
  { id: "cream",  bg: "#fdf6e3", accent: "#f15a2b" },
  { id: "blue",   bg: "#e8f4fd", accent: "#0984e3" },
  { id: "green",  bg: "#e8fdf0", accent: "#00b894" },
  { id: "purple", bg: "#f3e8fd", accent: "#6c5ce7" },
  { id: "pink",   bg: "#fde8f4", accent: "#e84393" },
  { id: "yellow", bg: "#fdf8e8", accent: "#fdcb6e" },
];

const FIXED_BG = "#e8ecf4";

// ── Shared style helpers ───────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
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

// ── Add/Edit Modal ─────────────────────────────────────────────────────────
function NoteModal({
  note,
  onClose,
  onSave,
}: {
  note: Note | null;
  onClose: () => void;
  onSave: (data: { title: string; content: string; color: string; pinned: boolean }) => Promise<void>;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [color, setColor] = useState(note?.color ?? NOTE_COLORS[0].id);
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 80);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) { setError("Please add a title."); return; }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), content: content.trim(), color, pinned });
      onClose();
    } catch {
      setError("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedColor = NOTE_COLORS.find((c) => c.id === color) ?? NOTE_COLORS[0];

  return (
    <motion.div
      key="note-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", width: "100%", maxWidth: 540, maxHeight: "90vh",
          overflowY: "auto", borderRadius: 32, background: FIXED_BG,
          boxShadow: "12px 12px 30px rgba(0,0,0,0.2), -10px -10px 30px rgba(255,255,255,0.9)",
          padding: "36px 34px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 24, color: "#1e2a3a", margin: 0 }}>
            {note ? "Edit Note ✏️" : "New Note 📝"}
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
            <input type="text" placeholder="Note title..." value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              style={inputStyle} />
          </div>

          {/* Content */}
          <div>
            <label style={{ fontFamily: "DM Sans", fontSize: 12, fontWeight: 800, color: "#9aa5b4",
              textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              Content
            </label>
            <textarea ref={textareaRef} placeholder="Write your note here..." value={content}
              onChange={(e) => setContent(e.target.value)} rows={6}
              style={inputStyle} />
          </div>

          {/* Colour */}
          <div>
            <label style={{ fontFamily: "DM Sans", fontSize: 12, fontWeight: 800, color: "#9aa5b4",
              textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
              Card Colour
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {NOTE_COLORS.map((c) => (
                <motion.button key={c.id} whileTap={{ scale: 0.92 }} onClick={() => setColor(c.id)}
                  style={{
                    width: 34, height: 34, borderRadius: "50%", border: color === c.id ? `3px solid ${c.accent}` : "3px solid transparent",
                    background: c.bg, cursor: "pointer",
                    boxShadow: color === c.id
                      ? `0 0 0 2px ${c.accent}40, 3px 3px 6px rgba(163,177,198,0.5)`
                      : "3px 3px 7px rgba(163,177,198,0.5), -3px -3px 7px rgba(255,255,255,0.85)",
                    transition: "all 0.18s ease",
                  }}>
                  {color === c.id && <Check size={14} color={c.accent} style={{ margin: "auto", display: "block" }} />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Pin toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setPinned(!pinned)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                borderRadius: 50, border: "none", cursor: "pointer",
                background: pinned ? `${selectedColor.accent}18` : FIXED_BG,
                color: pinned ? selectedColor.accent : "#9aa5b4",
                fontFamily: "DM Sans", fontWeight: 700, fontSize: 14,
                boxShadow: pinned
                  ? `inset 2px 2px 5px rgba(0,0,0,0.1)`
                  : "4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.85)",
                transition: "all 0.2s ease",
              }}>
              <Pin size={15} strokeWidth={2.5} />
              {pinned ? "Pinned" : "Pin Note"}
            </motion.button>
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
            style={{
              width: "100%", padding: "15px", borderRadius: 50, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #f15a2b, #ee5a24)", color: "white",
              fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 16,
              boxShadow: "6px 6px 16px rgba(241,90,43,0.4), -4px -4px 12px rgba(255,255,255,0.8)",
              opacity: saving ? 0.7 : 1,
            }}>
            {saving ? "Saving…" : note ? "Save Changes →" : "Add Note →"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Note Card ──────────────────────────────────────────────────────────────
function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const colorDef = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -8 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{
        borderRadius: 22, padding: "22px 22px 18px",
        background: colorDef.bg,
        boxShadow: "6px 6px 16px rgba(163,177,198,0.45), -6px -6px 16px rgba(255,255,255,0.9)",
        cursor: "pointer", position: "relative", minHeight: 150,
        display: "flex", flexDirection: "column", gap: 10,
      }}
      onClick={onEdit}
    >
      {/* Pin badge */}
      {note.pinned && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: colorDef.accent + "22", borderRadius: 8,
          padding: "3px 6px", display: "flex", alignItems: "center", gap: 4,
        }}>
          <Pin size={11} color={colorDef.accent} strokeWidth={2.5} />
        </div>
      )}

      <h3 style={{
        fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 17,
        color: "#1e2a3a", margin: 0, paddingRight: note.pinned ? 32 : 0,
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical" as const,
      }}>
        {note.title}
      </h3>

      {note.content && (
        <p style={{
          fontFamily: "DM Sans", fontSize: 14, color: "#636e72", margin: 0, flex: 1,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical" as const, lineHeight: 1.6,
        }}>
          {note.content}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span style={{ fontFamily: "DM Sans", fontSize: 12, color: "#9aa5b4", fontWeight: 600 }}>
          {new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={onTogglePin}
            title={note.pinned ? "Unpin" : "Pin"}
            style={{ width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
              background: note.pinned ? colorDef.accent + "20" : "rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
            {note.pinned
              ? <PinOff size={13} color={colorDef.accent} strokeWidth={2.5} />
              : <Pin size={13} color="#9aa5b4" strokeWidth={2.5} />}
          </motion.button>
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={onDelete}
            title="Delete"
            style={{ width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
              background: "rgba(241,90,43,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 size={13} color="#f15a2b" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | Note | null>(null);

  const load = async () => {
    try {
      const data = await noteService.getNotes();
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: { title: string; content: string; color: string; pinned: boolean }) => {
    if (modal === "add") {
      const created = await noteService.addNote(data);
      setNotes((prev) => [created, ...prev]);
    } else if (modal && typeof modal === "object") {
      const updated = await noteService.updateNote(modal.id, data);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    }
  };

  const handleDelete = async (id: string) => {
    await noteService.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePin = async (note: Note) => {
    const updated = await noteService.updateNote(note.id, { pinned: !note.pinned });
    setNotes((prev) => {
      const arr = prev.map((n) => (n.id === updated.id ? updated : n));
      return [...arr].sort((a, b) => {
        if (a.pinned === b.pinned) return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        return a.pinned ? -1 : 1;
      });
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 28, color: "#1e2a3a", margin: 0 }}>
            Notes 📝
          </h1>
          <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "#9aa5b4", margin: "4px 0 0" }}>
            {notes.length} note{notes.length !== 1 ? "s" : ""} · {notes.filter((n) => n.pinned).length} pinned
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} color="#9aa5b4"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder="Search notes…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, width: 200, padding: "10px 16px 10px 38px", borderRadius: 50, fontSize: 14 }} />
          </div>

          {/* New note button */}
          <motion.button whileHover={{ y: -1, boxShadow: "6px 6px 16px rgba(241,90,43,0.45), -2px -2px 8px rgba(255,255,255,0.6)" }}
            whileTap={{ scale: 0.97 }} onClick={() => setModal("add")}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "11px 22px",
              borderRadius: 50, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #f15a2b, #ee5a24)", color: "white",
              fontFamily: "DM Sans", fontWeight: 700, fontSize: 15,
              boxShadow: "5px 5px 12px rgba(241,90,43,0.4), -2px -2px 6px rgba(255,255,255,0.5)",
              whiteSpace: "nowrap",
            }}>
            <Plus size={17} strokeWidth={2.5} /> New Note
          </motion.button>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", border: "4px solid #f15a2b",
              borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: 300, gap: 16 }}>
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity }}
              style={{ width: 80, height: 80, borderRadius: 24,
                background: "linear-gradient(135deg, #e8ecf4, #d8dfe8)",
                boxShadow: "6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.9)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={38} color="#f15a2b" />
            </motion.div>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 22, color: "#1e2a3a", margin: 0 }}>
              {search ? "No notes found" : "No notes yet"}
            </h3>
            <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "#9aa5b4", margin: 0 }}>
              {search ? "Try a different search" : 'Tap "New Note" to create your first one'}
            </p>
          </motion.div>
        ) : (
          <motion.div layout style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 18,
            paddingBottom: 24,
          }}>
            <AnimatePresence>
              {filtered.map((note) => (
                <NoteCard key={note.id} note={note}
                  onEdit={() => setModal(note)}
                  onDelete={() => handleDelete(note.id)}
                  onTogglePin={() => handleTogglePin(note)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal !== null && (
          <NoteModal
            note={modal === "add" ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
