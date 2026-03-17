"use client";

import { motion } from "framer-motion";
import { Archive } from "lucide-react";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      {/* Floating neumorphic circle */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "#e8ecf4",
          boxShadow:
            "10px 10px 22px rgba(163,177,198,0.65), -10px -10px 22px rgba(255,255,255,0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 0,
        }}
      >
        <Archive size={46} color="#b0bac5" strokeWidth={1.5} />
      </motion.div>

      {/* Headline */}
      <h3
        style={{
          fontFamily: "Nunito, sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color: "#1e2a3a",
          marginTop: 24,
          marginBottom: 0,
        }}
      >
        Nothing here yet.
      </h3>

      {/* Sub */}
      <p
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 15,
          color: "#9aa5b4",
          fontWeight: 400,
          marginTop: 8,
        }}
      >
        Add your first task to get started! 🚀
      </p>
    </motion.div>
  );
}
