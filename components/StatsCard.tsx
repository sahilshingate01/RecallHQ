"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  valueColor?: string;
  delay?: number;
}

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target && count === target) return;
    prevTarget.current = target;
    const start = count;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, count]);

  return count;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  gradientFrom,
  gradientTo,
  valueColor = "var(--text-primary)",
  delay = 0,
}: StatsCardProps) {
  const displayValue = useCountUp(value);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ translateY: -4 }}
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
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "12px 12px 24px rgba(163,177,198,0.65), -12px -12px 24px rgba(255,255,255,0.95)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "8px 8px 18px rgba(163,177,198,0.6), -8px -8px 18px rgba(255,255,255,0.95)";
      }}
    >
      {/* Icon Box */}
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "4px 4px 10px rgba(163,177,198,0.4)",
          flexShrink: 0,
        }}
      >
        <Icon size={28} color="white" strokeWidth={2} />
      </div>

      {/* Info */}
      <div>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
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
            lineHeight: 1,
          }}
        >
          {displayValue}
        </p>
      </div>
    </motion.div>
  );
}
