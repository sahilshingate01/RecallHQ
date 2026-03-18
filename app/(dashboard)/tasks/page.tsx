"use client";

import { useEffect, useState } from "react";
import { ListTodo, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore } from "@/store/taskStore";
import TaskCard from "@/components/TaskCard";
import AddTaskModal from "@/components/AddTaskModal";
import EmptyState from "@/components/EmptyState";

/* ── Stat card (identical style to Dashboard) ── */
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
      }}
    >
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

export default function TasksPage() {
  const { tasks, fetchTasks, loading, getTotalTasks, getCompletedToday, getPending } =
    useTaskStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const todayStr = new Date().toISOString().split("T")[0];
  
  const pendingTasks = tasks.filter((t) => {
    if (t.type === "daily") {
      return !(t.completed && t.completed_at && t.completed_at.startsWith(todayStr));
    }
    return !t.completed;
  });

  const completedTasks = tasks.filter((t) => {
    if (t.type === "daily") {
      return t.completed && t.completed_at && t.completed_at.startsWith(todayStr);
    }
    return t.completed;
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
          marginBottom: 32,
          flexShrink: 0,
        }}
      >
        <StatCard
          delay={0.1}
          label="Total Tasks"
          value={getTotalTasks()}
          icon={ListTodo}
          iconBg="linear-gradient(135deg, #4facfe, #0984e3)"
          iconShadow="4px 4px 10px rgba(79,172,254,0.45)"
          valueColor="#1e2a3a"
        />
        <StatCard
          delay={0.2}
          label="Completed Today"
          value={getCompletedToday()}
          icon={CheckCircle2}
          iconBg="linear-gradient(135deg, #fd79a8, #e17055)"
          iconShadow="4px 4px 10px rgba(253,121,168,0.45)"
          valueColor="#e17055"
        />
        <StatCard
          delay={0.3}
          label="Pending"
          value={getPending()}
          icon={Clock}
          iconColor="#9aa5b4"
          iconBg="#e0e5ef"
          iconShadow="inset 3px 3px 7px rgba(163,177,198,0.5), inset -3px -3px 7px rgba(255,255,255,0.85)"
          valueColor="#9aa5b4"
        />
      </div>

      {/* ── Task list ── */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 260,
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "4px solid #f15a2b",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p
              style={{
                color: "#9aa5b4",
                fontWeight: 600,
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
              }}
            >
              Syncing tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingBottom: 40 }}>
            
            {/* Active Tasks Section */}
            {pendingTasks.length > 0 && (
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    fontFamily: "Nunito, sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#57606f",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  Active Tasks
                  <span style={{ fontSize: 13, color: "#9aa5b4", fontWeight: 600 }}>({pendingTasks.length})</span>
                </motion.h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 20,
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {pendingTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
              <div style={{ opacity: 0.85 }}>
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    fontFamily: "Nunito, sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#57606f",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  Completed Today
                  <span style={{ fontSize: 13, color: "#9aa5b4", fontWeight: 600 }}>({completedTasks.length})</span>
                </motion.h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 20,
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {completedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {pendingTasks.length === 0 && completedTasks.length === 0 && <EmptyState />}
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
