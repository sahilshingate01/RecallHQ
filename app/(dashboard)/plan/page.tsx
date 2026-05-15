"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanStore } from "@/store/planStore";
import { planData, WeekPlan } from "@/lib/planData";
import { 
  Code, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Trophy,
  Flame
} from "lucide-react";
import { fadeIn, staggerContainer, cardShadowHover } from "@/lib/animations";

/* ── Components ────────────────────────────────────────── */

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{ 
      width: "100%", 
      height: 8, 
      background: "#d8dde8", 
      borderRadius: 10, 
      overflow: "hidden",
      boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.1)"
    }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ 
          height: "100%", 
          background: "linear-gradient(90deg, #f15a2b, #ff7e5f)",
          borderRadius: 10 
        }}
      />
    </div>
  );
}

function TaskItem({ taskId, text }: { taskId: string, text: string }) {
  const { completedTasks, toggleTask } = usePlanStore();
  const isCompleted = completedTasks[taskId] || false;

  return (
    <motion.div
      variants={fadeIn}
      onClick={() => toggleTask(taskId)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 16,
        background: isCompleted ? "rgba(236,240,248,0.6)" : "transparent",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      whileHover={{ x: 4, background: "rgba(236,240,248,0.8)" }}
    >
      <div style={{ marginTop: 2 }}>
        {isCompleted ? (
          <CheckCircle2 size={18} color="#f15a2b" />
        ) : (
          <Circle size={18} color="#9aa5b4" />
        )}
      </div>
      <span style={{
        fontFamily: "DM Sans, sans-serif",
        fontSize: 14,
        color: isCompleted ? "#9aa5b4" : "#1e2a3a",
        textDecoration: isCompleted ? "line-through" : "none",
        lineHeight: 1.4
      }}>
        {text}
      </span>
    </motion.div>
  );
}

function TrackCard({ title, icon: Icon, trackData, color, activeDay }: { 
  title: string, 
  icon: React.ElementType, 
  trackData: any,
  color: string,
  activeDay: number
}) {
  const filteredTasks = trackData.tasks.filter((t: any) => t.days.includes(activeDay));

  return (
    <motion.div
      variants={fadeIn}
      style={{
        background: "#e8ecf4",
        borderRadius: 24,
        padding: 24,
        boxShadow: "8px 8px 16px rgba(163,177,198,0.5), -8px -8px 16px rgba(255,255,255,0.8)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%"
      }}
      {...cardShadowHover}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${color}33, ${color}66)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon size={20} color={color} />
        </div>
        <h3 style={{
          fontFamily: "Nunito, sans-serif",
          fontSize: 18,
          fontWeight: 800,
          color: "#1e2a3a",
          margin: 0
        }}>
          {title}
        </h3>
      </div>
      
      <p style={{
        fontFamily: "DM Sans, sans-serif",
        fontSize: 12,
        fontWeight: 600,
        color: "#9aa5b4",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        margin: 0
      }}>
        {trackData.name}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task: any) => (
            <TaskItem key={task.id} taskId={task.id} text={task.text} />
          ))
        ) : (
          <p style={{ 
            fontSize: 13, 
            color: "#9aa5b4", 
            fontStyle: "italic",
            padding: "12px 16px" 
          }}>
            No specific tasks for Day {activeDay}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function DayTracker({ week, activeDay, onSelectDay }: { 
  week: number, 
  activeDay: number, 
  onSelectDay: (day: number) => void 
}) {
  const { completedDays, toggleDay } = usePlanStore();
  const days = [1, 2, 3, 4, 5, 6, 7];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
      {days.map((day, idx) => {
        const isCompleted = completedDays[`${week}-${day}`] || false;
        const isActive = activeDay === day;
        
        return (
          <motion.div
            key={day}
            onClick={() => onSelectDay(day)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "10px 18px",
              borderRadius: 18,
              background: isActive 
                ? "linear-gradient(135deg, #f15a2b, #ff7e5f)" 
                : isCompleted 
                  ? "rgba(0, 184, 148, 0.15)" 
                  : "#e8ecf4",
              color: isActive ? "white" : isCompleted ? "#00b894" : "#9aa5b4",
              boxShadow: isActive
                ? "4px 4px 12px rgba(241, 90, 43, 0.3)"
                : isCompleted
                  ? "none"
                  : "4px 4px 10px rgba(163,177,198,0.4), -4px -4px 10px rgba(255,255,255,0.8)",
              border: isCompleted && !isActive ? "2px solid #00b894" : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 70,
              transition: "all 0.3s ease",
              position: "relative"
            }}
          >
            <span style={{ 
              fontSize: 10, 
              fontWeight: 800, 
              textTransform: "uppercase", 
              opacity: isActive ? 1 : 0.7,
              letterSpacing: "1px",
              marginBottom: 2
            }}>
              {dayNames[idx]}
            </span>
            <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "Nunito, sans-serif" }}>
              Day {day}
            </span>
            
            {/* Toggle completion dot */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                toggleDay(week, day);
              }}
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: isCompleted ? "#00b894" : "#d8dde8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #e8ecf4",
                boxShadow: "2px 2px 5px rgba(0,0,0,0.1)"
              }}
            >
              {isCompleted && <CheckCircle2 size={12} color="white" />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */

export default function PlanPage() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeDay, setActiveDay] = useState(1);
  const { completedTasks } = usePlanStore();

  const currentWeekData = planData.find(w => w.week === activeWeek) || planData[0];

  // Calculate progress
  const allTasks = planData.flatMap(w => [
    ...w.tracks.DSA.tasks,
    ...w.tracks.Development.tasks,
    ...w.tracks.DevOps.tasks
  ]);
  const completedCount = allTasks.filter(t => completedTasks[t.id]).length;
  const overallProgress = Math.round((completedCount / allTasks.length) * 100);

  const weekTasks = [
    ...currentWeekData.tracks.DSA.tasks,
    ...currentWeekData.tracks.Development.tasks,
    ...currentWeekData.tracks.DevOps.tasks
  ];
  const weekCompleted = weekTasks.filter(t => completedTasks[t.id]).length;
  const weekProgress = Math.round((weekCompleted / weekTasks.length) * 100);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <h1 style={{
              fontFamily: "Nunito, sans-serif",
              fontSize: 32,
              fontWeight: 900,
              color: "#1e2a3a",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              8-Week Internship Prep <Flame color="#f15a2b" fill="#f15a2b" size={28} />
            </h1>
            <p style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 16,
              color: "#9aa5b4",
              marginTop: 4
            }}>
              Master DSA, Development, and DevOps in 60 days.
            </p>
          </div>
          
          <div style={{ textAlign: "right", minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 700, color: "#1e2a3a" }}>
                Overall Progress
              </span>
              <span style={{ fontFamily: "Nunito, sans-serif", fontSize: 13, fontWeight: 900, color: "#f15a2b" }}>
                {overallProgress}%
              </span>
            </div>
            <ProgressBar progress={overallProgress} />
          </div>
        </div>

        {/* Week Tabs */}
        <div style={{ 
          display: "flex", 
          gap: 12, 
          overflowX: "auto", 
          padding: "10px 4px",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}>
          {planData.map((w) => (
            <motion.button
              key={w.week}
              onClick={() => setActiveWeek(w.week)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "12px 24px",
                borderRadius: 16,
                border: "none",
                background: activeWeek === w.week ? "#f15a2b" : "#e8ecf4",
                color: activeWeek === w.week ? "white" : "#9aa5b4",
                boxShadow: activeWeek === w.week 
                  ? "4px 4px 12px rgba(241, 90, 43, 0.3)"
                  : "4px 4px 10px rgba(163,177,198,0.4), -4px -4px 10px rgba(255,255,255,0.8)",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                whiteSpace: "nowrap",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              Week {w.week}
              {activeWeek === w.week && <ChevronRight size={16} />}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Week Title & Local Progress */}
      <motion.div
        key={activeWeek}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <h2 style={{
            fontFamily: "Nunito, sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: "#1e2a3a",
            margin: 0
          }}>
            Week {activeWeek}: {currentWeekData.title}
          </h2>
          <div style={{
            padding: "4px 12px",
            borderRadius: 20,
            background: "#e8ecf4",
            boxShadow: "inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)",
            fontSize: 12,
            fontWeight: 700,
            color: "#f15a2b",
            fontFamily: "DM Sans, sans-serif"
          }}>
            {weekProgress}% Tasks Complete
          </div>
        </div>

        <DayTracker 
          week={activeWeek} 
          activeDay={activeDay} 
          onSelectDay={setActiveDay} 
        />
      </motion.div>

      {/* Track Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        <TrackCard 
          title="DSA" 
          icon={Code} 
          trackData={currentWeekData.tracks.DSA} 
          color="#4facfe"
          activeDay={activeDay}
        />
        <TrackCard 
          title="Development" 
          icon={Terminal} 
          trackData={currentWeekData.tracks.Development} 
          color="#fd79a8"
          activeDay={activeDay}
        />
        <TrackCard 
          title="DevOps" 
          icon={Cpu} 
          trackData={currentWeekData.tracks.DevOps} 
          color="#00b894"
          activeDay={activeDay}
        />
      </motion.div>

      {/* Checkpoint Reward (Optional) */}
      {weekProgress === 100 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            marginTop: 40,
            padding: 32,
            borderRadius: 24,
            background: "linear-gradient(135deg, #f15a2b 0%, #ff7e5f 100%)",
            color: "white",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(241, 90, 43, 0.2)"
          }}
        >
          <Trophy size={48} style={{ marginBottom: 16 }} />
          <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 900, margin: 0 }}>
            Week {activeWeek} Mastered!
          </h3>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, opacity: 0.9, marginTop: 8 }}>
            You're one step closer to your dream internship. Keep the momentum going! 🚀
          </p>
        </motion.div>
      )}
    </div>
  );
}
