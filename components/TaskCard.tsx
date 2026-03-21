"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Pencil, ExternalLink, RefreshCw, Minus, RotateCcw, Sun } from "lucide-react";
import { Task } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import { useState, useEffect } from "react";
import EditTaskModal from "./EditTaskModal";
import confetti from "canvas-confetti";

interface TaskCardProps {
  task: Task;
}

function formatDate(iso: string): string {
  if (!iso) return "Added today";
  const date = new Date(iso);
  const today = new Date();
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Added today";
  if (diffDays === 1) return "Added yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

const priorityColors: Record<string, string> = {
  high: "#f15a2b",
  medium: "#e17055",
  low: "#00b894",
};

export default function TaskCard({ task }: TaskCardProps) {
  const { toggleComplete, deleteTask } = useTaskStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const isDaily = task.type === "daily";
  const isDoneToday = isDaily && task.completed;

  // Flash on update
  useEffect(() => {
    if (task.updated_at) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [task.updated_at, task.title, task.description, task.priority, task.link, task.type]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          backgroundColor: isFlashing
            ? "rgba(241, 90, 43, 0.12)"
            : isDoneToday
            ? "rgba(0, 184, 148, 0.04)"
            : "var(--bg-card)",
        }}
        exit={{ opacity: 0, scale: 0.85, y: -10 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 28,
          backgroundColor: { duration: 0.4 },
        }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{
          borderRadius: 24,
          padding: "0",
          boxShadow: isDoneToday
            ? "inset 4px 4px 8px rgba(0,184,148,0.12), inset -4px -4px 8px rgba(255,255,255,0.8), 0 0 0 1.5px rgba(0,184,148,0.18)"
            : task.completed
            ? "inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.7)"
            : "8px 8px 18px rgba(163,177,198,0.55), -8px -8px 18px rgba(255,255,255,0.95)",
          display: "flex",
          flexDirection: "column",
          cursor: "default",
          position: "relative",
          overflow: "hidden",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Daily "Done Today" status banner at top */}
        {isDaily && (
          <div
            style={{
              padding: "7px 20px",
              background: isDoneToday
                ? "linear-gradient(90deg, rgba(0,184,148,0.15), rgba(0,184,148,0.05))"
                : "linear-gradient(90deg, rgba(79,172,254,0.10), rgba(9,132,227,0.05))",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: isDoneToday
                ? "1px solid rgba(0,184,148,0.15)"
                : "1px solid rgba(79,172,254,0.12)",
            }}
          >
            <Sun
              size={12}
              color={isDoneToday ? "#00b894" : "#4facfe"}
              strokeWidth={2.5}
            />
            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isDoneToday ? "#00b894" : "#4facfe",
              }}
            >
              {isDoneToday ? "✓ Done for today" : "Today's status: pending"}
            </span>
          </div>
        )}

        {/* Card Body */}
        <div style={{ padding: "20px 24px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Action Buttons (Top Right) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.9 }}
                style={{
                  position: "absolute",
                  top: isDaily ? 46 : 14,
                  right: 14,
                  display: "flex",
                  gap: 8,
                  zIndex: 10,
                }}
              >
                {/* Edit Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: "#e8ecf4",
                    boxShadow: "4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#9aa5b4",
                  }}
                >
                  <Pencil size={14} />
                </motion.button>

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.1, color: "#f15a2b" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: "#e8ecf4",
                    boxShadow: "4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#9aa5b4",
                  }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TOP: Title + Description */}
          <div>
            <h3
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: isDoneToday ? "#00b894" : "#1e2a3a",
                marginBottom: 6,
                textDecoration: !isDaily && task.completed ? "line-through" : "none",
                paddingRight: isHovered ? 85 : 30,
                lineHeight: 1.3,
                transition: "color 0.3s ease, padding-right 0.2s ease",
              }}
            >
              {task.title}
            </h3>
            {task.description && (
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 14,
                  color: "#9aa5b4",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  margin: 0,
                }}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* MIDDLE: Badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* Type Badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 50,
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: "DM Sans, sans-serif",
                background:
                  task.type === "daily"
                    ? "linear-gradient(135deg, #4facfe, #0984e3)"
                    : "linear-gradient(135deg, #f15a2b, #ee5a24)",
                color: "white",
                boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.15)",
              }}
            >
              {task.type === "daily" ? (
                <RefreshCw size={11} strokeWidth={2.5} />
              ) : (
                <Check size={11} strokeWidth={2.5} />
              )}
              {task.type === "daily" ? "Daily" : "One Time"}
            </span>

            {/* Priority Dot */}
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: priorityColors[task.priority],
                boxShadow: `0 0 8px ${priorityColors[task.priority]}60`,
                flexShrink: 0,
              }}
              title={`${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority`}
            />

            {/* Link Button */}
            {task.link && (
              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 50,
                  fontSize: 11.5,
                  fontWeight: 600,
                  fontFamily: "DM Sans, sans-serif",
                  background: "#e8ecf4",
                  color: "#9aa5b4",
                  boxShadow: "3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "inset 2px 2px 5px rgba(163,177,198,0.5)";
                  (e.currentTarget as HTMLElement).style.color = "#1e2a3a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.8)";
                  (e.currentTarget as HTMLElement).style.color = "#9aa5b4";
                }}
              >
                <ExternalLink size={11} strokeWidth={2} />
                Link
              </a>
            )}
          </div>

          {/* BOTTOM: Date + Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: "#b2bec3",
                fontWeight: 500,
              }}
            >
              {formatDate(task.created_at || new Date().toISOString())}
            </span>

            {/* --- DAILY TASK: "Done Today" toggle --- */}
            {isDaily ? (
              <motion.button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const newState = !task.completed;
                  toggleComplete(task.id, newState);
                  if (newState) {
                    confetti({
                      particleCount: 150,
                      spread: 80,
                      origin: { y: 0.6 },
                      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
                      zIndex: 1000,
                      disableForReducedMotion: true
                    });
                  }
                }}
                whileTap={{ scale: 0.88 }}
                title={isDoneToday ? "Mark as not done for today (move back to active)" : "Mark as done for today"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 16px",
                  borderRadius: 50,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 800,
                  fontSize: 12.5,
                  background: isDoneToday
                    ? "linear-gradient(135deg, #00b894, #00cec9)"
                    : "#e8ecf4",
                  color: isDoneToday ? "white" : "#9aa5b4",
                  boxShadow: isDoneToday
                    ? "inset 2px 2px 5px rgba(0,0,0,0.15), 0 0 12px rgba(0,184,148,0.3)"
                    : "4px 4px 10px rgba(163,177,198,0.6), -4px -4px 10px rgba(255,255,255,0.9)",
                  transition: "all 0.3s ease",
                }}
              >
                <AnimatePresence mode="wait">
                  {isDoneToday ? (
                    <motion.div
                      key="done"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <RotateCcw size={13} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="undone"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {isDoneToday ? "Restore" : "Mark Done"}
              </motion.button>
            ) : (
              /* --- ONE-TIME TASK: Restore/Toggle --- */
              <motion.button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const newState = !task.completed;
                  toggleComplete(task.id, newState);
                  if (newState) {
                    confetti({
                      particleCount: 150,
                      spread: 80,
                      origin: { y: 0.6 },
                      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
                      zIndex: 1000,
                      disableForReducedMotion: true
                    });
                  }
                }}
                whileTap={{ scale: 0.88 }}
                title={task.completed ? "Mark as incomplete (move back to active)" : "Mark as complete"}
                style={{
                  gap: task.completed ? 7 : 0,
                  padding: task.completed ? "8px 16px" : "0",
                  width: task.completed ? "auto" : 38,
                  height: 38,
                  borderRadius: task.completed ? 50 : "50%",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 800,
                  fontSize: 12.5,
                  background: task.completed
                    ? "linear-gradient(135deg, #f15a2b, #ee5a24)"
                    : "#e8ecf4",
                  color: task.completed ? "white" : "#9aa5b4",
                  boxShadow: task.completed
                    ? "inset 3px 3px 6px rgba(0,0,0,0.2)"
                    : "4px 4px 10px rgba(163,177,198,0.6), -4px -4px 10px rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <AnimatePresence mode="wait">
                  {task.completed ? (
                    <motion.div
                      key="restore"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 20 }}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <RotateCcw size={14} color="white" strokeWidth={3.5} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check size={18} color="#9aa5b4" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {task.completed && "Restore"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={task}
      />
    </>
  );
}
