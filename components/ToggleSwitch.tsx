"use client";

import { motion } from "framer-motion";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {label && (
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: "#9aa5b4",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 58,
          height: 30,
          borderRadius: 50,
          border: "none",
          cursor: "pointer",
          background: checked
            ? "linear-gradient(135deg, #f15a2b, #ee5a24)"
            : "#d8dde8",
          boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.12), inset -3px -3px 6px rgba(255,255,255,0.8)",
          position: "relative",
          transition: "all 0.3s ease",
          outline: "none",
          padding: 0,
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={{ x: checked ? 30 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "white",
            boxShadow: "1px 1px 4px rgba(0,0,0,0.15), -1px -1px 3px rgba(255,255,255,0.4)",
            position: "absolute",
            top: 4,
          }}
        />
      </button>
    </div>
  );
}
