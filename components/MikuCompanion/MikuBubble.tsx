"use client";

import React, { useEffect, useState, useRef } from "react";
import { MikuEmotion } from "./MikuAvatar";

interface MikuBubbleProps {
  message: string;
  emotion: MikuEmotion;
  onClose: () => void;
  onReactSad: () => void;
  onReactExcited: () => void;
  visible: boolean;
}

export default function MikuBubble({
  message,
  emotion,
  onClose,
  onReactSad,
  onReactExcited,
  visible,
}: MikuBubbleProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible || !message) {
      setDisplayedText("");
      return;
    }
    // Reset and start typewriter
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayedText(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(intervalRef.current!);
        setIsTyping(false);
      }
    }, 28);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [message, visible]);

  const emotionColor: Record<MikuEmotion, string> = {
    happy: "#7C3AED",
    sad: "#6366F1",
    angry: "#EF4444",
    excited: "#F59E0B",
    love: "#EC4899",
    thinking: "#8B5CF6",
    blush: "#EC4899",
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 155,
        right: 0,
        background: "white",
        borderRadius: "18px 18px 4px 18px",
        padding: "14px 18px",
        boxShadow: "0 8px 32px rgba(168,85,247,0.18)",
        border: "2px solid #F3E8FF",
        maxWidth: 280,
        minWidth: 200,
        zIndex: 10000,
        animation: "mikuBubbleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: emotionColor[emotion],
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Miku ✨ 💗
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9CA3AF",
            fontSize: 14,
            padding: "0 2px",
            lineHeight: 1,
            borderRadius: 4,
            transition: "color 0.2s",
          }}
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Message */}
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          lineHeight: 1.6,
          color: "#374151",
          fontFamily: "'Inter', sans-serif",
          minHeight: 40,
          whiteSpace: "pre-wrap",
        }}
      >
        {displayedText}
        {isTyping && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 14,
              background: emotionColor[emotion],
              marginLeft: 2,
              animation: "mikuCursor 0.6s ease infinite",
              verticalAlign: "middle",
            }}
          />
        )}
      </p>

      {/* Reaction buttons */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onReactSad}
          style={{
            background: "linear-gradient(135deg, #F9A8D4, #C084FC)",
            border: "none",
            borderRadius: 20,
            padding: "5px 12px",
            fontSize: 11.5,
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            transition: "transform 0.15s, opacity 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.transform = "scale(1)")
          }
        >
          😭 Sahi bola
        </button>
        <button
          onClick={onReactExcited}
          style={{
            background: "linear-gradient(135deg, #EC4899, #8B5CF6)",
            border: "none",
            borderRadius: 20,
            padding: "5px 12px",
            fontSize: 11.5,
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            transition: "transform 0.15s, opacity 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.transform = "scale(1)")
          }
        >
          😤 Main karunga!
        </button>
      </div>
    </div>
  );
}
