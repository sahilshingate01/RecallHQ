"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import MikuAvatar, { MikuEmotion } from "./MikuAvatar";
import MikuBubble from "./MikuBubble";
import MikuParticles from "./MikuParticles";
import { useMikuTrigger } from "./useMikuTrigger";

type ContextMenuOption = "mood" | "mute" | "background" | null;

const EMOTIONS: MikuEmotion[] = [
  "happy",
  "sad",
  "angry",
  "excited",
  "love",
  "thinking",
  "blush",
];

export default function MikuCompanion() {
  const pathname = usePathname();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isBackground, setIsBackground] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuOption>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    message,
    emotion,
    visible,
    particles,
    particleType,
    isMuted,
    setEmotion,
    closeMessage,
    openLastMessage,
    muteFor1Hour,
  } = useMikuTrigger(pathname || "/");

  // Double click: spin animation
  const handleClick = useCallback(() => {
    if (clickTimerRef.current) {
      // Double click detected
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      setIsSpinning(true);
      setTimeout(() => setIsSpinning(false), 800);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        // Single click: toggle bubble
        if (visible) {
          closeMessage();
        } else {
          openLastMessage();
        }
      }, 220);
    }
  }, [visible, closeMessage, openLastMessage]);

  // Right click: context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu("mood");
    },
    []
  );

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null);
        setShowMoodPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleReactSad = useCallback(() => {
    setEmotion("sad");
    closeMessage();
  }, [setEmotion, closeMessage]);

  const handleReactExcited = useCallback(() => {
    setEmotion("excited");
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 800);
    closeMessage();
  }, [setEmotion, closeMessage]);

  if (isBackground) {
    return (
      <button
        title="Bring back Miku"
        onClick={() => setIsBackground(false)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          background: "linear-gradient(135deg, #C084FC, #EC4899)",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          fontSize: 20,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(168,85,247,0.4)",
        }}
      >
        💜
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        userSelect: "none",
      }}
    >
      {/* Particle effects */}
      <MikuParticles active={particles} type={particleType} />

      {/* Chat bubble */}
      <MikuBubble
        message={message}
        emotion={emotion}
        visible={visible}
        onClose={closeMessage}
        onReactSad={handleReactSad}
        onReactExcited={handleReactExcited}
      />

      {/* Miku avatar */}
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ cursor: "pointer", position: "relative", display: "inline-block" }}
        title={isMuted ? "Miku (muted)" : "Click to chat with Miku!"}
      >
        <MikuAvatar
          emotion={emotion}
          isSpinning={isSpinning}
          isBouncing={isBouncing}
        />
        {/* Muted indicator */}
        {isMuted && (
          <span
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            🔇
          </span>
        )}
      </div>

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          style={{
            position: "absolute",
            bottom: 145,
            right: 125,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: "1.5px solid #F3E8FF",
            overflow: "hidden",
            minWidth: 180,
            zIndex: 10002,
          }}
        >
          {/* Change mood */}
          <button
            onClick={() => {
              setShowMoodPicker(!showMoodPicker);
            }}
            style={ctxBtnStyle}
          >
            😊 Change Miku's mood
          </button>
          {showMoodPicker && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                padding: "8px 12px",
                background: "#FAF5FF",
              }}
            >
              {EMOTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setEmotion(e);
                    setContextMenu(null);
                    setShowMoodPicker(false);
                  }}
                  style={{
                    background:
                      emotion === e
                        ? "linear-gradient(135deg, #C084FC, #EC4899)"
                        : "#F3E8FF",
                    color: emotion === e ? "white" : "#7C3AED",
                    border: "none",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          {/* Mute */}
          <button
            onClick={() => {
              muteFor1Hour();
              setContextMenu(null);
            }}
            style={ctxBtnStyle}
          >
            🔇 Mute for 1 hour
          </button>
          {/* Send to background */}
          <button
            onClick={() => {
              setIsBackground(true);
              setContextMenu(null);
            }}
            style={ctxBtnStyle}
          >
            📦 Send to background
          </button>
        </div>
      )}
    </div>
  );
}

const ctxBtnStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  background: "none",
  border: "none",
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 13,
  cursor: "pointer",
  color: "#374151",
  fontFamily: "'Inter', sans-serif",
  transition: "background 0.15s",
  whiteSpace: "nowrap",
};
