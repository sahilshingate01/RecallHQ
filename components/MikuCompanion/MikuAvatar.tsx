"use client";

import Image from "next/image";

export type MikuEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "excited"
  | "love"
  | "blush"
  | "thinking";

interface MikuAvatarProps {
  emotion: MikuEmotion;
  isAnimating?: boolean;
}

export default function MikuAvatar({ emotion, isAnimating }: MikuAvatarProps) {
  return (
    <div
      style={{
        width: 110,
        height: 154,
        position: "relative",
        animation: isAnimating
          ? "mikuBounce 0.4s ease"
          : "mikuFloat 3s ease-in-out infinite",
        cursor: "pointer",
        filter: "drop-shadow(0 8px 24px rgba(168,85,247,0.3))",
        transition: "transform 0.2s ease",
      }}
    >
      <Image
        src={`/miku_images/miku-${emotion}.png`}
        alt={`Miku is ${emotion}`}
        fill
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );
}
