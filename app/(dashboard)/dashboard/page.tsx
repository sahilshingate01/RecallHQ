"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTaskStore } from "@/store/taskStore";
import { ClipboardList, CheckCircle2, Clock, Archive } from "lucide-react";

/* ── Shared card shell ─────────────────────────────────── */
function StatCard({
  delay,
  iconBg,
  iconShadow,
  icon: Icon,
  iconColor = "white",
  label,
  value,
  valueColor,
}: {
  delay: number;
  iconBg: string;
  iconShadow: string;
  icon: React.ElementType;
  iconColor?: string;
  label: string;
  value: number;
  valueColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      style={{
        background: "#e8ecf4",
        borderRadius: 28,
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: 22,
        boxShadow:
          "8px 8px 18px rgba(163,177,198,0.6), -8px -8px 18px rgba(255,255,255,0.95)",
        cursor: "default",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* Icon box */}
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: 20,
          flexShrink: 0,
          background: iconBg,
          boxShadow: iconShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={28} color={iconColor} strokeWidth={2} />
      </div>

      {/* Text */}
      <div>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#9aa5b4",
            margin: 0,
            marginBottom: 6,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "Nunito, sans-serif",
            fontSize: 40,
            fontWeight: 900,
            color: valueColor,
            margin: 0,
            lineHeight: 1,
          }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Dashboard Page ────────────────────────────────────── */
export default function Dashboard() {
  const { fetchTasks, tasks, loading, getTotalTasks, getCompletedToday, getPending } =
    useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {/* Total Tasks — blue gradient */}
        <StatCard
          delay={0.1}
          label="Total Tasks"
          value={getTotalTasks()}
          icon={ClipboardList}
          iconBg="linear-gradient(135deg, #4facfe, #0984e3)"
          iconShadow="4px 4px 10px rgba(79,172,254,0.45)"
          valueColor="#1e2a3a"
        />

        {/* Completed — pink/coral gradient */}
        <StatCard
          delay={0.2}
          label="Completed"
          value={getCompletedToday()}
          icon={CheckCircle2}
          iconBg="linear-gradient(135deg, #fd79a8, #e17055)"
          iconShadow="4px 4px 10px rgba(253,121,168,0.45)"
          valueColor="#e17055"
        />

        {/* Pending — recessed / inset look */}
        <StatCard
          delay={0.3}
          label="Pending"
          value={getPending()}
          icon={Clock}
          iconColor="#9aa5b4"
          iconBg="#d8dde8"
          iconShadow="inset 3px 3px 7px rgba(163,177,198,0.55), inset -3px -3px 7px rgba(255,255,255,0.85)"
          valueColor="#9aa5b4"
        />
      </div>

      {/* ── Empty state / task summary ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 60,
          textAlign: "center",
        }}
      >
        {tasks.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* circle */}
            <div
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
                margin: "0 auto",
              }}
            >
              <Archive size={46} color="#b0bac5" strokeWidth={1.5} />
            </div>

            {/* headline */}
            <h3
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "#1e2a3a",
                marginTop: 20,
                marginBottom: 0,
              }}
            >
              Nothing here yet.
            </h3>

            {/* sub */}
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "#9aa5b4",
                fontWeight: 400,
                marginTop: 6,
              }}
            >
              Add your first task to get started! 🚀
            </p>
          </motion.div>
        ) : !loading ? (
          <div
            style={{
              fontFamily: "DM Sans, sans-serif",
              color: "#9aa5b4",
              fontSize: 14,
            }}
          >
            <p>You have {tasks.length} task{tasks.length !== 1 ? "s" : ""} in your list.</p>
            <button
              onClick={() => (window.location.href = "/tasks")}
              style={{
                marginTop: 16,
                padding: "10px 22px",
                borderRadius: 50,
                border: "none",
                background: "#ecf0f8",
                boxShadow:
                  "4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.85)",
                color: "#1e2a3a",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
              }}
            >
              View All Tasks →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
