"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Link, AlertTriangle, RefreshCw } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/types";
import ToggleSwitch from "./ToggleSwitch";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  borderRadius: 18,
  border: "none",
  background: "#e8ecf4",
  boxShadow: "inset 4px 4px 8px rgba(163,177,198,0.55), inset -4px -4px 8px rgba(255,255,255,0.85)",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 15,
  color: "#1e2a3a",
  outline: "none",
  resize: "none" as const,
};

export default function EditTaskModal({ isOpen, onClose, task }: EditTaskModalProps) {
  const { updateTask } = useTaskStore();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [type, setType] = useState<"daily" | "onetime">(task.type);
  const [hasLink, setHasLink] = useState(!!task.link);
  const [link, setLink] = useState(task.link || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(task.priority);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setType(task.type);
    setHasLink(!!task.link);
    setLink(task.link || "");
    setPriority(task.priority);
  }, [task]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }
    const updates: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      link: hasLink && link.trim() ? link.trim() : null as any,
    };
    updateTask(task.id, updates);
    onClose();
  };

  const priorities: { id: Task["priority"]; color: string; label: string }[] = [
    { id: "high", color: "#f15a2b", label: "High" },
    { id: "medium", color: "#e17055", label: "Medium" },
    { id: "low", color: "#00b894", label: "Low" },
  ];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 500,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 32,
              background: "#e8ecf4",
              boxShadow: "12px 12px 30px rgba(0,0,0,0.2), -10px -10px 30px rgba(255,255,255,0.9)",
              padding: "40px 36px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
               <h2
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 900,
                  fontSize: 26,
                  color: "#1e2a3a",
                  margin: 0,
                  flex: 1
                }}
              >
                Edit Task ✏️
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  background: "#e8ecf4",
                  boxShadow: "4px 4px 10px rgba(163,177,198,0.6), -4px -4px 10px rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9aa5b4",
                }}
              >
                <X size={18} strokeWidth={2.5} />
              </motion.button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                 <label
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#9aa5b4",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Review project docs"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (error) setError(""); }}
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#9aa5b4",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Short Description
                </label>
                <textarea
                  placeholder="Quick note about this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                     fontFamily: "DM Sans, sans-serif",
                     fontSize: 13,
                     fontWeight: 800,
                     color: "#9aa5b4",
                     textTransform: "uppercase",
                     letterSpacing: "0.1em",
                     display: "block",
                     marginBottom: 12,
                  }}
                >
                  Task Type
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["daily", "onetime"] as const).map((t) => {
                    const isSelected = type === t;
                    return (
                      <motion.button
                        key={t}
                        onClick={() => setType(t)}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          flex: 1,
                          padding: "14px 16px",
                          borderRadius: 50,
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 800,
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          background: isSelected
                            ? t === "daily" ? "linear-gradient(135deg, #4facfe, #0984e3)" : "linear-gradient(135deg, #f15a2b, #ee5a24)"
                            : "#e8ecf4",
                          color: isSelected ? "white" : "#9aa5b4",
                          boxShadow: isSelected ? "inset 3px 3px 6px rgba(0,0,0,0.2)" : "5px 5px 12px rgba(163,177,198,0.5), -5px -5px 12px rgba(255,255,255,0.8)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {t === "daily" ? <RefreshCw size={14} strokeWidth={2.5} /> : <Check size={14} strokeWidth={2.5} />}
                        {t === "daily" ? "Daily" : "One Time"}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#9aa5b4",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Add Link?
                  </label>
                  <ToggleSwitch checked={hasLink} onChange={setHasLink} />
                </div>
                <AnimatePresence>
                  {hasLink && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden", marginTop: 12 }}
                    >
                      <div style={{ position: "relative" }}>
                        <Link size={16} color="#9aa5b4" style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)" }} />
                        <input
                          type="url"
                          placeholder="https://..."
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          style={{ ...inputStyle, paddingLeft: 46 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#9aa5b4",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  Priority
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {priorities.map((p) => (
                    <motion.button
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      whileTap={{ scale: 0.92 }}
                      style={{
                        flex: 1,
                        padding: "12px 10px",
                        borderRadius: 50,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: priority === p.id ? `${p.color}15` : "#e8ecf4",
                        color: priority === p.id ? p.color : "#9aa5b4",
                        boxShadow: priority === p.id ? "inset 2px 2px 5px rgba(0,0,0,0.1)" : "4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.8)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0, boxShadow: priority === p.id ? `0 0 8px ${p.color}60` : "none" }} />
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 16, background: "rgba(241,90,43,0.06)", boxShadow: "inset 2px 2px 5px rgba(241,90,43,0.1)" }}>
                    <AlertTriangle size={16} color="#f15a2b" />
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#f15a2b", fontWeight: 700 }}>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 50,
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(115deg, #f15a2b, #ee5a24)",
                  color: "white",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 900,
                  fontSize: 17,
                  boxShadow: "6px 6px 16px rgba(241,90,43,0.4), -4px -4px 12px rgba(255,255,255,0.8)",
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                Save Changes →
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
