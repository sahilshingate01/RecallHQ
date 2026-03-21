"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position, 
  MarkerType,
  NodeProps,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, CheckCircle2, Circle, Info, ExternalLink, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fullstackNodes, fullstackEdges, FullstackNode } from '@/lib/fullstackData';

// --- Styles ---
const categoryColors: Record<string, string> = {
  "Internet/Basics": "#94a3b8",
  "Frontend": "#3B82F6",
  "Backend": "#10B981",
  "Database": "#8B5CF6",
  "DevOps/Tools": "#F59E0B",
  "DSA/CS Fundamentals": "#EF5A2A",
  "System Design": "#EF4444",
  "Projects": "#14B8A6",
};

const difficultyStyles: Record<string, { bg: string, text: string }> = {
  Beginner: { bg: "#e0f2fe", text: "#0369a1" },
  Intermediate: { bg: "#fef7e0", text: "#e37400" },
  Advanced: { bg: "#fce8e6", text: "#d93025" },
};

// --- Custom Node Component ---
const RoadmapNode = ({ data }: NodeProps<FullstackNode & { isCompleted: boolean; onToggle: (id: string) => void; onShowDetails: (data: any) => void }>) => {
  return (
    <div 
      style={{
        background: "#e8ecf4",
        borderRadius: 16,
        padding: "14px 18px",
        minWidth: 200,
        boxShadow: data.isCompleted 
          ? "inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.8)" 
          : "6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.9)",
        borderLeft: `6px solid ${categoryColors[data.category] || "#cbd5e1"}`,
        position: 'relative',
        cursor: 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 1, height: 1 }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              data.onToggle(data.id);
            }}
            style={{ 
              cursor: "pointer", 
              width: 24, 
              height: 24, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              borderRadius: "50%",
              boxShadow: data.isCompleted ? "none" : "2px 2px 5px rgba(163,177,198,0.3)",
              background: data.isCompleted ? "transparent" : "#e8ecf4"
            }}
          >
            {data.isCompleted ? 
              <CheckCircle2 size={20} color="#10b981" fill="#d1fae5" strokeWidth={2.5} /> 
              : 
              <Circle size={20} color="#94a3b8" strokeWidth={2.5} />
            }
          </div>
          <div 
            style={{
              background: difficultyStyles[data.difficulty]?.bg || "#f1f5f9",
              color: difficultyStyles[data.difficulty]?.text || "#475569",
              fontSize: 10,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 6,
              textTransform: 'uppercase',
              fontFamily: 'DM Sans',
              letterSpacing: '0.2px'
            }}
          >
            {data.difficulty}
          </div>
        </div>

        <div style={{ 
          fontWeight: 800, 
          fontSize: 15, 
          color: data.isCompleted ? "#636e72" : "#1e2a3a", 
          fontFamily: "Nunito", 
          lineHeight: 1.3,
          textDecoration: data.isCompleted ? "line-through" : "none" 
        }}>
          {data.label}
        </div>

        <button 
          onClick={() => data.onShowDetails(data)}
          style={{
            background: 'rgba(163,177,198,0.2)',
            border: 'none',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: 11,
            color: '#636e72',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            marginTop: 2,
            alignSelf: 'flex-start',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(163,177,198,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(163,177,198,0.2)'}
        >
          <Info size={12} /> View Details
        </button>
      </div>

      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  );
};

// --- Progress Bar Component ---
function ProgressBar({ current, total, color = "#EF5A2A" }: { current: number, total: number, color?: string }) {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#9aa5b4", fontFamily: "DM Sans" }}>
          Overall Mastery
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: color, fontFamily: "Nunito" }}>
          {percentage}%
        </span>
      </div>
      <div style={{
        height: 12,
        background: "rgba(163,177,198,0.25)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8)"
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          style={{ height: "100%", background: color, borderRadius: 12 }}
        />
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function FullStackPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({ roadmapNode: RoadmapNode }), []);

  const toggleComplete = useCallback((id: string) => {
    setCompleted(prev => {
      const isNowDone = !prev[id];
      const key = `fs_complete_${id}`;
      if (isNowDone) {
        localStorage.setItem(key, "true");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#EF5A2A', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
        });
      } else {
        localStorage.removeItem(key);
      }
      return { ...prev, [id]: isNowDone };
    });
  }, []);

  // Sync completion states with node data
  useEffect(() => {
    if (!isMounted) return;

    const phaseXOffset = 300;
    const phaseCounts: Record<number, number> = {};
    
    const preparedNodes = fullstackNodes.map((n) => {
      const phase = n.phase;
      const indexInPhase = phaseCounts[phase] || 0;
      phaseCounts[phase] = indexInPhase + 1;
      
      return {
        id: n.id,
        type: 'roadmapNode',
        position: { 
          x: (phase - 1) * phaseXOffset + 50, 
          y: 100 + (indexInPhase * 160) 
        },
        data: { 
          ...n, 
          isCompleted: !!completed[n.id],
          onToggle: toggleComplete,
          onShowDetails: (data: any) => setSelectedNode(data)
        },
      };
    });

    const preparedEdges = fullstackEdges.map((e) => {
      const isFromDone = !!completed[e.from];
      const isToDone = !!completed[e.to];
      const isEdgeActive = isFromDone && isToDone;
      const fromNode = fullstackNodes.find(n => n.id === e.from);
      const edgeColor = isEdgeActive ? (categoryColors[fromNode?.category || ""] || "#EF5A2A") : "#cbd5e1";

      return {
        id: `e-${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        type: ConnectionLineType.SmoothStep,
        animated: !isEdgeActive,
        style: { 
          stroke: edgeColor,
          strokeWidth: isEdgeActive ? 4 : 2,
          opacity: isEdgeActive ? 1 : 0.6,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
          width: 20,
          height: 20,
        },
      };
    });

    setNodes(preparedNodes);
    setEdges(preparedEdges);
  }, [completed, toggleComplete, setNodes, setEdges, isMounted]);

  // Load localStorage on mount
  useEffect(() => {
    const initCompleted: Record<string, boolean> = {};
    fullstackNodes.forEach(node => {
      if (localStorage.getItem(`fs_complete_${node.id}`) === "true") {
        initCompleted[node.id] = true;
      }
    });
    setCompleted(initCompleted);
    setIsMounted(true);
  }, []);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = fullstackNodes.length;

  if (!isMounted) return null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#e8ecf4",
          borderRadius: 24,
          padding: "32px 40px",
          boxShadow: "8px 8px 18px rgba(163,177,198,0.6), -8px -8px 18px rgba(255,255,255,0.95)",
          display: "flex",
          alignItems: "center",
          gap: 32,
          flexShrink: 0
        }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: "linear-gradient(135deg, #EF5A2A, #E14D24)",
          boxShadow: "4px 4px 15px rgba(239,90,42,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Code size={36} color="white" strokeWidth={2.5} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 30,
            color: "#1e2a3a", margin: 0, marginBottom: 6, letterSpacing: "-0.5px"
          }}>
            Full Stack Roadmap
          </h1>
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "#636e72", margin: 0, marginBottom: 16
          }}>
            Everything you need to land a mid-to-high paying internship.
          </p>
          <div style={{ maxWidth: 500 }}>
            <ProgressBar current={completedCount} total={totalCount} />
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 150 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#EF5A2A', fontFamily: 'Nunito', lineHeight: 1 }}>
            {completedCount}<span style={{ color: '#9aa5b4', fontSize: 20 }}> / {totalCount}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9aa5b4', fontFamily: 'DM Sans', textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.5px' }}>
            Topics Mastered
          </div>
        </div>
      </motion.div>

      {/* ── Flow Diagram Area ── */}
      <div style={{ 
        flex: 1, 
        background: "#e8ecf4", 
        borderRadius: 24, 
        boxShadow: "inset 6px 6px 12px rgba(163,177,198,0.4), inset -6px -6px 12px rgba(255,255,255,0.8)",
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        {/* Phase Header Labels */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          display: 'flex', 
          pointerEvents: 'none',
          zIndex: 1,
          paddingTop: 30,
          paddingLeft: 50
        }}>
          {[1,2,3,4,5,6].map(p => (
            <div key={p} style={{ 
              width: 300, 
              fontFamily: 'Nunito',
              fontWeight: 900,
              fontSize: 17,
              color: '#9aa5b4',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              Phase {p}
              <div style={{ 
                height: 5, 
                width: 50, 
                background: completedCount > (p * 5) ? '#10B981' : '#cbd5e1', 
                borderRadius: 3,
                transition: 'background 0.5s'
              }}></div>
            </div>
          ))}
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          connectionLineType={ConnectionLineType.SmoothStep}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#cbd5e1" gap={25} size={1.5} />
          <Controls style={{ 
            boxShadow: '4px 4px 10px rgba(163,177,198,0.4), -4px -4px 10px rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: '12px',
            background: '#e8ecf4'
          }} />
        </ReactFlow>

        {/* Legend Card */}
        <div style={{
          position: 'absolute',
          top: 30,
          right: 30,
          background: 'rgba(232, 236, 244, 0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          padding: '20px',
          boxShadow: '8px 8px 20px rgba(163,177,198,0.4), -4px -4px 15px rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.6)',
          zIndex: 5,
          width: 240
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontFamily: 'Nunito', fontSize: 14, fontWeight: 900, color: '#1e2a3a', letterSpacing: '0.5px' }}>ROADMAP LEGEND</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(categoryColors).map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: color, boxShadow: `0 2px 5px ${color}30` }}></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#636e72', fontFamily: 'DM Sans' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details Overlay */}
        <AnimatePresence>
          {selectedNode && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(221, 227, 237, 0.4)', backdropFilter: 'blur(4px)' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                  background: '#e8ecf4',
                  borderRadius: 32,
                  width: '90%',
                  maxWidth: 500,
                  padding: 40,
                  boxShadow: '20px 20px 60px rgba(163,177,198,0.8), -20px -20px 60px rgba(255,255,255,1)',
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.7)'
                }}
              >
                <button 
                  onClick={() => setSelectedNode(null)}
                  style={{ 
                    position: 'absolute', top: 24, right: 24, background: 'white', 
                    border: 'none', cursor: 'pointer', color: '#9aa5b4', width: 40, height: 40,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '2px 2px 6px rgba(163,177,198,0.3)'
                  }}
                >
                  <X size={20} />
                </button>

                <div style={{ 
                  width: 60, height: 60, borderRadius: 18, 
                  background: categoryColors[selectedNode.category],
                  marginBottom: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 20px ${categoryColors[selectedNode.category]}40`
                }}>
                  <Code color="white" size={32} strokeWidth={2.5} />
                </div>

                <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 28, color: '#1e2a3a', margin: '0 0 8px 0' }}>{selectedNode.label}</h2>
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: categoryColors[selectedNode.category], textTransform: 'uppercase', letterSpacing: '0.8px' }}>{selectedNode.category}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#9aa5b4' }}>•</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: difficultyStyles[selectedNode.difficulty]?.text }}>{selectedNode.difficulty}</span>
                </div>

                <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: '#636e72', lineHeight: 1.7, marginBottom: 32 }}>
                  {selectedNode.description}
                </p>

                <div style={{ marginBottom: 32 }}>
                  <h4 style={{ fontFamily: 'Nunito', fontSize: 14, fontWeight: 800, color: '#1e2a3a', marginBottom: 16, letterSpacing: '0.5px' }}>LEARNING RESOURCES</h4>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {selectedNode.resources?.map((res: string) => (
                      <a 
                        key={res} 
                        href={`https://www.google.com/search?q=${encodeURIComponent(res + " " + selectedNode.label)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'white',
                          padding: '10px 18px',
                          borderRadius: 14,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#2d3748',
                          boxShadow: '3px 3px 8px rgba(163,177,198,0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          textDecoration: 'none',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        {res} <ExternalLink size={12} />
                      </a>
                    ))}
                    {(!selectedNode.resources || selectedNode.resources.length === 0) && (
                      <span style={{ fontSize: 14, color: '#9aa5b4', fontStyle: 'italic' }}>Curated resources coming soon.</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleComplete(selectedNode.id);
                    setSelectedNode((prev: any) => ({ ...prev, isCompleted: !prev.isCompleted }));
                  }}
                  style={{
                    width: '100%',
                    padding: '18px',
                    borderRadius: 20,
                    border: 'none',
                    background: selectedNode.isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'linear-gradient(135deg, #EF5A2A, #E14D24)',
                    color: selectedNode.isCompleted ? '#10b981' : 'white',
                    fontWeight: 900,
                    fontSize: 17,
                    fontFamily: 'Nunito',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    boxShadow: selectedNode.isCompleted ? 'none' : '0 10px 25px rgba(239, 90, 42, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {selectedNode.isCompleted ? (
                    <>
                      <CheckCircle2 size={24} /> Mastery Achieved
                    </>
                  ) : (
                    "Mark as Mastered"
                  )}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .react-flow__edge-path {
          transition: stroke 0.4s, stroke-width 0.4s;
        }
        .react-flow__controls-button {
          border-bottom: 1px solid rgba(163,177,198,0.2) !important;
          background: #e8ecf4 !important;
          color: #9aa5b4 !important;
          transition: all 0.2s !important;
        }
        .react-flow__controls-button:hover {
          background: #f0f4f9 !important;
          color: #f15a2b !important;
        }
        .react-flow__controls-button svg {
          fill: currentColor !important;
        }
      `}</style>
    </div>
  );
}
