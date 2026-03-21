"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { generateMikuMessage } from "@/lib/mikuEngine";

/* ─────────────────────────────────────────────
   IMAGE RESOLUTION
   Falls back to available images until
   miku-walking-1.png / miku-sitting.png exist
───────────────────────────────────────────── */
const IMG_MAP: Record<string, string> = {
  "miku-walking-1": "miku-happy",
  "miku-sitting":   "miku-happy",
};
function resolveImg(key: string): string {
  const k = key.startsWith("miku-") ? key.slice(5) : key;
  const resolved = IMG_MAP[`miku-${k}`] ?? `miku-${k}`;
  return `/miku_images/${resolved}.png`;
}

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type MikuState = "walking" | "talking" | "sitting" | "hover" | "bounce" | "dropping";

type Emotion =
  | "happy" | "sad" | "angry" | "excited"
  | "love"  | "thinking" | "blush" | "walking-1";

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
const SPEED    = 0.9;
const MIKU_W   = 110;
const MIKU_H   = 140;
const FLOOR_Y  = 10;  // px from bottom when walking

const START_SCENARIOS = [
  "walk_left_to_right",
  "walk_right_to_left",
  "already_sitting",
  "drop_from_top",
] as const;

/* ─────────────────────────────────────────────
   ADAPTER — wraps generateMikuMessage
───────────────────────────────────────────── */
async function fetchMikuMsg(
  type: string,
  taskName?: string
): Promise<MikuMsg> {
  try {
    const result = await generateMikuMessage(type, taskName);
    return {
      emotion: result.emotion as Emotion,
      text:    result.message,
    };
  } catch {
    return { emotion: "thinking", text: "Ek second... kuch sochna pad raha hai 🤔" };
  }
}

/* ─────────────────────────────────────────────
   SPEECH BUBBLE
───────────────────────────────────────────── */
function MikuSpeechBubble({
  msg, emotion, onDismiss,
}: {
  msg: MikuMsg | null;
  emotion: Emotion;
  onDismiss: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [done,  setDone]  = useState(false);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!msg) { setTyped(""); setDone(false); return; }
    setTyped(""); setDone(false);
    let i = 0;
    if (ivRef.current) clearInterval(ivRef.current);
    ivRef.current = setInterval(() => {
      i++;
      setTyped(msg.text.slice(0, i));
      if (i >= msg.text.length) { clearInterval(ivRef.current!); setDone(true); }
    }, 25);
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [msg]);

  if (!msg) return null;

  const safeEmotion = emotion === "walking-1" ? "happy" : emotion;

  return (
    <>
      <style>{`
        @keyframes bubbleIn {
          0%  { transform: translateY(15px) scale(0.9); opacity:0; }
          70% { transform: translateY(-3px) scale(1.02); }
          100%{ transform: translateY(0) scale(1); opacity:1; }
        }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
      <div style={{
        position:"absolute", bottom: MIKU_H + 24, left:"50%",
        transform:"translateX(-50%)",
        background:"white", border:"2px solid #F9A8D4",
        borderRadius:"18px 18px 18px 4px", padding:"12px 16px",
        maxWidth:270, minWidth:200, width:"max-content",
        boxShadow:"0 8px 24px rgba(236,72,153,0.15)",
        zIndex:99999,
        animation:"bubbleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        pointerEvents:"auto",
      }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <div style={{ width:20, height:20, borderRadius:"50%", overflow:"hidden", flexShrink:0, position:"relative" }}>
            <Image src={`/miku_images/miku-${safeEmotion}.png`} alt="Miku" fill style={{ objectFit:"cover" }} />
          </div>
          <span style={{ fontWeight:700, fontSize:12, color:"#7C3AED", fontFamily:"'Inter',sans-serif" }}>
            Miku 💕
          </span>
          <button onClick={onDismiss} style={{
            marginLeft:"auto", background:"none", border:"none",
            cursor:"pointer", color:"#9CA3AF", fontSize:13, lineHeight:1, padding:"0 2px",
          }}>✕</button>
        </div>

        {/* Text */}
        <p style={{
          margin:0, fontSize:13, lineHeight:1.6, color:"#374151",
          fontFamily:"'Inter',sans-serif", whiteSpace:"pre-wrap", minHeight:36,
        }}>
          {typed}
          {!done && (
            <span style={{
              display:"inline-block", width:2, height:13,
              background:"#EC4899", marginLeft:2,
              animation:"cursorBlink 0.6s ease infinite", verticalAlign:"middle",
            }}/>
          )}
        </p>

        {/* Buttons */}
        {done && (
          <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
            <button onClick={onDismiss} style={{
              background:"linear-gradient(135deg,#F9A8D4,#C084FC)",
              border:"none", borderRadius:20, padding:"5px 14px",
              fontSize:11.5, color:"white", cursor:"pointer",
              fontWeight:700, fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap",
            }}>😂 Haha okay</button>
            <button onClick={onDismiss} style={{
              background:"none", border:"2px solid #F9A8D4",
              borderRadius:20, padding:"4px 14px",
              fontSize:11.5, color:"#EC4899", cursor:"pointer",
              fontWeight:700, fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap",
            }}>😤 Fine fine</button>
          </div>
        )}

        {/* Pointer triangle */}
        <div style={{
          position:"absolute", bottom:-11, left:22, width:0, height:0,
          borderLeft:"10px solid transparent", borderRight:"4px solid transparent",
          borderTop:"11px solid white", filter:"drop-shadow(0 1px 0 #F9A8D4)",
        }}/>
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
    const iv = setInterval(() => setKey(k => k+1), 400);
    return () => clearInterval(iv);
  }, [active]);

  if (!active) return null;
  return (
    <>
      <style>{`@keyframes dustPuff{0%{transform:scale(.2);opacity:.5}100%{transform:scale(1.8);opacity:0}}`}</style>
      <div key={key} style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }}>
        {[0, 150].map(delay => (
          <div key={delay} style={{
            position:"absolute", bottom:4,
            left: delay === 0 ? -14 : 6,
            width:8, height:8, borderRadius:"50%",
            background:"rgba(150,150,150,0.55)",
            animation:"dustPuff 0.4s ease-out forwards",
            animationDelay:`${delay}ms`,
          }}/>
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
      setVisible(true); setKey(k => k+1);
      setTimeout(() => setVisible(false), 1800);
    }, 20000);
    return () => clearInterval(iv);
  }, [active]);

  if (!visible) return null;
  return (
    <>
      <style>{`@keyframes heartRise{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-70px) scale(.2);opacity:0}}`}</style>
      <div key={key} style={{ position:"absolute", bottom:MIKU_H, left:"50%", pointerEvents:"none" }}>
        {[
          { color:"#F9A8D4", size:14, delay:0,   x:-10 },
          { color:"#C084FC", size:12, delay:300,  x:10  },
          { color:"#F9A8D4", size:16, delay:600,  x:0   },
        ].map((h,i) => (
          <span key={i} style={{
            position:"absolute", left:h.x, bottom:0,
            fontSize:h.size, color:h.color,
            animation:"heartRise 1.4s ease-out forwards",
            animationDelay:`${h.delay}ms`, opacity:0,
          }}>♥</span>
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN MIKU COMPANION
───────────────────────────────────────────── */
export default function MikuCompanion() {
  // ── State ──
  const [state,       setState]       = useState<MikuState>("walking");
  const [posX,        setPosX]        = useState(-MIKU_W * 2);
  const [posY,        setPosY]        = useState(0);      // used for sitting/dropping (px from top)
  const [dir,         setDir]         = useState(1);
  const [img,         setImg]         = useState("miku-walking-1");
  const [bubble,      setBubble]      = useState<MikuMsg | null>(null);
  const [sittingCard, setSittingCard] = useState<SittingCardInfo | null>(null);
  const [bob,         setBob]         = useState(0);
  const [isDropping,  setIsDropping]  = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [ready,       setReady]       = useState(false); // true after initMiku runs

  // ── Refs for use inside RAF / intervals ──
  const stateRef  = useRef(state);  stateRef.current  = state;
  const posXRef   = useRef(posX);   posXRef.current   = posX;
  const dirRef    = useRef(dir);    dirRef.current    = dir;
  const readyRef  = useRef(ready);  readyRef.current  = ready;

  /* ─────────────────────────────────────────
     INIT MIKU — random start scenario
  ───────────────────────────────────────── */
  const initMiku = useCallback(() => {
    const W        = window.innerWidth;
    const scenario = START_SCENARIOS[Math.floor(Math.random() * START_SCENARIOS.length)];
    console.log('[Miku] starting scenario:', scenario);

    if (scenario === "walk_left_to_right") {
      setDir(1);
      setPosX(-MIKU_W * 2);
      setState("walking");
      setImg("miku-walking-1");
      setReady(true);
      return;
    }

    if (scenario === "walk_right_to_left") {
      setDir(-1);
      setPosX(W + MIKU_W * 2);
      setState("walking");
      setImg("miku-walking-1");
      setReady(true);
      return;
    }

    // For card-based scenarios, we need DOM cards
    const cards = document.querySelectorAll("[data-task-name]");
    if (cards.length === 0) {
      // no cards rendered yet → fallback to walk
      setDir(1);
      setPosX(-MIKU_W * 2);
      setState("walking");
      setImg("miku-walking-1");
      setReady(true);
      return;
    }

    const card = cards[Math.floor(Math.random() * cards.length)] as HTMLElement;
    const rect = card.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2 - MIKU_W / 2;
    const targetY = rect.top - MIKU_H + 20;

    const cardInfo: SittingCardInfo = {
      name: card.dataset.taskName || "",
      date: card.dataset.taskDate || "",
      x:    targetX,
      y:    targetY,
    };

    if (scenario === "already_sitting") {
      setPosX(targetX);
      setPosY(targetY);
      setImg("miku-sitting");
      setSittingCard(cardInfo);
      setState("sitting");
      setReady(true);
      return;
    }

    // drop_from_top
    setPosX(targetX);
    setPosY(targetY - 220);
    setImg("miku-excited");
    setIsDropping(true);
    setState("dropping");
    setReady(true);

    setTimeout(() => {
      setIsDropping(false);
      setPosY(targetY);
      setImg("miku-sitting");
      setSittingCard(cardInfo);
      setState("sitting");
    }, 650);
  }, []);

  /* ── MOUNT: init after 1.5s so DOM cards are rendered ── */
  useEffect(() => {
    const t = setTimeout(initMiku, 1500);
    return () => clearTimeout(t);
  }, [initMiku]);

  /* ─────────────────────────────────────────
     WALKING RAF
  ───────────────────────────────────────── */
  useEffect(() => {
    if (state !== "walking") return;
    let raf: number;
    const tick = () => {
      const W = window.innerWidth;
      setPosX(x => {
        const nx = x + SPEED * dirRef.current;
        // walked fully off screen → pause then re-init
        if (nx > W + MIKU_W * 2 || nx < -MIKU_W * 2) {
          cancelAnimationFrame(raf);
          const pause = Math.random() * 3000 + 2000;
          setTimeout(() => {
            setBubble(null);
            setSittingCard(null);
            initMiku();
          }, pause);
          return nx;
        }
        // bounce off soft edge while mid-screen
        if (nx > W + 150) { setDir(-1); return nx; }
        if (nx < -150)    { setDir(1);  return nx; }
        return nx;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state, initMiku]);

  /* ── BOB WHILE WALKING ── */
  useEffect(() => {
    if (state !== "walking") return;
    let t = 0;
    const iv = setInterval(() => { t += 0.3; setBob(Math.sin(t) * 3); }, 30);
    return () => clearInterval(iv);
  }, [state]);

  /* ─────────────────────────────────────────
     RANDOM STOP TO TALK (8–18 s)
  ───────────────────────────────────────── */
  useEffect(() => {
    if (state !== "walking") return;
    const hour = new Date().getHours();
    const day  = new Date().getDay();
    const isSundayMorning = day === 0 && hour < 12;

    let msgType = "random_stop";
    if (hour >= 6 && hour < 9)         msgType = "morning_checkin";
    else if (hour >= 23 || hour < 5)   msgType = "late_night";
    else if (isSundayMorning)          msgType = "give_challenge";
    else if (Math.random() < 0.3)
      msgType = Math.random() < 0.5 ? "random_sweet" : "random_flirt";
    else if ([0, 6].includes(day) && Math.random() < 0.4)
      msgType = "give_challenge";

    const delay = Math.random() * 10000 + 8000;
    const t = setTimeout(async () => {
      if (stateRef.current !== "walking") return;
      setState("talking");
      setImg("miku-thinking");
      await new Promise(r => setTimeout(r, 600));
      const msg = await fetchMikuMsg(msgType);
      setImg(`miku-${msg.emotion}`);
      setBubble(msg);
    }, delay);
    return () => clearTimeout(t);
  }, [state]);

  /* ─────────────────────────────────────────
     SITTING ON TASK CARDS (proximity check)
  ───────────────────────────────────────── */
  useEffect(() => {
    if (state !== "walking") return;
    const check = setInterval(() => {
      const cards = document.querySelectorAll("[data-task-name]");
      for (const card of Array.from(cards)) {
        const el   = card as HTMLElement;
        const rect = el.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;

        const taskId = el.dataset.taskId || el.dataset.taskName || "";
        const roasted: string[] = JSON.parse(
          localStorage.getItem("miku_roasted_tasks") || "[]"
        );
        if (roasted.includes(taskId)) continue;

        if (Math.abs(posXRef.current - cardCenterX) < 80 && Math.random() < 0.25) {
          const cardInfo: SittingCardInfo = {
            name: el.dataset.taskName || "",
            date: el.dataset.taskDate || "",
            x:    rect.left + rect.width / 2 - MIKU_W / 2,
            y:    rect.top  - MIKU_H + 20,
          };
          setState("sitting");
          setSittingCard(cardInfo);
          localStorage.setItem("miku_roasted_tasks",
            JSON.stringify([...roasted, taskId])
          );
          break;
        }
      }
    }, 2000);
    return () => clearInterval(check);
  }, [state]);

  /* ─────────────────────────────────────────
     SITTING LOGIC
  ───────────────────────────────────────── */
  useEffect(() => {
    if (state !== "sitting" || !sittingCard) return;
    setImg("miku-sitting");

    const run = async () => {
      await new Promise(r => setTimeout(r, 800));
      const msg = await fetchMikuMsg("sitting_on_card", sittingCard.name);
      setImg(`miku-${msg.emotion}`);
      setBubble(msg);

      await new Promise(r => setTimeout(r, 6000));
      setBubble(null);
      setSittingCard(null);
      setState("walking");
      setDir(Math.random() < 0.5 ? 1 : -1);
      setImg("miku-walking-1");
    };
    run();
  }, [state, sittingCard]);

  /* ─────────────────────────────────────────
     DISMISS BUBBLE
  ───────────────────────────────────────── */
  const dismissBubble = useCallback(() => {
    setBubble(null);
    if (state === "talking") {
      setState("walking");
      setImg("miku-walking-1");
    } else if (state === "sitting") {
      setSittingCard(null);
      setState("walking");
      setDir(Math.random() < 0.5 ? 1 : -1);
      setImg("miku-walking-1");
    }
  }, [state]);

  /* ─────────────────────────────────────────
     HOVER / CLICK
  ───────────────────────────────────────── */
  const handleMouseEnter = useCallback(() => {
    if (state === "walking") {
      setState("hover");
      setImg("miku-blush");
      setBubble({ emotion:"blush", text:"K-kya dekh raha hai...?! 😳" });
    }
  }, [state]);

  const handleMouseLeave = useCallback(() => {
    if (state === "hover") {
      setBubble(null);
      const t = setTimeout(() => { setState("walking"); setImg("miku-walking-1"); }, 1500);
      return () => clearTimeout(t);
    }
  }, [state]);

  const handleClick = useCallback(async () => {
    if (state === "talking" || state === "sitting" || state === "dropping") return;
    setState("bounce");
    setImg("miku-excited");
    await new Promise(r => setTimeout(r, 400));
    setState("talking");
    const type = Math.random() < 0.5 ? "random_sweet" : "random_flirt";
    const msg  = await fetchMikuMsg(type);
    setImg(`miku-${msg.emotion}`);
    setBubble(msg);
  }, [state]);

  /* ── TASK COMPLETED event ── */
  useEffect(() => {
    const onTaskDone = async () => {
      if (stateRef.current === "sitting") return;
      setState("talking");
      setImg("miku-excited");
      const msg = await fetchMikuMsg("task_done_react");
      setImg(`miku-${msg.emotion}`);
      setBubble(msg);
    };
    window.addEventListener("taskCompleted", onTaskDone);
    return () => window.removeEventListener("taskCompleted", onTaskDone);
  }, []);

  /* ── DSA SOLVED event ── */
  useEffect(() => {
    const onDsa = async () => {
      setState("talking");
      setImg("miku-excited");
      const msg = await fetchMikuMsg("dsa_roast");
      setImg(`miku-${msg.emotion}`);
      setBubble(msg);
    };
    window.addEventListener("dsaSolved", onDsa);
    return () => window.removeEventListener("dsaSolved", onDsa);
  }, []);

  /* ── Track message count ── */
  useEffect(() => {
    if (!bubble) return;
    const count = parseInt(localStorage.getItem("miku_total_messages") || "0");
    localStorage.setItem("miku_total_messages", String(count + 1));
    localStorage.setItem("miku_last_seen", String(Date.now()));
  }, [bubble]);

  /* ─────────────────────────────────────────
     COMPUTE POSITION
  ───────────────────────────────────────── */
  const isSitting   = (state === "sitting" || state === "dropping") && sittingCard;
  const isDropScen  = state === "dropping";

  // When sitting/dropping: position by fixed top/left in viewport
  // When walking: fixed left + bottom
  const fixedLeft   = isSitting ? sittingCard!.x : (state === "dropping" && !sittingCard ? posX : posX - MIKU_W / 2);
  const fixedBottom = isSitting ? undefined  : FLOOR_Y + bob;
  const fixedTop    = isSitting ? (isDropScen ? posY : sittingCard!.y) : undefined;

  const imgFlip = dir === -1 && state === "walking" ? "scaleX(-1)" : "none";
  const imgSrc  = resolveImg(img);

  /* ─────────────────────────────────────────
     MINIMIZED
  ───────────────────────────────────────── */
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        title="Bring back Miku"
        style={{
          position:"fixed", bottom:20, right:20, zIndex:99999,
          background:"linear-gradient(135deg,#C084FC,#EC4899)",
          border:"none", borderRadius:"50%", width:40, height:40,
          fontSize:20, cursor:"pointer",
          boxShadow:"0 4px 16px rgba(168,85,247,0.4)",
        }}
      >💜</button>
    );
  }

  return (
    <>
      <style>{`
        @keyframes dropBounce {
          0%   { transform: translateY(0); }
          70%  { transform: translateY(10px); }
          85%  { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        @keyframes sitDown {
          0%   { transform: translateY(-20px); opacity:0; }
          60%  { transform: translateY(4px); }
          100% { transform: translateY(0); opacity:1; }
        }
        @keyframes mikuBounce {
          0%   { transform: translateY(0); }
          40%  { transform: translateY(-25px); }
          70%  { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          position:  "fixed",
          left:      fixedLeft,
          bottom:    fixedBottom,
          top:       fixedTop,
          width:     MIKU_W,
          height:    MIKU_H,
          zIndex:    99998,
          userSelect:"none",
          pointerEvents:"auto",
          animation:
            state === "dropping"
              ? "dropBounce 0.65s ease-out forwards"
              : state === "sitting"
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
        {/* Speech bubble */}
        <MikuSpeechBubble
          msg={bubble}
          emotion={(img.replace("miku-","") as Emotion) || "happy"}
          onDismiss={dismissBubble}
        />

        {/* Floating hearts */}
        <FloatingHearts active={state === "walking"} />

        {/* Dust puffs — on walking AND on landing */}
        <DustPuffs active={state === "walking" || (state === "sitting" && !bubble)} />

        {/* Miku image */}
        <div style={{
          position:"relative", width:MIKU_W, height:MIKU_H,
          transform: imgFlip,
          cursor: state === "walking" ? "pointer" : "default",
          filter:"drop-shadow(0 8px 24px rgba(168,85,247,0.3))",
          transition:"transform 0.15s ease",
        }}>
          <Image
            src={imgSrc}
            alt="Miku"
            fill
            style={{ objectFit:"contain" }}
            priority
          />
        </div>

        {/* Minimize × */}
        <button
          title="Minimize Miku"
          onClick={e => { e.stopPropagation(); setIsMinimized(true); }}
          style={{
            position:"absolute", top:-8, right:-8,
            width:18, height:18, borderRadius:"50%",
            background:"rgba(236,72,153,0.85)",
            border:"none", color:"white", fontSize:9, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            opacity:0, transition:"opacity 0.2s", zIndex:99999, lineHeight:1,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
        >✕</button>
      </div>
    </>
  );
}
