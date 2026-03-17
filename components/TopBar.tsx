"use client";

import { motion } from "framer-motion";
import { Search, Bell, Plus } from "lucide-react";

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddTask: () => void;
  notificationCount: number;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning", emoji: "👋" };
  if (h < 17) return { text: "Good Afternoon", emoji: "☀️" };
  return { text: "Good Evening", emoji: "🌙" };
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TopBar({
  searchQuery,
  setSearchQuery,
  onAddTask,
}: TopBarProps) {
  const greeting = getGreeting();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* ── Left: Greeting ── */}
      <div>
        <h1
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 900,
            fontSize: 38,
            color: "#1e2a3a",
            lineHeight: 1.1,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {greeting.text}
          <span style={{ fontSize: 34 }}>{greeting.emoji}</span>
        </h1>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            color: "#9aa5b4",
            marginTop: 6,
            fontWeight: 400,
            margin: "6px 0 0 0",
          }}
        >
          {formatDate()}
        </p>
      </div>

      {/* ── Right: Actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

        {/* Search bar */}
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            color="#9aa5b4"
            style={{
              position: "absolute",
              left: 18,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: 240,
              padding: "12px 20px 12px 46px",
              borderRadius: 50,
              border: "none",
              background: "#e8ecf4",
              boxShadow:
                "inset 4px 4px 8px rgba(163,177,198,0.55), inset -4px -4px 8px rgba(255,255,255,0.85)",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              color: "#1e2a3a",
              outline: "none",
            }}
          />
        </div>

        {/* + Add Task */}
        <motion.button
          whileHover={{
            y: -1,
            boxShadow:
              "6px 6px 16px rgba(241,90,43,0.45), -2px -2px 8px rgba(255,255,255,0.6)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddTask}
          style={{
            padding: "12px 24px",
            borderRadius: 50,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #f15a2b, #ee5a24)",
            color: "white",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            boxShadow:
              "5px 5px 12px rgba(241,90,43,0.4), -2px -2px 6px rgba(255,255,255,0.5)",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Task
        </motion.button>

        {/* Bell */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "#e8ecf4",
            boxShadow:
              "5px 5px 10px rgba(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bell size={19} color="#636e72" strokeWidth={2} />
        </motion.button>


      </div>
    </div>
  );
}
