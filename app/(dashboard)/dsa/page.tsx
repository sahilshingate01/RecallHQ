"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Star,
  ChevronDown,
  ChevronUp,
  LayoutTemplate
} from "lucide-react";
import { dsaData } from "@/lib/dsaData";
import confetti from "canvas-confetti";

// Calculate totals flatly
const allProblems = dsaData.flatMap(s => s.lecs).flatMap(l => l.problems);
const totalProblemsCount = allProblems.length;

// --- Styles mapping ---
const difficultyColors: Record<string, { bg: string, text: string }> = {
  Basic: { bg: "#e0f2fe", text: "#0369a1" },
  Easy: { bg: "#e6f4ea", text: "#1e8e3e" },
  Medium: { bg: "#fef7e0", text: "#e37400" },
  Hard: { bg: "#fce8e6", text: "#d93025" },
};

/* ── Custom UI Components ─────────────────────────────── */

function ProgressBar({ current, total, color = "#f15a2b" }: { current: number, total: number, color?: string }) {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#9aa5b4", fontFamily: "DM Sans" }}>
          Progress
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: color, fontFamily: "Nunito" }}>
          {percentage}%
        </span>
      </div>
      <div style={{
        height: 10,
        background: "rgba(163,177,198,0.25)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)"
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 10 }}
        />
      </div>
    </div>
  );
}

/* ── Main Page Component ──────────────────────────────── */
export default function DSAPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  
  // Collapse state for Steps and Lectures
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});
  const [openLectures, setOpenLectures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load from LocalStorage individually per requirement
    const initCompleted: Record<string, boolean> = {};
    const initBookmarked: Record<string, boolean> = {};
    
    dsaData.forEach((step, sIdx) => {
      step.lecs.forEach((lec, lIdx) => {
        lec.problems.forEach((prob, pIdx) => {
          const compKey = `dsa_complete_${sIdx}_${lIdx}_${pIdx}`;
          const bookKey = `dsa_bookmark_${sIdx}_${lIdx}_${pIdx}`;
          if (localStorage.getItem(compKey) === "true") initCompleted[compKey] = true;
          if (localStorage.getItem(bookKey) === "true") initBookmarked[bookKey] = true;
        });
      });
    });
    setCompleted(initCompleted);
    setBookmarked(initBookmarked);
  }, []);

  const toggleComplete = (key: string) => {
    const isDone = completed[key];
    const newState = !isDone;
    setCompleted(prev => ({ ...prev, [key]: newState }));
    if (newState) {
      localStorage.setItem(key, "true");
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
        zIndex: 1000,
        disableForReducedMotion: true
      });
    } else {
      localStorage.removeItem(key);
    }
  };

  const toggleBookmark = (key: string) => {
    const isBooked = bookmarked[key];
    const newState = !isBooked;
    setBookmarked(prev => ({ ...prev, [key]: newState }));
    if (newState) {
      localStorage.setItem(key, "true");
    } else {
      localStorage.removeItem(key);
    }
  };

  const toggleStep = (id: string) => {
    setOpenSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLecture = (id: string) => {
    setOpenLectures(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div style={{ paddingBottom: 60, maxWidth: 1000, margin: "0 auto" }}>
      
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#e8ecf4",
          borderRadius: 24,
          padding: "36px 40px",
          marginBottom: 40,
          boxShadow: "8px 8px 18px rgba(163,177,198,0.6), -8px -8px 18px rgba(255,255,255,0.95)",
          display: "flex",
          alignItems: "center",
          gap: 30
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: "linear-gradient(135deg, #f15a2b, #e14d24)",
          boxShadow: "4px 4px 12px rgba(241,90,43,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <LayoutTemplate size={40} color="white" />
        </div>
        
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 32,
            color: "#1e2a3a", margin: 0, marginBottom: 8, letterSpacing: "-0.5px"
          }}>
            DSA Progress Tracker
          </h1>
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "#636e72", margin: 0, marginBottom: 16
          }}>
            Master Data Structures and Algorithms step by step.
          </p>
          <ProgressBar current={completedCount} total={totalProblemsCount} />
          <p style={{ marginTop: 12, fontSize: 13, fontFamily: "DM Sans", color: "#9aa5b4", fontWeight: 600 }}>
            {completedCount} / {totalProblemsCount} Problems Solved
          </p>
        </div>
      </motion.div>

      {/* ── Steps List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {dsaData.map((step, sIdx) => {
          const stepId = String(sIdx);
          const stepTotal = step.lecs.flatMap(l => l.problems).length;
          
          let stepCompleted = 0;
          step.lecs.forEach((lec, lIdx) => {
            lec.problems.forEach((prob, pIdx) => {
               if (completed[`dsa_complete_${sIdx}_${lIdx}_${pIdx}`]) {
                 stepCompleted++;
               }
            });
          });

          const isStepOpen = openSteps[stepId];

          return (
            <motion.div
              key={stepId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#e8ecf4",
                borderRadius: 20,
                boxShadow: "6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.9)",
                overflow: "hidden"
              }}
            >
              {/* Step Header */}
              <div 
                onClick={() => toggleStep(stepId)}
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  background: isStepOpen ? "rgba(236,240,248,0.6)" : "transparent",
                  borderBottom: isStepOpen ? "1px solid rgba(163,177,198,0.2)" : "none",
                }}
              >
                <div style={{ flex: 1, paddingRight: 20 }}>
                  <h2 style={{
                    fontFamily: "Nunito, sans-serif", fontSize: 20, fontWeight: 800,
                    color: "#1e2a3a", margin: 0, marginBottom: 10
                  }}>
                    {step.step}
                  </h2>
                  <ProgressBar current={stepCompleted} total={stepTotal} color="#0984e3" />
                </div>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: 16, 
                  fontFamily: "DM Sans", fontSize: 14, fontWeight: 600, color: "#636e72" 
                }}>
                  <span>{stepCompleted}/{stepTotal}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "#e8ecf4",
                    boxShadow: "2px 2px 5px rgba(163,177,198,0.4), -2px -2px 5px rgba(255,255,255,0.8)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {isStepOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Step Content (Lectures) */}
              <AnimatePresence>
                {isStepOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "16px 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                      
                      {step.lecs.map((lecture, lIdx) => {
                        const lecId = `${sIdx}_${lIdx}`;
                        const lecTotal = lecture.problems.length;
                        
                        let lecCompleted = 0;
                        lecture.problems.forEach((prob, pIdx) => {
                           if (completed[`dsa_complete_${sIdx}_${lIdx}_${pIdx}`]) {
                             lecCompleted++;
                           }
                        });

                        const isLecOpen = openLectures[lecId];

                        return (
                          <div key={lecId} style={{
                            background: "#f0f4f9",
                            borderRadius: 16,
                            boxShadow: "inset 2px 2px 6px rgba(163,177,198,0.3), inset -2px -2px 6px rgba(255,255,255,0.7)",
                            overflow: "hidden"
                          }}>
                            {/* Lecture Header */}
                            <div
                              onClick={() => toggleLecture(lecId)}
                              style={{
                                padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                                cursor: "pointer", userSelect: "none"
                              }}
                            >
                              <h3 style={{
                                fontFamily: "Nunito, sans-serif", fontSize: 16, fontWeight: 700, color: "#2d3748", margin: 0
                              }}>
                                {lecture.lec}
                              </h3>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontFamily: "DM Sans", fontSize: 13, fontWeight: 600, color: "#718096" }}>
                                  {lecCompleted}/{lecTotal}
                                </span>
                                {isLecOpen ? <ChevronUp size={16} color="#718096" /> : <ChevronDown size={16} color="#718096" />}
                              </div>
                            </div>

                            {/* Lecture Problems */}
                            <AnimatePresence>
                              {isLecOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <div style={{ padding: "0 12px 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                                    {lecture.problems.map((prob, pIdx) => {
                                      const compKey = `dsa_complete_${sIdx}_${lIdx}_${pIdx}`;
                                      const bookKey = `dsa_bookmark_${sIdx}_${lIdx}_${pIdx}`;

                                      const isDone = completed[compKey];
                                      const isBookmarked = bookmarked[bookKey];
                                      
                                      return (
                                        <div key={pIdx} style={{
                                          display: "flex", alignItems: "center", gap: 16,
                                          padding: "14px 16px",
                                          background: isDone ? "rgba(225,244,232,0.5)" : "#e8ecf4",
                                          borderRadius: 12,
                                          boxShadow: "2px 2px 6px rgba(163,177,198,0.3), -2px -2px 6px rgba(255,255,255,0.8)",
                                          transition: "all 0.2s"
                                        }}>
                                          {/* Checkbox */}
                                          <div 
                                            onClick={() => toggleComplete(compKey)}
                                            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                          >
                                            {isDone ? 
                                              <CheckCircle2 size={22} color="#10b981" fill="#d1fae5" strokeWidth={2} /> 
                                              : 
                                              <Circle size={22} color="#a0aec0" strokeWidth={2} />
                                            }
                                          </div>
                                          
                                          {/* Title */}
                                          <span 
                                            style={{
                                              flex: 1, fontFamily: "DM Sans, sans-serif", fontSize: 15, fontWeight: 600,
                                              color: isDone ? "#4a5568" : "#1e2a3a", textDecoration: isDone ? "line-through" : "none"
                                            }}
                                          >
                                            {prob.name}
                                          </span>

                                          {/* Tags */}
                                          {prob.tags && prob.tags.length > 0 && (
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
                                              {prob.tags.map(tag => (
                                                <span key={tag} style={{
                                                  background: "#e1effe", color: "#1e40af", padding: "4px 10px",
                                                  borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "DM Sans"
                                                }}>
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          )}

                                          {/* Difficulty */}
                                          {prob.difficulty && difficultyColors[prob.difficulty] && (
                                            <div style={{
                                              background: difficultyColors[prob.difficulty].bg,
                                              color: difficultyColors[prob.difficulty].text,
                                              padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                              fontFamily: "DM Sans", minWidth: 60, textAlign: "center"
                                            }}>
                                              {prob.difficulty}
                                            </div>
                                          )}

                                          {/* Actions */}
                                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <Star 
                                              size={18} 
                                              color={isBookmarked ? "#f59e0b" : "#cbd5e1"} 
                                              fill={isBookmarked ? "#f59e0b" : "transparent"} 
                                              onClick={() => toggleBookmark(bookKey)}
                                              style={{ cursor: "pointer", transition: "all 0.2s" }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            
                          </div>
                        );
                      })}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      
    </div>
  );
}
