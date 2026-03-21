"use client";

import React from "react";

export type MikuEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "excited"
  | "love"
  | "thinking"
  | "blush";

interface MikuAvatarProps {
  emotion: MikuEmotion;
  isSpinning?: boolean;
  isBouncing?: boolean;
}

function getMouthPath(emotion: MikuEmotion): string {
  switch (emotion) {
    case "sad":
      return "M52 100 Q60 94 68 100";
    case "angry":
      return "M52 97 L68 97";
    case "excited":
      return "M50 96 Q60 108 70 96";
    case "blush":
      return "M57 97 Q60 99 63 97";
    default:
      return "M52 96 Q60 103 68 96";
  }
}

function getBlushColor(emotion: MikuEmotion): string {
  return emotion === "angry" ? "#FCA5A5" : "#F9A8D4";
}

function getBlushOpacity(emotion: MikuEmotion): string {
  return emotion === "blush" ? "0.9" : "0.6";
}

function EyeLeft({ emotion }: { emotion: MikuEmotion }) {
  if (emotion === "excited") {
    return (
      <>
        <ellipse cx="44" cy="72" rx="11" ry="13" fill="white" />
        <text x="36" y="78" fontSize="14" fill="#7C3AED" fontWeight="bold">
          ★
        </text>
        <path
          d="M33 65 Q38 60 55 65"
          stroke="#1E0A3C"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  }
  if (emotion === "love") {
    return (
      <>
        <ellipse cx="44" cy="72" rx="11" ry="13" fill="white" />
        <text x="37" y="79" fontSize="12" fill="#F9A8D4">
          ♥
        </text>
        <path
          d="M33 65 Q38 60 55 65"
          stroke="#1E0A3C"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  }
  if (emotion === "thinking") {
    return (
      <>
        <ellipse cx="44" cy="72" rx="10" ry="11" fill="white" />
        <ellipse cx="44" cy="74" rx="7" ry="8" fill="#7C3AED" />
        <ellipse cx="44" cy="75" rx="3.5" ry="4.5" fill="#1E0A3C" />
        <ellipse cx="40" cy="70" rx="3" ry="3" fill="white" />
        <ellipse cx="48" cy="76" rx="1.5" ry="1.5" fill="white" />
        <path
          d="M33 65 Q38 60 55 65"
          stroke="#1E0A3C"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  }
  return (
    <>
      <ellipse cx="44" cy="72" rx="11" ry="13" fill="white" />
      <ellipse cx="44" cy="74" rx="8" ry="10" fill="#7C3AED" />
      <ellipse cx="44" cy="75" rx="4" ry="5" fill="#1E0A3C" />
      <ellipse cx="40" cy="70" rx="3" ry="3" fill="white" />
      <ellipse cx="48" cy="76" rx="1.5" ry="1.5" fill="white" />
      <path
        d="M33 65 Q38 60 55 65"
        stroke="#1E0A3C"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Angry eyebrow */}
      {emotion === "angry" && (
        <path
          d="M33 61 Q43 57 55 62"
          stroke="#1E0A3C"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {/* Sad eyebrow */}
      {emotion === "sad" && (
        <path
          d="M33 63 Q43 60 55 64"
          stroke="#1E0A3C"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </>
  );
}

function EyeRight({ emotion }: { emotion: MikuEmotion }) {
  if (emotion === "excited") {
    return (
      <>
        <ellipse cx="76" cy="72" rx="11" ry="13" fill="white" />
        <text x="68" y="78" fontSize="14" fill="#7C3AED" fontWeight="bold">
          ★
        </text>
        <path
          d="M65 65 Q72 60 87 65"
          stroke="#1E0A3C"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  }
  if (emotion === "love") {
    return (
      <>
        <ellipse cx="76" cy="72" rx="11" ry="13" fill="white" />
        <text x="69" y="79" fontSize="12" fill="#F9A8D4">
          ♥
        </text>
        <path
          d="M65 65 Q72 60 87 65"
          stroke="#1E0A3C"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  }
  if (emotion === "thinking") {
    return (
      <>
        <ellipse cx="76" cy="72" rx="10" ry="11" fill="white" />
        <ellipse cx="76" cy="74" rx="7" ry="8" fill="#7C3AED" />
        <ellipse cx="76" cy="75" rx="3.5" ry="4.5" fill="#1E0A3C" />
        <ellipse cx="72" cy="70" rx="3" ry="3" fill="white" />
        <ellipse cx="80" cy="76" rx="1.5" ry="1.5" fill="white" />
        <path
          d="M65 65 Q72 60 87 65"
          stroke="#1E0A3C"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  }
  return (
    <>
      <ellipse cx="76" cy="72" rx="11" ry="13" fill="white" />
      <ellipse cx="76" cy="74" rx="8" ry="10" fill="#7C3AED" />
      <ellipse cx="76" cy="75" rx="4" ry="5" fill="#1E0A3C" />
      <ellipse cx="72" cy="70" rx="3" ry="3" fill="white" />
      <ellipse cx="80" cy="76" rx="1.5" ry="1.5" fill="white" />
      <path
        d="M65 65 Q72 60 87 65"
        stroke="#1E0A3C"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Angry eyebrow */}
      {emotion === "angry" && (
        <path
          d="M65 62 Q75 57 87 61"
          stroke="#1E0A3C"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {/* Sad eyebrow */}
      {emotion === "sad" && (
        <path
          d="M65 64 Q75 60 87 63"
          stroke="#1E0A3C"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </>
  );
}

export default function MikuAvatar({
  emotion,
  isSpinning = false,
  isBouncing = false,
}: MikuAvatarProps) {
  const animClass = isSpinning
    ? "miku-spin"
    : isBouncing
    ? "miku-bounce"
    : "miku-float";

  return (
    <div className={animClass} style={{ display: "inline-block" }}>
      <svg viewBox="0 0 120 140" width="120" height="140">
        {/* Hair back layer */}
        <ellipse cx="60" cy="52" rx="48" ry="50" fill="#C084FC" />
        {/* Long side hair */}
        <rect x="12" y="55" width="18" height="60" rx="9" fill="#A855F7" />
        <rect x="90" y="55" width="18" height="60" rx="9" fill="#A855F7" />
        {/* Small ahoge hair strand on top */}
        <path
          d="M60 8 Q65 2 63 12"
          stroke="#A855F7"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Face */}
        <ellipse cx="60" cy="72" rx="36" ry="38" fill="#FDDCB5" />
        {/* Hair fringe / bangs over face */}
        <path
          d="M24 58 Q30 35 60 32 Q90 35 96 58 Q85 48 75 52 Q65 42 60 44 Q55 42 45 52 Q35 48 24 58Z"
          fill="#C084FC"
        />
        {/* Eyes */}
        <EyeLeft emotion={emotion} />
        <EyeRight emotion={emotion} />
        {/* Blush left */}
        <ellipse
          cx="34"
          cy="84"
          rx="9"
          ry="5"
          fill={getBlushColor(emotion)}
          opacity={getBlushOpacity(emotion)}
        />
        {/* Blush right */}
        <ellipse
          cx="86"
          cy="84"
          rx="9"
          ry="5"
          fill={getBlushColor(emotion)}
          opacity={getBlushOpacity(emotion)}
        />
        {/* Nose */}
        <ellipse cx="60" cy="86" rx="2" ry="1.5" fill="#E8A87C" opacity="0.5" />
        {/* Mouth */}
        <path
          d={getMouthPath(emotion)}
          stroke="#D97706"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Blush "o" mouth for blush emotion */}
        {emotion === "blush" && (
          <ellipse cx="60" cy="97" rx="3" ry="3.5" fill="none" stroke="#D97706" strokeWidth="1.5" />
        )}
        {/* Neck */}
        <rect x="50" y="108" width="20" height="16" rx="4" fill="#FDDCB5" />
        {/* Outfit */}
        <path
          d="M20 140 Q25 118 60 118 Q95 118 100 140Z"
          fill="#EC4899"
        />
        {/* Bow on outfit */}
        <path d="M48 120 Q60 115 72 120 Q60 125 48 120Z" fill="white" />
        <circle cx="60" cy="120" r="3" fill="#EC4899" />
        {/* Thinking finger to cheek */}
        {emotion === "thinking" && (
          <g>
            <ellipse cx="85" cy="86" rx="5" ry="5" fill="#FDDCB5" />
            <rect x="83" y="86" width="4" height="10" rx="2" fill="#FDDCB5" />
          </g>
        )}
        {/* Decorative hearts */}
        <text x="95" y="35" fontSize="10" fill="#F9A8D4" opacity="0.8">
          ♥
        </text>
        <text x="8" y="40" fontSize="8" fill="#F9A8D4" opacity="0.6">
          ♥
        </text>
      </svg>
    </div>
  );
}
