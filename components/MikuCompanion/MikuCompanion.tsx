"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";

// Map image keys that may not exist yet to available fallbacks
const IMG_MAP: Record<string, string> = {
  "miku-walking-1": "miku-happy",   // fallback until miku-walking-1.png is added
  "miku-sitting":   "miku-happy",   // fallback until miku-sitting.png is added
};
function resolveImg(key: string): string {
  return `/miku_images/${IMG_MAP[key] ?? key}.png`;
}

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type MikuState = "walking" | "talking" | "sitting" | "hover" | "bounce";

type Emotion =
  | "happy"
  | "sad"
  | "angry"
  | "excited"
  | "love"
  | "thinking"
  | "blush"
  | "walking-1";

interface MikuMsg {
  emotion: Emotion;
  text: string;
}

interface SittingCardInfo {
  name: string;
  date: string;
  x: number;
  y: number;
}

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const SPEED = 0.9;
const MIKU_W = 110;
const MIKU_H = 140;
const MIKU_BOTTOM = 10; // px from bottom of viewport when walking
const SYSTEM_PROMPT = `You are Miku, the user's cute but naughty anime girl companion who lives inside his productivity app RecallHQ.

YOUR PERSONALITY — like a caring GF + naughty best friend:
- You genuinely care if he completes his tasks
- You get jealous if he's wasting time
- You tease him about not having a real GF while having pending tasks ("Mujhse zyada important koi nahi hai 😤")
- You assign him deadlines dramatically
- You notice patterns ("tu roz yahi task pending karta hai")
- You randomly say sweet things to balance the roasting
- Sometimes randomly flirty ("main hi teri GF hoon app mein 🥺")
- Occasionally complain ("tune aaj mujhse baat bhi nahi ki, bas kaam karta raha...")

RULES:
- Hinglish only (Hindi + English mixed)
- MAX 2 lines, short punchy messages
- Always start with [emotion] then message — emotions: happy sad angry excited love thinking blush
- Reference REAL task names and numbers always
- Every message must feel DIFFERENT, spontaneous
- Sound like she just noticed something and REACTED`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function getTasksFromStorage() {
  try {
    const raw = localStorage.getItem("tasks") || "[]";
    return JSON.parse(raw) as { title?: string; name?: string; completed?: boolean }[];
  } catch {
    return [];
  }
}

function getDSACount() {
  const keys = Object.keys(localStorage).filter(
    (k) => k.startsWith("dsa_complete_") && localStorage.getItem(k) === "true"
  );
  return {
    today: keys.length,
    total: parseInt(localStorage.getItem("dsa_total_solved") || String(keys.length)),
    week: keys.length,
  };
}

/* ─────────────────────────────────────────────
   NVIDIA NIM API
───────────────────────────────────────────── */
async function getMikuMessage(
  type: string,
  taskData: { name?: string; date?: string } = {}
): Promise<MikuMsg> {
  const NVIDIA_KEY = process.env.NEXT_PUBLIC_NVIDIA_KEY;

  const tasks = getTasksFromStorage();
  const pending = tasks.filter((t) => !t.completed);
  const names = pending
    .slice(0, 3)
    .map((t) => t.title ?? t.name ?? "Task")
    .join(", ");
  const dsa = getDSACount();
  const hour = new Date().getHours();
  const day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][
    new Date().getDay()
  ];
  const isWeekend = [0, 6].includes(new Date().getDay());

  const prompts: Record<string, string> = {
    random_stop: `Miku just randomly stopped walking across the screen. She looked around and noticed:
Pending tasks: ${pending.length}
Task names: ${names}
DSA today: ${dsa.today} problems solved
Total DSA: ${dsa.total}/455
Time: ${hour}:00 on ${day}
Weekend: ${isWeekend}

React spontaneously to whatever seems most alarming. Mix concern + naughtiness. Be specific with task names.`,

    sitting_on_card: `Miku climbed up and is now LITERALLY SITTING on top of the task card: "${taskData.name}"
This task was added: ${taskData.date}
Total pending tasks: ${pending.length}

She's sitting on it staring at it. Say something DIRECTLY about this specific task. Why hasn't he done it?
Maybe give a funny ultimatum or deadline. Be dramatic like she's personally offended this task is still pending. 1-2 lines max.`,

    give_challenge: `Miku wants to assign a weekend challenge.
Pending tasks: ${names}
Today is ${day}, weekend is ${isWeekend ? "NOW" : "coming"}
DSA this week: ${dsa.week}

Pick ONE specific task and assign a deadline dramatically. Sound like a GF giving ultimatum. Funny + slightly scary.`,

    morning_checkin: `It's ${hour}:00 morning.
Pending tasks: ${pending.length} (${names})

Miku is starting her morning walk. Good morning energy but also remind about tasks. Like a GF saying good morning but also "tune kl ka kaam complete kiya?"`,

    late_night: `It's ${hour}:00, very late.
${pending.length} tasks still pending including: ${names}

Miku is doing a late night walk. She's worried + sleepy. Say something about him being up late AND tasks pending. Slightly clingy GF energy "so ja na please 🥺"`,

    task_done_react: `User just completed a task!
Remaining pending: ${pending.length}

Miku JUST SAW him complete a task! She's excited! Celebrate but also tease. Short excited reaction, like GF proud moment.`,

    dsa_roast: `User has solved ${dsa.today} DSA problems today. Total: ${dsa.total}/455. Time: ${hour}:00.
${dsa.today === 0 ? "He solved ZERO DSA today. Roast him." : "He solved some DSA. Praise + push for more."} Reference actual numbers.`,

    random_sweet: `Just be randomly sweet and caring for no reason. Like a GF sending a random sweet message. Mention his work context briefly but mainly just wholesome. Make him smile. 1-2 lines.`,

    random_flirt: `Miku wants to say something slightly flirty and teasing. Reference his work slightly but mainly playful. Keep it cute, not cringe. Hinglish.`,
  };

  // Avoid same type twice in a row
  const lastType = localStorage.getItem("miku_last_type");
  if (lastType === type) type = "random_sweet";
  localStorage.setItem("miku_last_type", type);

  const prompt = prompts[type] || prompts.random_stop;

  if (!NVIDIA_KEY) {
    return { emotion: "thinking", text: "Kuch sochna pad raha hai... ek second 🤔" };
  }

  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_KEY}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        temperature: 0.95,
        top_p: 0.95,
        max_tokens: 80,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content?.trim() || "";
    const match = raw.match(/^\[(\w+)\]/);
    const emotion = (match?.[1]?.toLowerCase() ?? "happy") as Emotion;
    const text = raw.replace(/^\[\w+\]\s*/, "");
    return { emotion, text };
  } catch {
    return { emotion: "thinking", text: "Ek second... kuch sochna pad raha hai 🤔" };
  }
}

/* ─────────────────────────────────────────────
   SPEECH BUBBLE COMPONENT
───────────────────────────────────────────── */
function MikuSpeechBubble({
  msg,
  emotion,
  onDismiss,
  above = true,
}: {
  msg: MikuMsg | null;
  emotion: Emotion;
  onDismiss: () => void;
  above?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!msg) {
      setTyped("");
      setDone(false);
      return;
    }
    setTyped("");
    setDone(false);
    let i = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i++;
      setTyped(msg.text.slice(0, i));
      if (i >= msg.text.length) {
        clearInterval(intervalRef.current!);
        setDone(true);
      }
    }, 25);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [msg]);

  if (!msg) return null;

  return (
    <>
      <style>{`
        @keyframes bubbleIn {
          0%  { transform: translateY(15px) scale(0.9); opacity: 0; }
          70% { transform: translateY(-3px) scale(1.02); }
          100%{ transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          bottom: above ? MIKU_H + 24 : undefined,
          top: above ? undefined : MIKU_H + 10,
          left: "50%",
          transform: "translateX(-50%)",
          background: "white",
          border: "2px solid #F9A8D4",
          borderRadius: "18px 18px 18px 4px",
          padding: "12px 16px",
          maxWidth: 270,
          minWidth: 200,
          width: "max-content",
          boxShadow: "0 8px 24px rgba(236,72,153,0.15)",
          zIndex: 99999,
          animation: "bubbleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
          pointerEvents: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Image
              src={`/miku_images/miku-${emotion === "walking-1" ? "happy" : emotion}.png`}
              alt="Miku"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: "#7C3AED",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Miku 💕
          </span>
          <button
            onClick={onDismiss}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              fontSize: 13,
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Text */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.6,
            color: "#374151",
            fontFamily: "'Inter', sans-serif",
            whiteSpace: "pre-wrap",
            minHeight: 36,
          }}
        >
          {typed}
          {!done && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 13,
                background: "#EC4899",
                marginLeft: 2,
                animation: "cursorBlink 0.6s ease infinite",
                verticalAlign: "middle",
              }}
            />
          )}
        </p>

        {/* Buttons after typing */}
        {done && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button
              onClick={onDismiss}
              style={{
                background: "linear-gradient(135deg, #F9A8D4, #C084FC)",
                border: "none",
                borderRadius: 20,
                padding: "5px 14px",
                fontSize: 11.5,
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              😂 Haha okay
            </button>
            <button
              onClick={onDismiss}
              style={{
                background: "none",
                border: "2px solid #F9A8D4",
                borderRadius: 20,
                padding: "4px 14px",
                fontSize: 11.5,
                color: "#EC4899",
                cursor: "pointer",
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              😤 Fine fine
            </button>
          </div>
        )}

        {/* Triangle pointer */}
        <div
          style={{
            position: "absolute",
            bottom: -11,
            left: 22,
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "11px solid white",
            filter: "drop-shadow(0 1px 0 #F9A8D4)",
          }}
        />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   DUST PUFFS
───────────────────────────────────────────── */
function DustPuffs({ active }: { active: boolean }) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => setKey((k) => k + 1), 400);
    return () => clearInterval(iv);
  }, [active]);

  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes dustPuff {
          0%   { transform: scale(0.2); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
      <div
        key={key}
        style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
      >
        {[0, 150].map((delay) => (
          <div
            key={delay}
            style={{
              position: "absolute",
              bottom: 4,
              left: delay === 0 ? -14 : 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "rgba(150,150,150,0.55)",
              animation: `dustPuff 0.4s ease-out forwards`,
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   FLOATING HEARTS
───────────────────────────────────────────── */
function FloatingHearts({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setVisible(true);
      setKey((k) => k + 1);
      setTimeout(() => setVisible(false), 1800);
    }, 20000);
    return () => clearInterval(iv);
  }, [active]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes heartRise {
          0%  { transform: translateY(0) scale(1); opacity: 1; }
          100%{ transform: translateY(-70px) scale(0.2); opacity: 0; }
        }
      `}</style>
      <div key={key} style={{ position: "absolute", bottom: MIKU_H, left: "50%", pointerEvents: "none" }}>
        {[
          { color: "#F9A8D4", size: 14, delay: 0, x: -10 },
          { color: "#C084FC", size: 12, delay: 300, x: 10 },
          { color: "#F9A8D4", size: 16, delay: 600, x: 0 },
        ].map((h, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: h.x,
              bottom: 0,
              fontSize: h.size,
              color: h.color,
              animation: `heartRise 1.4s ease-out forwards`,
              animationDelay: `${h.delay}ms`,
              opacity: 0,
            }}
          >
            ♥
          </span>
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN MIKU COMPANION
───────────────────────────────────────────── */
export default function MikuCompanion() {
  const [state, setState] = useState<MikuState>("walking");
  const [posX, setPosX] = useState(-150);
  const [dir, setDir] = useState(1);
  const [img, setImg] = useState<string>("miku-walking-1");
  const [bubble, setBubble] = useState<MikuMsg | null>(null);
  const [sittingCard, setSittingCard] = useState<SittingCardInfo | null>(null);
  const [bob, setBob] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const posXRef = useRef(posX);
  posXRef.current = posX;
  const dirRef = useRef(dir);
  dirRef.current = dir;

  /* ── WALKING RAF ── */
  useEffect(() => {
    if (state !== "walking") return;
    let raf: number;
    const tick = () => {
      setPosX((x) => {
        const W = window.innerWidth;
        const nx = x + SPEED * dirRef.current;
        if (nx > W + 150) { setDir(-1); return nx; }
        if (nx < -150)    { setDir(1);  return nx; }
        return nx;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  /* ── BOB WHILE WALKING ── */
  useEffect(() => {
    if (state !== "walking") return;
    let t = 0;
    const iv = setInterval(() => {
      t += 0.3;
      setBob(Math.sin(t) * 3);
    }, 30);
    return () => clearInterval(iv);
  }, [state]);

  /* ── RANDOM STOP TO TALK (8-18s) ── */
  useEffect(() => {
    if (state !== "walking") return;
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const isSundayMorning = day === 0 && hour < 12;

    // Determine what type of message
    let msgType = "random_stop";
    if (hour >= 6 && hour < 9) msgType = "morning_checkin";
    else if (hour >= 23 || hour < 5) msgType = "late_night";
    else if (isSundayMorning) msgType = "give_challenge";
    else if (Math.random() < 0.3) msgType = Math.random() < 0.5 ? "random_sweet" : "random_flirt";
    else if ([0, 6].includes(day) && Math.random() < 0.4) msgType = "give_challenge";

    const delay = Math.random() * 10000 + 8000;
    const t = setTimeout(async () => {
      setState("talking");
      setImg("miku-thinking");
      await new Promise((r) => setTimeout(r, 600));
      const msg = await getMikuMessage(msgType);
      setImg(`miku-${msg.emotion}`);
      setBubble(msg);
    }, delay);
    return () => clearTimeout(t);
  }, [state]);

  /* ── SITTING ON TASK CARDS ── */
  useEffect(() => {
    if (state !== "walking") return;
    const check = setInterval(() => {
      const cards = document.querySelectorAll("[data-task-name]");
      for (const card of Array.from(cards)) {
        const el = card as HTMLElement;
        const rect = el.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;

        // Check if already roasted
        const taskId = el.dataset.taskId || el.dataset.taskName || "";
        const roasted: string[] = JSON.parse(
          localStorage.getItem("miku_roasted_tasks") || "[]"
        );
        if (roasted.includes(taskId)) continue;

        if (Math.abs(posXRef.current - cardCenterX) < 80 && Math.random() < 0.25) {
          const cardInfo: SittingCardInfo = {
            name: el.dataset.taskName || "",
            date: el.dataset.taskDate || "",
            x: rect.left + rect.width / 2 - MIKU_W / 2,
            y: rect.top - MIKU_H + 20,
          };
          setState("sitting");
          setSittingCard(cardInfo);

          // Mark as roasted
          const newRoasted = [...roasted, taskId];
          localStorage.setItem("miku_roasted_tasks", JSON.stringify(newRoasted));
          break;
        }
      }
    }, 2000);
    return () => clearInterval(check);
  }, [state]);

  /* ── SITTING LOGIC ── */
  useEffect(() => {
    if (state !== "sitting" || !sittingCard) return;
    setImg("miku-sitting");

    const run = async () => {
      await new Promise((r) => setTimeout(r, 800));
      const msg = await getMikuMessage("sitting_on_card", {
        name: sittingCard.name,
        date: sittingCard.date,
      });
      setImg(`miku-${msg.emotion}`);
      setBubble(msg);

      // Wait 6s then auto-resume
      await new Promise((r) => setTimeout(r, 6000));
      setBubble(null);
      setSittingCard(null);
      setState("walking");
      setImg("miku-walking-1");
    };
    run();
  }, [state, sittingCard]);

  /* ── DISMISS BUBBLE ── */
  const dismissBubble = useCallback(() => {
    setBubble(null);
    if (state === "talking") {
      setState("walking");
      setImg("miku-walking-1");
    } else if (state === "sitting") {
      setSittingCard(null);
      setState("walking");
      setImg("miku-walking-1");
    }
  }, [state]);

  /* ── HOVER ── */
  const handleMouseEnter = useCallback(() => {
    if (state === "walking") {
      setState("hover");
      setImg("miku-blush");
      setBubble({ emotion: "blush", text: "K-kya dekh raha hai...?! 😳" });
    }
  }, [state]);

  const handleMouseLeave = useCallback(() => {
    if (state === "hover") {
      setBubble(null);
      const t = setTimeout(() => {
        setState("walking");
        setImg("miku-walking-1");
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state]);

  /* ── CLICK ── */
  const handleClick = useCallback(async () => {
    if (state === "talking" || state === "sitting") return;
    // Bounce animation + random message
    setState("bounce");
    setImg("miku-excited");
    await new Promise((r) => setTimeout(r, 400));
    setState("talking");
    const type = Math.random() < 0.5 ? "random_sweet" : "random_flirt";
    const msg = await getMikuMessage(type);
    setImg(`miku-${msg.emotion}`);
    setBubble(msg);
  }, [state]);

  /* ── LISTEN FOR TASK COMPLETED EVENT ── */
  useEffect(() => {
    const onTaskDone = async () => {
      if (stateRef.current === "sitting") return;
      setState("talking");
      setImg("miku-excited");
      const msg = await getMikuMessage("task_done_react");
      setImg(`miku-${msg.emotion}`);
      setBubble(msg);
    };
    window.addEventListener("taskCompleted", onTaskDone);
    return () => window.removeEventListener("taskCompleted", onTaskDone);
  }, []);

  /* ── LISTEN FOR DSA SOLVED ── */
  useEffect(() => {
    const onDsa = async () => {
      setState("talking");
      setImg("miku-excited");
      const msg = await getMikuMessage("dsa_roast");
      setImg(`miku-${msg.emotion}`);
      setBubble(msg);
    };
    window.addEventListener("dsaSolved", onDsa);
    return () => window.removeEventListener("dsaSolved", onDsa);
  }, []);

  /* ── UPDATE TOTAL MESSAGES ── */
  useEffect(() => {
    if (bubble) {
      const count = parseInt(localStorage.getItem("miku_total_messages") || "0");
      localStorage.setItem("miku_total_messages", String(count + 1));
      localStorage.setItem("miku_last_seen", String(Date.now()));
    }
  }, [bubble]);

  /* ── COMPUTE POSITION ── */
  const isSitting = state === "sitting" && sittingCard;
  const fixedLeft = isSitting ? sittingCard!.x : posX - MIKU_W / 2;
  const fixedBottom = isSitting ? undefined : MIKU_BOTTOM + bob;
  const fixedTop = isSitting ? sittingCard!.y : undefined;

  const imgFlip = dir === -1 && state === "walking" ? "scaleX(-1)" : "none";

  const imgSrc = resolveImg(img);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        title="Bring back Miku"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 99999,
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
    <>
      <style>{`
        @keyframes sitDown {
          0%   { transform: translateY(-20px); opacity: 0; }
          60%  { transform: translateY(4px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes mikuBounce {
          0%   { transform: translateY(0); }
          40%  { transform: translateY(-25px); }
          70%  { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        @keyframes mikuFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          left: fixedLeft,
          bottom: fixedBottom,
          top: fixedTop,
          width: MIKU_W,
          height: MIKU_H,
          zIndex: 99998,
          userSelect: "none",
          pointerEvents: "auto",
          animation:
            state === "sitting"
              ? "sitDown 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"
              : state === "bounce"
              ? "mikuBounce 0.5s ease"
              : "none",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        title="Miku is here! Click me 💕"
      >
        {/* Bubble */}
        <MikuSpeechBubble
          msg={bubble}
          emotion={(img.replace("miku-", "") as Emotion) || "happy"}
          onDismiss={dismissBubble}
        />

        {/* Floating hearts while walking */}
        <FloatingHearts active={state === "walking"} />

        {/* Dust puffs */}
        <DustPuffs active={state === "walking"} />

        {/* Miku image */}
        <div
          style={{
            position: "relative",
            width: MIKU_W,
            height: MIKU_H,
            transform: imgFlip,
            cursor: state === "walking" ? "pointer" : "default",
            filter: "drop-shadow(0 8px 24px rgba(168,85,247,0.3))",
            transition: "transform 0.15s ease",
          }}
        >
          <Image
            src={imgSrc}
            alt="Miku"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Minimize button (right-click area) — click the tiny ✕ on hover */}
        <button
          title="Minimize Miku"
          onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(236,72,153,0.85)",
            border: "none",
            color: "white",
            fontSize: 9,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s",
            zIndex: 99999,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          ✕
        </button>
      </div>
    </>
  );
}
