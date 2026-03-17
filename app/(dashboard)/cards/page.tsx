"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  CreditCard,
  Search,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { cardService, Card } from "@/lib/cardService";

const FIXED_BG = "#e8ecf4";

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
};

function CardModal({
  card,
  onClose,
  onSave,
}: {
  card: Card | null;
  onClose: () => void;
  onSave: (data: { title: string; link: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(card?.title ?? "");
  const [link, setLink] = useState(card?.link ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) { setError("Please add a name."); return; }
    if (!link.trim()) { setError("Please add a link."); return; }
    
    // Simple link validation
    let finalLink = link.trim();
    if (!finalLink.startsWith("http://") && !finalLink.startsWith("https://")) {
      finalLink = "https://" + finalLink;
    }

    setSaving(true);
    try {
      await onSave({ title: title.trim(), link: finalLink });
      onClose();
    } catch {
      setError("Failed to save card. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      key="card-modal-overlay"
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
          position: "relative", width: "100%", maxWidth: 480, borderRadius: 32, background: FIXED_BG,
          boxShadow: "12px 12px 30px rgba(0,0,0,0.2), -10px -10px 30px rgba(255,255,255,0.9)",
          padding: "36px 34px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 24, color: "#1e2a3a", margin: 0 }}>
            {card ? "Edit Card 💳" : "New Card 💳"}
          </h2>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
              background: FIXED_BG, boxShadow: "4px 4px 10px rgba(163,177,198,0.6), -4px -4px 10px rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#9aa5b4" }}>
            <X size={17} strokeWidth={2.5} />
          </motion.button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontFamily: "DM Sans", fontSize: 12, fontWeight: 800, color: "#9aa5b4",
              textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              Name *
            </label>
            <input type="text" placeholder="e.g. Portfolio Website" value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              style={inputStyle} />
          </div>

          <div>
            <label style={{ fontFamily: "DM Sans", fontSize: 12, fontWeight: 800, color: "#9aa5b4",
              textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
              Link *
            </label>
            <div style={{ position: "relative" }}>
              <LinkIcon size={16} color="#9aa5b4" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" placeholder="e.g. google.com" value={link}
                onChange={(e) => { setLink(e.target.value); setError(""); }}
                style={{ ...inputStyle, paddingLeft: 44 }} />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ color: "#f15a2b", fontFamily: "DM Sans", fontSize: 14, fontWeight: 700, margin: 0 }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%", padding: "15px", borderRadius: 50, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #f15a2b, #ee5a24)", color: "white",
              fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 16,
              boxShadow: "6px 6px 16px rgba(241,90,43,0.4), -4px -4px 12px rgba(255,255,255,0.8)",
              opacity: saving ? 0.7 : 1,
              marginTop: 10,
            }}>
            {saving ? "Saving…" : card ? "Save Changes →" : "Add Card →"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DisplayCard({
  card,
  onEdit,
  onDelete,
}: {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const handleClick = () => {
    window.open(card.link, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -8 }}
      whileHover={{ y: -5, boxShadow: "12px 12px 25px rgba(163,177,198,0.4), -8px -8px 25px rgba(255,255,255,0.9)" }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{
        borderRadius: 24, padding: "24px",
        background: FIXED_BG,
        boxShadow: "8px 8px 18px rgba(163,177,198,0.4), -8px -8px 18px rgba(255,255,255,0.9)",
        cursor: "pointer", position: "relative",
        display: "flex", flexDirection: "column", gap: 12,
        height: "100%", minHeight: 140,
        border: "1px solid rgba(255,255,255,0.4)",
      }}
      onClick={handleClick}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #f15a2b20, #f15a2b10)",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "4px 4px 10px rgba(163,177,198,0.2)" }}>
          <CreditCard size={22} color="#f15a2b" strokeWidth={2.5} />
        </div>
        <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={onEdit}
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "2px 2px 5px rgba(163,177,198,0.3)" }}>
            <span style={{ fontSize: 14 }}>✏️</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={onDelete}
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", cursor: "pointer",
              background: "rgba(241,90,43,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "2px 2px 5px rgba(163,177,198,0.2)" }}>
            <Trash2 size={14} color="#f15a2b" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 18,
          color: "#1e2a3a", margin: "4px 0 0",
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
        }}>
          {card.title}
        </h3>
        <p style={{
          fontFamily: "DM Sans", fontSize: 13, color: "#9aa5b4", margin: "6px 0 0",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 4
        }}>
          <ExternalLink size={12} /> {card.link.replace(/^https?:\/\//, "")}
        </p>
      </div>

      <div style={{ height: 4, width: "100%", background: "linear-gradient(90deg, #f15a2b, #ee5a24)", borderRadius: 10, opacity: 0.6 }} />
    </motion.div>
  );
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | Card | null>(null);

  const load = async () => {
    try {
      const data = await cardService.getCards();
      setCards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = cards.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.link.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: { title: string; link: string }) => {
    if (modal === "add") {
      const created = await cardService.addCard(data);
      setCards((prev) => [created, ...prev]);
    } else if (modal && typeof modal === "object") {
      const updated = await cardService.updateCard(modal.id, data);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    await cardService.deleteCard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 28, color: "#1e2a3a", margin: 0 }}>
            Cards 💳
          </h1>
          <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "#9aa5b4", margin: "4px 0 0" }}>
            {cards.length} card{cards.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} color="#9aa5b4"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder="Search cards…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, width: 220, padding: "10px 16px 10px 38px", borderRadius: 50, fontSize: 14 }} />
          </div>

          {/* New card button */}
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
            <Plus size={17} strokeWidth={2.5} /> New Card
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
              <CreditCard size={38} color="#f15a2b" />
            </motion.div>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 22, color: "#1e2a3a", margin: 0 }}>
              {search ? "No cards found" : "No cards yet"}
            </h3>
            <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "#9aa5b4", margin: 0 }}>
              {search ? "Try a different search" : 'Tap "New Card" to add your first link'}
            </p>
          </motion.div>
        ) : (
          <motion.div layout style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
            paddingBottom: 24,
          }}>
            <AnimatePresence>
              {filtered.map((card) => (
                <DisplayCard key={card.id} card={card}
                  onEdit={() => setModal(card)}
                  onDelete={() => handleDelete(card.id)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal !== null && (
          <CardModal
            card={modal === "add" ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
