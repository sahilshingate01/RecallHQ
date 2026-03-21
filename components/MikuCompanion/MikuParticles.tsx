"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
  color: string;
  delay: number;
}

interface MikuParticlesProps {
  active: boolean;
  type?: "hearts" | "stars";
}

export default function MikuParticles({
  active,
  type = "hearts",
}: MikuParticlesProps) {
  const particles: Particle[] = [
    { id: 1, x: 10, y: 0, char: "♥", color: "#F9A8D4", delay: 0 },
    { id: 2, x: 50, y: 10, char: "♥", color: "#C084FC", delay: 200 },
    { id: 3, x: 90, y: 5, char: "♥", color: "#F9A8D4", delay: 400 },
    { id: 4, x: 30, y: 20, char: "♥", color: "#C084FC", delay: 600 },
    { id: 5, x: 70, y: 15, char: "♥", color: "#F9A8D4", delay: 800 },
    { id: 6, x: 110, y: 0, char: "♥", color: "#C084FC", delay: 300 },
  ];

  const starParticles: Particle[] = [
    { id: 1, x: 5, y: 0, char: "✨", color: "#FDE68A", delay: 0 },
    { id: 2, x: 30, y: -10, char: "⭐", color: "#FDE68A", delay: 150 },
    { id: 3, x: 60, y: 5, char: "✨", color: "#C084FC", delay: 300 },
    { id: 4, x: 90, y: -5, char: "⭐", color: "#FDE68A", delay: 450 },
    { id: 5, x: 110, y: 10, char: "✨", color: "#F9A8D4", delay: 600 },
    { id: 6, x: 40, y: 20, char: "★", color: "#C084FC", delay: 200 },
  ];

  const activeParticles = type === "stars" ? starParticles : particles;

  if (!active) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: "50%",
        transform: "translateX(-50%)",
        width: 120,
        height: 80,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 10001,
      }}
    >
      {activeParticles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            bottom: p.y,
            fontSize: type === "stars" ? 14 : 12,
            color: p.color,
            animation: `mikuHeartFloat 1.2s ease-out forwards`,
            animationDelay: `${p.delay}ms`,
            opacity: 0,
            userSelect: "none",
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
