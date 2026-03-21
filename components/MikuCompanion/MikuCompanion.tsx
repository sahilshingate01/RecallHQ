"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { generateMikuMessage, getMikuReply, getMikuClosingMessage } from "@/lib/mikuEngine";

/* ─────────────────────────────────────────────
   IMAGE RESOLUTION
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

interface ConversationMsg {
  role: 'miku' | 'user';
  text: string;
  emotion?: Emotion;
}

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const SPEED    = 0.9;
const MIKU_W   = 110;
const MIKU_H   = 140;
const FLOOR_Y  = 10;

const START_SCENARIOS = [
  "walk_left_to_right",
  "walk_right_to_left",
  "already_sitting",
  "drop_from_top",
] as const;

/* ─────────────────────────────────────────────
   TYPEWRITER COMPONENT
───────────────────────────────────────────── */
function TypewriterText({ text, speed = 25, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, onDone]);
  return <>{typed}</>;
}

/* ─────────────────────────────────────────────
   MAIN MIKU COMPANION
───────────────────────────────────────────── */
export default function MikuCompanion() {
  // ── State ──
  const [state,       setState]       = useState<MikuState>("walking");
  const [posX,        setPosX]        = useState(-MIKU_W * 2);
  const [posY,        setPosY]        = useState(0); 
  const [dir,         setDir]         = useState(1);
  const [img,         setImg]         = useState("miku-walking-1");
  const [sittingCard, setSittingCard] = useState<SittingCardInfo | null>(null);
  const [bob,         setBob]         = useState(0);
  const [isDropping,  setIsDropping]  = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [ready,       setReady]       = useState(false);

  // ── Conversation State ──
  const [conversation, setConversation] = useState<ConversationMsg[]>([]);
  const [convCount,    setConvCount]    = useState(0);
  const [convEnded,    setConvEnded]    = useState(false);
  const [isTyping,     setIsTyping]     = useState(false);
  const maxExchangesRef = useRef(Math.floor(Math.random() * 3) + 2); // 2, 3, or 4 exchanges

  const stateRef = useRef(state); stateRef.current = state;
  const posXRef  = useRef(posX);  posXRef.current  = posX;
  const dirRef   = useRef(dir);   dirRef.current   = dir;

  /* ─────────────────────────────────────────
     BUBBLE POSITIONING
  ────────────────────────────────────────── */
  const getBubblePosition = (mikuX: number) => {
    if (typeof window === 'undefined') return 0;
    const bubbleWidth = 260;
    const screenWidth = window.innerWidth;
    const padding     = 16;
    
    // Default: bubble appears to LEFT of Miku
    let left = mikuX - bubbleWidth - 10;
    
    // If bubble would go off LEFT edge
    if (left < padding) {
      // Place bubble to RIGHT of Miku instead
      left = mikuX + MIKU_W + 10;
    }
    
    // If bubble STILL goes off RIGHT edge
    if (left + bubbleWidth > screenWidth - padding) {
      // Force it to stay within screen
      left = screenWidth - bubbleWidth - padding;
    }
    return left;
  };

  const getBubbleTop = (mikuY_fromTop: number | undefined, mikuY_fromBottom: number | undefined) => {
    if (typeof window === 'undefined') return 0;
    const bubbleHeight = 160;
    const padding      = 16;
    const screenHeight = window.innerHeight;

    let y: number;
    if (mikuY_fromTop !== undefined) {
      y = mikuY_fromTop;
    } else {
      y = screenHeight - (mikuY_fromBottom ?? 0) - MIKU_H;
    }

    let top = y - bubbleHeight - 10;
    if (top < padding) top = padding;
    return top;
  };

  /* ─────────────────────────────────────────
     END CONVERSATION
  ────────────────────────────────────────── */
  const endConversation = useCallback(() => {
    setConvEnded(true);
    setTimeout(() => {
      setConversation([]);
      setConvEnded(false);
      setConvCount(0);
      maxExchangesRef.current = Math.floor(Math.random() * 3) + 2;
      setSittingCard(null);
      setState("walking");
      setImg("miku-walking-1");
    }, 1500);
  }, []);

  /* ─────────────────────────────────────────
     REPLY LOGIC
  ────────────────────────────────────────── */
  const getReplyOptions = (history: ConversationMsg[]) => {
    const lastMsg = history.filter(m => m.role === 'miku').at(-1)?.text || '';
    if(lastMsg.includes('task') || lastMsg.includes('pending'))
      return ['😅 Haan kar dunga', '🙄 Baad mein', '😭 Busy tha yaar'];
    if(lastMsg.includes('DSA') || lastMsg.includes('leetcode'))
      return ['💪 Abhi karta hoon', '😩 Kal se pakka', '🤔 Ek toh karunga'];
    if(lastMsg.includes('so') || lastMsg.includes('raat'))
      return ['😴 Okay so raha hoon', '😤 Ek aur ghanta', '🥺 Tu bhi so ja'];
    if(lastMsg.includes('care') || lastMsg.includes('proud'))
      return ['🥺 Thanks Miku', '😊 Perfect', '💕 Main bhi!'];
    if(lastMsg.includes('Sunday') || lastMsg.includes('weekend'))
      return ['😤 Challenge accepted', '😅 Try karunga', '🤝 Deal hai'];
    return ['😂 Haha okay okay', '🙄 Miku please', '🥺 Sorry yaar'];
  };

  const handleUserReply = async (replyText: string) => {
    setConversation(prev => [...prev, { role: 'user', text: replyText }]);
    const newCount = convCount + 1;
    setConvCount(newCount);
    setIsTyping(true);

    if (newCount >= maxExchangesRef.current) {
      const closing = await getMikuClosingMessage(replyText, conversation);
      setConversation(prev => [...prev, {
        role: 'miku',
        text: closing.message,
        emotion: closing.emotion as Emotion
      }]);
      setIsTyping(false);
      setConvEnded(true);
      setTimeout(endConversation, 4000);
      return;
    }

    await new Promise(r => setTimeout(r, 800));
    const reply = await getMikuReply(replyText, conversation);
    setConversation(prev => [...prev, {
      role: 'miku',
      text: reply.message,
      emotion: reply.emotion as Emotion
    }]);
    setImg(`miku-${reply.emotion}`);
    setIsTyping(false); 
  };

  /* ─────────────────────────────────────────
     INIT MIKU
  ───────────────────────────────────────── */
  const initMiku = useCallback(() => {
    const W = window.innerWidth;
    const scenario = START_SCENARIOS[Math.floor(Math.random() * START_SCENARIOS.length)];
    if (scenario === "walk_left_to_right") {
      setDir(1); setPosX(-MIKU_W * 2); setState("walking"); setImg("miku-walking-1"); setReady(true); return;
    }
    if (scenario === "walk_right_to_left") {
      setDir(-1); setPosX(W + MIKU_W * 2); setState("walking"); setImg("miku-walking-1"); setReady(true); return;
    }
    const cards = document.querySelectorAll("[data-task-name]");
    if (cards.length === 0) {
      setDir(1); setPosX(-MIKU_W * 2); setState("walking"); setImg("miku-walking-1"); setReady(true); return;
    }
    const card = cards[Math.floor(Math.random() * cards.length)] as HTMLElement;
    const rect = card.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2 - MIKU_W / 2;
    const targetY = rect.top - MIKU_H + 20;
    if (scenario === "already_sitting") {
      setPosX(targetX); setPosY(targetY); setImg("miku-sitting"); setSittingCard({ name: card.dataset.taskName || "", date: card.dataset.taskDate || "", x: targetX, y: targetY }); setState("sitting"); setReady(true); return;
    }
    setPosX(targetX); setPosY(targetY - 220); setImg("miku-excited"); setIsDropping(true); setState("dropping"); setReady(true);
    setTimeout(() => { setIsDropping(false); setPosY(targetY); setImg("miku-sitting"); setSittingCard({ name: card.dataset.taskName || "", date: card.dataset.taskDate || "", x: targetX, y: targetY }); setState("sitting"); }, 650);
  }, []);

  useEffect(() => { const t = setTimeout(initMiku, 1500); return () => clearTimeout(t); }, [initMiku]);

  /* ─────────────────────────────────────────
     WALKING RAF
  ───────────────────────────────────────── */
  useEffect(() => {
    if (state !== "walking") return;
    let raf: number;
    const tick = () => {
      setPosX(x => {
        const W = window.innerWidth;
        const nx = x + SPEED * dirRef.current;
        if (nx > W + MIKU_W * 2 || nx < -MIKU_W * 2) {
          cancelAnimationFrame(raf);
          setTimeout(initMiku, Math.random() * 3000 + 2000);
          return nx;
        }
        if (nx > W + 150) { setDir(-1); return nx; }
        if (nx < -150)    { setDir(1);  return nx; }
        return nx;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state, initMiku]);

  useEffect(() => {
    if (state !== "walking") return;
    let t = 0;
    const iv = setInterval(() => { t += 0.3; setBob(Math.sin(t) * 3); }, 30);
    return () => clearInterval(iv);
  }, [state]);

  /* ─────────────────────────────────────────
     TRIGGERS
  ────────────────────────────────────────── */
  const triggerTalking = async (type: string, tName?: string) => {
    if (stateRef.current !== "walking" && stateRef.current !== "sitting" && stateRef.current !== "dropping") return;
    const oldState = stateRef.current;
    setState("talking");
    setImg("miku-thinking");
    setIsTyping(true);
    const msg = await generateMikuMessage(type, tName);
    setConversation([{ role: 'miku', text: msg.message, emotion: msg.emotion as Emotion }]);
    setImg(`miku-${msg.emotion}`);
    setIsTyping(false);
  };

  useEffect(() => {
    if (state !== "walking") return;
    const delay = Math.random() * 10000 + 12000;
    const t = setTimeout(() => triggerTalking("random_stop"), delay);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (state !== "sitting" || !sittingCard || conversation.length > 0) return;
    const t = setTimeout(() => triggerTalking("sitting_on_card", sittingCard.name), 800);
    return () => clearTimeout(t);
  }, [state, sittingCard, conversation.length]);

  const onTaskDone = () => triggerTalking("task_done_react");
  const onDsa      = () => triggerTalking("dsa_roast");
  useEffect(() => {
    window.addEventListener("taskCompleted", onTaskDone);
    window.addEventListener("dsaSolved", onDsa);
    return () => { window.removeEventListener("taskCompleted", onTaskDone); window.removeEventListener("dsaSolved", onDsa); };
  }, []);

  /* ─────────────────────────────────────────
     HOVER / CLICK
  ────────────────────────────────────────── */
  const handleMouseEnter = () => { if (state === "walking" && conversation.length === 0) { setState("hover"); setImg("miku-blush"); setConversation([{ role: 'miku', text: "K-kya dekh raha hai...?! 😳", emotion: 'blush' }]); } };
  const handleMouseLeave = () => { if (state === "hover") { setConversation([]); setState("walking"); setImg("miku-walking-1"); } };
  const handleClick = async () => { if (state === "talking" || conversation.length > 0) return; setState("bounce"); setImg("miku-excited"); await new Promise(r => setTimeout(r, 400)); triggerTalking("random_sweet"); };

  /* ─────────────────────────────────────────
     COMPUTE UI
  ────────────────────────────────────────── */
  const isSitt = (state === "sitting" || state === "dropping") && sittingCard;
  const fLeft  = isSitt ? sittingCard!.x : posX - MIKU_W/2;
  const fBott  = isSitt ? undefined : FLOOR_Y + bob;
  const fTop   = isSitt ? (state === "dropping" ? posY : sittingCard!.y) : undefined;
  const iFlip  = dir === -1 && state === "walking" ? "scaleX(-1)" : "none";
  const iSrc   = resolveImg(img);

  const bubbleLeft = getBubblePosition(fLeft);
  const bubbleTop  = getBubbleTop(fTop, fBott);

  return (
    <>
      <style>{`
        @keyframes dropBounce { 0%{transform:translateY(0)} 70%{transform:translateY(10px)} 85%{transform:translateY(-8px)} 100%{transform:translateY(0)} }
        @keyframes sitDown { 0%{transform:translateY(-20px);opacity:0} 60%{transform:translateY(4px)} 100%{transform:translateY(0);opacity:1} }
        @keyframes mikuBounce { 0%{transform:translateY(0)} 40%{transform:translateY(-25px)} 70%{transform:translateY(-10px)} 100%{transform:translateY(0)} }
        @keyframes typingBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .typing-dot { width:6px; height:6px; background:#C084FC; border-radius:50%; animation:typingBounce 0.8s infinite; }
        .miku-chat-window p { word-wrap:break-word; overflow-wrap:break-word; white-space:normal; }
      `}</style>

      {/* CHAT WINDOW */}
      {conversation.length > 0 && (
        <div className="miku-chat-window" style={{
          position: 'fixed', left: bubbleLeft, top: bubbleTop, width: '280px',
          background: 'white', borderRadius: '18px', border: '2px solid #F9A8D4',
          boxShadow: '0 8px 32px rgba(236,72,153,0.2)', overflow: 'hidden', zIndex: 10000,
          pointerEvents: 'auto', display: 'flex', flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #F9A8D4, #C084FC)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image src={`/miku_images/miku-${conversation.filter(m => m.role === 'miku').at(-1)?.emotion || 'happy'}.png`} alt="" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Miku 💕</span>
            </div>
            <button onClick={endConversation} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conversation.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'miku' ? 'flex-start' : 'flex-end' }}>
                <div style={{
                  background: msg.role === 'miku' ? '#FDF2F8' : '#EF5A2A',
                  color: msg.role === 'miku' ? '#1f2937' : 'white',
                  borderRadius: msg.role === 'miku' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                  padding: '8px 12px', fontSize: '13px', maxWidth: '85%', lineHeight: 1.4,
                }}>
                  {msg.role === 'miku' && i === conversation.length - 1 && isTyping 
                    ? <TypewriterText text={msg.text} speed={25} onDone={() => setIsTyping(false)} />
                    : msg.text
                  }
                </div>
              </div>
            ))}
            {isTyping && conversation.length > 0 && conversation[conversation.length - 1].role === 'user' && (
              <div style={{ display: 'flex', gap: 4, padding: '4px 8px' }}>
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          {/* Repiles */}
          {!isTyping && !convEnded && conversation.length > 0 && (
            <div style={{ padding: '8px 10px', borderTop: '1px solid #FDE7F3' }}>
              {convCount < maxExchangesRef.current ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {getReplyOptions(conversation).map((opt, i) => (
                    <button key={i} onClick={() => handleUserReply(opt)} style={{
                      background: i === 0 ? '#FDF2F8' : '#F3F4F6', border: i === 0 ? '1px solid #F9A8D4' : '1px solid #E5E7EB',
                      borderRadius: '20px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', color: '#374151',
                    }}>{opt}</button>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={endConversation} style={{ background: '#FDF2F8', border: '1px solid #F9A8D4', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', cursor: 'pointer', flex: 1 }}>😊 Okay Miku!</button>
                  <button onClick={endConversation} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', cursor: 'pointer', flex: 1 }}>😤 Fine fine</button>
                </div>
              )}
            </div>
          )}

          {convEnded && (
            <div style={{ padding: '8px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF', borderTop: '1px solid #FDE7F3' }}>
              Miku walked away... 🐾
            </div>
          )}
        </div>
      )}

      {/* MIKU CHARACTER */}
      {!isMinimized && (
        <div style={{
          position: "fixed", left: fLeft, bottom: fBott, top: fTop, width: MIKU_W, height: MIKU_H, zIndex: 99998,
          userSelect: "none", pointerEvents: "auto",
          animation: state === "dropping" ? "dropBounce 0.65s ease-out forwards" : state === "sitting" ? "sitDown 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards" : state === "bounce" ? "mikuBounce 0.5s ease" : "none",
        }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
          <div style={{ position: "relative", width: MIKU_W, height: MIKU_H, transform: iFlip, cursor: state === "walking" ? "pointer" : "default", filter: "drop-shadow(0 8px 24px rgba(168,85,247,0.3))", transition: "transform 0.15s ease" }}>
            <Image src={iSrc} alt="Miku" fill style={{ objectFit: "contain" }} priority />
          </div>
          <button title="Minimize" onClick={e => { e.stopPropagation(); setIsMinimized(true); }} style={{ position: "absolute", top: -8, right: -8, width: 18, height: 18, borderRadius: "50%", background: "rgba(236,72,153,0.85)", border: "none", color: "white", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", zIndex: 99999 }} onMouseEnter={e => (e.currentTarget.style.opacity = "1")} onMouseLeave={e => (e.currentTarget.style.opacity = "0")}>✕</button>
        </div>
      )}

      {isMinimized && (
        <button onClick={() => setIsMinimized(false)} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 99999, background: "linear-gradient(135deg,#C084FC,#EC4899)", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, cursor: "pointer", boxShadow: "0 4px 16px rgba(168,85,247,0.4)" }}>💜</button>
      )}
    </>
  );
}
