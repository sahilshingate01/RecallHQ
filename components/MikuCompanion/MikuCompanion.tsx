"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { generateMikuMessage, getMikuReply, getMikuClosingMessage } from "@/lib/mikuEngine";

/* ─────────────────────────────────────────────
   IMAGE RESOLUTION
───────────────────────────────────────────── */
function getImgPath(name: string): string {
  const n = name.startsWith("miku-") ? name.slice(5) : name;
  return `/miku_images/miku-${n}.png`;
}

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type MikuState = 
  | 'walking' 
  | 'talking' 
  | 'sitting' 
  | 'hovering' 
  | 'bounce' 
  | 'dropping' 
  | 'jumping_to_card';

type Emotion =
  | "happy" | "sad" | "angry" | "excited"
  | "love"  | "thinking" | "blush" | "sitting" | "walking-1";

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
const MIKU_H   = 154; // Adjusted to match user's requested height

const LANE_BOTTOM = (typeof window !== 'undefined') ? window.innerHeight - 130 : 600;
const LANE_TOP    = 340;

const START_SCENARIOS = [
  'bottom_left',
  'bottom_right', 
  'top_left',
  'top_right',
  'card_sitting'
] as const;

/* ─────────────────────────────────────────────
   TYPEWRITER COMPONENT (Internal logic)
───────────────────────────────────────────── */
// Moved logic inside main component for smoother transition control

/* ─────────────────────────────────────────────
   MAIN MIKU COMPANION
───────────────────────────────────────────── */
export default function MikuCompanion() {
  // ── Character State ──
  const [state,       setState]       = useState<MikuState>("walking");
  const [posX,        setPosX]        = useState(-MIKU_W * 2);
  const [posY,        setPosY]        = useState(LANE_BOTTOM); 
  const [dir,         setDir]         = useState(1);
  const [imgSrc,      setImgSrc]      = useState("/miku_images/miku-walking-1.png");
  const [imgLoaded,   setImgLoaded]   = useState(false);
  const [emotion,     setEmotion]     = useState<Emotion>("happy");
  const [sittingCard, setSittingCard] = useState<SittingCardInfo | null>(null);
  const [bob,         setBob]         = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [ready,       setReady]       = useState(false);
  const [mikuScale,   setMikuScale]   = useState(1.0);
  const [mikuRotation, setMikuRotation] = useState(0);
  const [isJumping,   setIsJumping]    = useState(false);
  const [lane,        setLane]         = useState<'bottom'|'top'>('bottom');
  const [showBubble,  setShowBubble]   = useState(false);

  // ── UI / Animation State ──
  const [bubbleOpacity, setBubbleOpacity] = useState(0);
  const [displayText,   setDisplayText]   = useState("");
  
  // ── Conversation State ──
  const [conversation, setConversation] = useState<ConversationMsg[]>([]);
  const [convCount,    setConvCount]    = useState(0);
  const [convEnded,    setConvEnded]    = useState(false);
  const [isTyping,     setIsTyping]     = useState(false);
  const [currentMsg,   setCurrentMsg]   = useState("");
  const [mikuLoading,  setMikuLoading]  = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [showReplyButtons, setShowReplyButtons] = useState(false);
  const maxExchangesRef = useRef(Math.floor(Math.random() * 3) + 2);

  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  const stateRef = useRef(state); stateRef.current = state;
  const posXRef  = useRef(posX);  posXRef.current  = posX;
  const dirRef   = useRef(dir);   dirRef.current   = dir;
  const animRef  = useRef<number>(0);

  // Preload ALL images on component mount
  // so they never break mid-animation:
  useEffect(() => {
    const images = [
      'happy','sad','angry','excited',
      'love','thinking','blush','sitting',
      'walking-1'
    ];
    images.forEach(name => {
      const img = new Image();
      img.src = `/miku_images/miku-${name}.png`;
    });

    return () => {
      if(typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, []);

  const startTypewriter = (fullText: string, onComplete?: () => void) => {
    // ALWAYS clear previous before starting new
    if(typewriterRef.current) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }
    
    // Reset display immediately
    setDisplayText('');
    setIsTyping(true);
    
    let index = 0;
    const chars = fullText.split('');
    
    typewriterRef.current = setInterval(() => {
      if(index < chars.length) {
        setDisplayText(chars.slice(0, index + 1).join(''));
        index++;
      } else {
        // Done typing
        clearInterval(typewriterRef.current!);
        typewriterRef.current = null;
        setIsTyping(false);
        onComplete?.();
      }
    }, 28); // 28ms per character, smooth
  };

  useEffect(() => {
    if (currentMsg && showBubble) {
      startTypewriter(currentMsg, () => {
        if(!convEnded) {
          setShowReplyButtons(true);
        }
      });
    }
  }, [currentMsg, showBubble, convEnded]);

  /* ─────────────────────────────────────────
     BUBBLE POSITIONING
  ────────────────────────────────────────── */
  const getBubblePosition = (mikuX: number) => {
    if (typeof window === 'undefined') return 0;
    const bubbleWidth = 240;
    const screenWidth = window.innerWidth;
    const padding     = 16;
    let left = mikuX - (bubbleWidth / 2) + (MIKU_W / 2);
    if (left < padding) left = padding;
    if (left + bubbleWidth > screenWidth - padding) left = screenWidth - bubbleWidth - padding;
    return left;
  };

  const getBubbleTop = (mikuY_fromTop: number | undefined, mikuY_fromBottom: number | undefined) => {
    if (typeof window === 'undefined') return 0;
    const bubbleHeight = 120;
    const padding      = 16;
    const screenHeight = window.innerHeight;
    let y: number;
    if (mikuY_fromTop !== undefined) {
      y = mikuY_fromTop;
    } else {
      y = screenHeight - (mikuY_fromBottom ?? 0) - MIKU_H;
    }
    let top = y - bubbleHeight - 20;
    if (top < padding) top = padding;
    return top;
  };

  /* ─────────────────────────────────────────
     TRANSITIONS
  ────────────────────────────────────────── */
  const changeMikuExpression = useCallback((emotion: string) => {
    const newSrc = getImgPath(emotion);
    setMikuScale(1.15);
    setTimeout(() => setMikuScale(1.0), 200);
    
    // Preload before showing
    if (typeof window !== 'undefined') {
      const preload = new window.Image();
      preload.onload = () => {
        setImgSrc(newSrc);
        setImgLoaded(true);
        setEmotion(emotion as Emotion);
      };
      preload.onerror = () => {
        console.warn(`Miku image not found: ${newSrc}`);
      };
      preload.src = newSrc;
    }
  }, []);

  const updateMikuMessage = async (newMsg: string, newEmotion: string) => {
    // This helper is now mostly absorbed into the new flow, 
    // but we can fix it to match if still used by older logic
    setBubbleOpacity(1);
    setCurrentMsg(newMsg);
    changeMikuExpression(newEmotion);
  };

  /* ─────────────────────────────────────────
     DIALOGUE FLOW
  ────────────────────────────────────────── */
  const endConversation = useCallback(() => {
    setConvEnded(true);
    setBubbleOpacity(0);
    // Show heart rising logic if needed, but the user asked for bubble floating up exit
    setTimeout(() => {
      setConversation([]);
      setConvEnded(false);
      setConvCount(0);
      setDisplayText("");
      maxExchangesRef.current = Math.floor(Math.random() * 3) + 2;
      setSittingCard(null);
      setState("walking");
      setImgSrc("/miku_images/miku-walking-1.png");
    }, 1500);
  }, [displayText]);

  const handleUserReply = async (replyText: string) => {
    if(replyLoading) return; // prevent double click
  
    setReplyLoading(true);
    
    // IMMEDIATELY hide buttons + show Miku reacting
    setShowReplyButtons(false);
    changeMikuExpression('thinking');
    
    // Clear old message instantly
    if(typewriterRef.current) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }
    setDisplayText('');
    setCurrentMsg('');
    setMikuLoading(true);
    
    // Small visual feedback — Miku "thinks"
    await new Promise(r => setTimeout(r, 300));

    const userRoleMsg: ConversationMsg = { role: 'user', text: replyText };
    const historySnapshot = [...conversation, userRoleMsg];
    setConversation(historySnapshot);
    const newCount = convCount + 1;
    setConvCount(newCount);
    
    let result;
    if (newCount >= maxExchangesRef.current) {
      result = await getMikuClosingMessage(replyText, historySnapshot);
      setConvEnded(true);
    } else {
      result = await getMikuReply(replyText, historySnapshot);
    }

    setMikuLoading(false);
    setReplyLoading(false);
    setConversation(prev => [...prev, {
      role: 'miku',
      text: result.message,
      emotion: result.emotion as Emotion
    }]);
    setCurrentMsg(result.message);
    setEmotion(result.emotion as Emotion);
    changeMikuExpression(result.emotion);
    setShowBubble(true);
    setBubbleOpacity(1);
  };

  /* ─────────────────────────────────────────
     INIT MIKU (Fix 3 & 7)
  ────────────────────────────────────────── */
  const initMiku = useCallback(() => {
    // Wait for cards to render
    const cards = document.querySelectorAll('[data-task-name]');
    
    const scenarios = [
      'bottom_left',
      'bottom_right', 
      'top_left',
      'top_right',
      ...(cards.length > 0 
        ? ['card_sitting', 'card_sitting'] // higher weight
        : [])
    ];
    
    const pick = scenarios[
      Math.floor(Math.random() * scenarios.length)
    ];
    
    // Clear previous sessions
    sessionStorage.removeItem('miku_jumped_cards');
    
    if(pick === 'bottom_left') {
      setPosX(-150);
      setPosY(LANE_BOTTOM);
      setDir(1);
      setLane('bottom');
      setState('walking');
      setImgSrc('/miku_images/miku-walking-1.png');
      setReady(true);
    }
    else if(pick === 'bottom_right') {
      setPosX(window.innerWidth + 150);
      setPosY(LANE_BOTTOM);
      setDir(-1);
      setLane('bottom');
      setState('walking');
      setImgSrc('/miku_images/miku-walking-1.png');
      setReady(true);
    }
    else if(pick === 'top_left') {
      setPosX(-150);
      setPosY(LANE_TOP);
      setDir(1);
      setLane('top');
      setState('walking');
      setImgSrc('/miku_images/miku-walking-1.png');
      setReady(true);
    }
    else if(pick === 'top_right') {
      setPosX(window.innerWidth + 150);
      setPosY(LANE_TOP);
      setDir(-1);
      setLane('top');
      setState('walking');
      setImgSrc('/miku_images/miku-walking-1.png');
      setReady(true);
    }
    else if(pick === 'card_sitting') {
      // Already seated on random card
      const card = cards[
        Math.floor(Math.random() * cards.length)
      ] as HTMLElement;
      const rect = card.getBoundingClientRect();
      
      const sitX = rect.left + rect.width/2 - 55;
      const sitY = rect.top - 115;
      
      setPosX(sitX);
      setPosY(sitY);
      setDir(1);
      setState('sitting');
      setImgSrc('/miku_images/miku-sitting.png');
      setSittingCard({
        name: card.dataset.taskName || '',
        date: card.dataset.taskDate || '',
        x: sitX,
        y: sitY
      });
      setReady(true);
      
      // Talk after 1.5s
      setTimeout(async () => {
        // Step 1: Stop typewriter
        if(typewriterRef.current) {
          clearInterval(typewriterRef.current);
          typewriterRef.current = null;
        }
        
        // Step 2: Clear everything BEFORE api call
        setDisplayText('');
        setCurrentMsg('');
        setMikuLoading(true);
        setShowBubble(true); // show bubble immediately with dots
        setBubbleOpacity(1);
        setIsTyping(false);
        setShowReplyButtons(false);
        
        // Step 3: Small pause
        await new Promise(r => setTimeout(r, 80));

        const result = await generateMikuMessage('sitting_on_card', card.dataset.taskName);
        
        setMikuLoading(false);
        setEmotion(result.emotion as Emotion);
        changeMikuExpression(result.emotion);
        setConversation([{ role: 'miku', text: result.message, emotion: result.emotion as Emotion }]);
        setCurrentMsg(result.message);
      }, 1500);
    }
  }, []);

  const startNewWalkCycle = useCallback(() => {
    sessionStorage.removeItem('miku_jumped_cards');
    initMiku();
  }, [initMiku]);

  useEffect(() => { const t = setTimeout(initMiku, 1500); return () => clearTimeout(t); }, [initMiku]);

  /* ─────────────────────────────────────────
     CORE ANIMATIONS (Fix 2 & 4)
  ───────────────────────────────────────── */
  const switchLane = async (targetY: number) => {
    setIsJumping(true);
    
    // Jump arc animation
    const startY = posXRef.current; // Wait, this should be posY
    const startYActual = posY;
    const midY = Math.min(startYActual, targetY) - 60; // arc peak
    const duration = 500;
    const start = performance.now();
    
    const animJump = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Parabolic arc
      const y = startYActual + (targetY - startYActual) * t 
                - Math.sin(Math.PI * t) * 80;
      setPosY(y);
      
      if(t < 1) requestAnimationFrame(animJump);
      else {
        setPosY(targetY);
        setIsJumping(false);
        setLane(targetY > 400 ? 'bottom' : 'top');
      }
    };
    requestAnimationFrame(animJump);
  };

  const jumpToPosition = (
    targetX: number,
    targetY: number,
    onDone: () => void
  ) => {
    const startX = posX;
    const startY = posY;
    const duration = 450;
    const start = performance.now();
    
    const anim = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = t < 0.5 
        ? 2*t*t 
        : -1+(4-2*t)*t; // ease in-out
      
      const newX = startX + (targetX - startX) * ease;
      const newY = startY + (targetY - startY) * ease
                   - Math.sin(Math.PI * t) * 70; // arc
      
      setPosX(newX);
      setPosY(newY);
      
      // Rotate slightly during jump
      setMikuRotation(Math.sin(Math.PI * t) * 15);
      
      if(t < 1) requestAnimationFrame(anim);
      else {
        setMikuRotation(0);
        onDone();
      }
    };
    
    setImgSrc('/miku_images/miku-excited.png');
    requestAnimationFrame(anim);
  };

  const checkCardJump = (currentX: number) => {
    if(stateRef.current !== 'walking') return;
    if(lane !== 'top') return;
    
    const cards = document.querySelectorAll('[data-task-name]');
    const alreadyJumped = JSON.parse(
      sessionStorage.getItem('miku_jumped_cards') || '[]'
    );
    
    cards.forEach((card) => {
      const el = card as HTMLElement;
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width/2;
      
      // Skip already visited cards this session
      const cardId = el.dataset.taskName;
      if(alreadyJumped.includes(cardId)) return;
      
      // Near this card?
      if(Math.abs(currentX - cardCenter) < 50 
         && Math.random() < 0.35) {
        
        // Mark as visited
        alreadyJumped.push(cardId);
        sessionStorage.setItem(
          'miku_jumped_cards',
          JSON.stringify(alreadyJumped)
        );
        
        // Jump on card!
        const sitX = rect.left + rect.width/2 - 55;
        const sitY = rect.top - 115;
        
        setState('jumping_to_card');
        cancelAnimationFrame(animRef.current);
        
        // Jump arc to card top
        jumpToPosition(sitX, sitY, async () => {
          setImgSrc('/miku_images/miku-sitting.png');
          setState('sitting');
          setSittingCard({
            name: el.dataset.taskName || '',
            date: el.dataset.taskDate || '',
            x: sitX,
            y: sitY
          });
          
          // Sit for 1s then talk
          setTimeout(async () => {
            // Stop any current typewriter first
            if(typewriterRef.current) {
              clearInterval(typewriterRef.current);
              typewriterRef.current = null;
            }
            setDisplayText('');
            setIsTyping(false);
            setShowBubble(false);

            const result = await generateMikuMessage('sitting_on_card', el.dataset.taskName);
            setEmotion(result.emotion as Emotion);
            setConversation([{ role: 'miku', text: result.message, emotion: result.emotion as Emotion }]);
            setCurrentMsg(result.message);
            setShowBubble(true);
            setBubbleOpacity(1);
          }, 800);
        });
      }
    });
  };

  /* ─────────────────────────────────────────
     WALKING RAF
  ───────────────────────────────────────── */
  useEffect(() => {
    if (state !== "walking") return;
    const tick = () => {
      setPosX(x => {
        const W = window.innerWidth;
        const next = x + SPEED * dirRef.current;
        
        if (next > W + 150 || next < -150) {
          if (Math.random() < 0.4) {
            // Switch lane
            const targetY = lane === 'bottom' ? LANE_TOP : LANE_BOTTOM;
            const newDir = next < -150 ? 1 : -1;
            setDir(newDir);
            switchLane(targetY);
            // Reset X to edge
            return next < -150 ? -150 : W + 150;
          } else {
            // Just reverse direction
            setDir(d => d * -1);
          }
          
          if (next > W + MIKU_W * 2 || next < -MIKU_W * 2) {
             cancelAnimationFrame(animRef.current);
             setTimeout(startNewWalkCycle, Math.random() * 3000 + 2000);
             return next;
          }
        }
        
        checkCardJump(next);
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, startNewWalkCycle, lane]);

  // Lane Switch While Walking (Fix 5)
  useEffect(() => {
    if(state !== 'walking') return;
    
      const t = setTimeout(() => {
        const targetY = lane === 'bottom' 
          ? LANE_TOP 
          : LANE_BOTTOM;
        switchLane(targetY);
      }, Math.random() * 10000 + 15000);
      
      return () => clearTimeout(t);
    }, [state, lane]);

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
    
    // Step 1: Stop any current typewriter first
    if(typewriterRef.current) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }
    
    // Step 2: Clear EVERYTHING before API
    setDisplayText('');
    setCurrentMsg('');
    setMikuLoading(true);
    setShowBubble(true); // show bubble immediately with dots
    setBubbleOpacity(1);
    setIsTyping(false);
    setShowReplyButtons(false);
    
    setState("talking");
    
    // Step 3: Small pause
    await new Promise(r => setTimeout(r, 80));

    const result = await generateMikuMessage(type, tName);
    
    setMikuLoading(false);
    setEmotion(result.emotion as Emotion);
    changeMikuExpression(result.emotion);
    setConversation([{ role: 'miku', text: result.message, emotion: result.emotion as Emotion }]);
    setCurrentMsg(result.message);
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
    const handleTask = () => onTaskDone();
    const handleDsa  = () => onDsa();
    window.addEventListener("taskCompleted", handleTask);
    window.addEventListener("dsaSolved", handleDsa);
    return () => { window.removeEventListener("taskCompleted", handleTask); window.removeEventListener("dsaSolved", handleDsa); };
  }, []);

  /* ─────────────────────────────────────────
     HOVER / CLICK
  ────────────────────────────────────────── */
  const handleMikuHover = () => {
    if(state !== 'walking') return;
    
    // Stop walking
    cancelAnimationFrame(animRef.current);
    setState('hovering');
    
    // Preload image before showing
    const img = new Image();
    img.src = '/miku_images/miku-blush.png';
    img.onload = () => {
      setImgSrc('/miku_images/miku-blush.png');
      setEmotion('blush');
      setImgLoaded(true);
    };
    img.onerror = () => {
      // fallback if blush image missing
      setImgSrc('/miku_images/miku-happy.png');
    };
    
    // Show hover bubble
    setBubbleOpacity(1);
    setCurrentMsg('K-kya dekh raha hai...?! 😳');
    setShowBubble(true);
    
    // Resume walking after 2s
    setTimeout(() => {
      setShowBubble(false);
      setBubbleOpacity(0);
      setImgSrc('/miku_images/miku-walking-1.png');
      setState('walking');
      setCurrentMsg('');
    }, 2000);
  };

  const handleMouseLeave = () => { 
    // Handled by setTimeout in handleMikuHover
  };

  const handleClick = async () => { 
    if (state === "talking" || conversation.length > 0) return; 
    setState("bounce"); 
    changeMikuExpression("excited"); 
    await new Promise(r => setTimeout(r, 400)); 
    triggerTalking("random_sweet"); 
  };

  /* ─────────────────────────────────────────
     REPLY OPTIONS
  ────────────────────────────────────────── */
  const getReplyOptions = (history: ConversationMsg[]) => {
    const mikuMsgs = history.filter(m => m.role === 'miku');
    const lastMsg = mikuMsgs.at(-1)?.text || '';
    if(lastMsg.includes('task') || lastMsg.includes('pending'))
      return [{text:'😅 Haan kar dunga'}, {text:'🙄 Baad mein'}, {text:'😭 Busy tha yaar'}];
    if(lastMsg.includes('DSA') || lastMsg.includes('leetcode'))
      return [{text:'💪 Abhi karta hoon'}, {text:'😩 Kal se pakka'}, {text:'🤔 Ek toh karunga'}];
    if(lastMsg.includes('so') || lastMsg.includes('raat'))
      return [{text:'😴 Okay so raha hoon'}, {text:'😤 Ek aur ghanta'}, {text:'🥺 Tu bhi so ja'}];
    if(lastMsg.includes('care') || lastMsg.includes('proud'))
      return [{text:'🥺 Thanks Miku'}, {text:'😊 Perfect'}, {text:'💕 Main bhi!'}];
    if(lastMsg.includes('Sunday') || lastMsg.includes('weekend'))
      return [{text:'😤 Challenge accepted'}, {text:'😅 Try karunga'}, {text:'🤝 Deal hai'}];
    return [{text:'😂 Haha okay'}, {text:'🙄 Miku please'}, {text:'🥺 Sorry yaar'}];
  };

  /* ─────────────────────────────────────────
     COMPUTE UI
  ────────────────────────────────────────── */
  const bubbleLeft = getBubblePosition(posX);
  const mikuY = sittingCard ? sittingCard.y : posY;
  const bubbleTop = getBubbleTop(mikuY, undefined);

  const mikuTransform = `
    scaleX(${dir === -1 ? -1 : 1}) 
    scale(${mikuScale})
    rotate(${mikuRotation}deg)
    translateY(${bob}px)
  `;

  return (
    <>
      <style>{`
        @keyframes dropBounce { 0%{transform:translateY(0)} 70%{transform:translateY(10px)} 85%{transform:translateY(-8px)} 100%{transform:translateY(0)} }
        @keyframes sitDown { 0%{transform:translateY(-20px);opacity:0} 60%{transform:translateY(4px)} 100%{transform:translateY(0);opacity:1} }
        @keyframes mikuBounce { 0%{transform:translateY(0)} 40%{transform:translateY(-25px)} 70%{transform:translateY(-10px)} 100%{transform:translateY(0)} }
        @keyframes bubbleAppear { 0% { transform: translateY(10px) scale(0.92); opacity: 0; } 70% { transform: translateY(-3px) scale(1.02); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes bubbleExit { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-20px); opacity: 0; } }
        .miku-bubble { animation: bubbleAppear 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .miku-bubble-exit { animation: bubbleExit 0.6s ease-in forwards; }
        .typing-dot { width: 4px; height: 4px; background: #F472B6; borderRadius: 50%; animation: dotPulse 1.4s infinite; }
        @keyframes dotPulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>

      {/* ANIME SPEECH BUBBLE */}
      {(conversation.length > 0 || showBubble) && (
        <div style={{
          position: 'fixed',
          left: bubbleLeft,
          top: bubbleTop,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 8,
          pointerEvents: 'none',
          opacity: bubbleOpacity,
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          transform: bubbleOpacity === 0 ? 'translateY(4px) scale(0.98)' : 'translateY(0) scale(1)',
        }} className={convEnded ? "miku-bubble-exit" : "miku-bubble"}>

          <div style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            boxShadow: '0 0 0 2px #F9A8D4, 0 12px 40px rgba(236,72,153,0.18), 0 4px 12px rgba(0,0,0,0.08)',
            padding: '14px 18px',
            maxWidth: '220px',    // ← smaller than before
            maxHeight: '100px',   // ← hard limit
            overflow: 'hidden',   // ← hide overflow
            position: 'relative',
            pointerEvents: 'auto',
          }}>
            <div style={{
              position: 'absolute', top: -12, left: 16,
              background: 'linear-gradient(135deg, #F472B6, #A78BFA)',
              borderRadius: '20px', padding: '2px 10px', fontSize: '11px',
              fontWeight: 700, color: 'white', letterSpacing: '0.3px',
            }}>Miku ♡</div>

            <div style={{
              margin: 0, 
              fontSize: '13px', 
              lineHeight: 1.5, 
              color: '#1f2937',
              fontFamily: 'system-ui, -apple-system, sans-serif', 
              fontWeight: 400,
              wordWrap: 'break-word', 
              overflowWrap: 'break-word', 
              whiteSpace: 'normal',
              display: '-webkit-box',
              WebkitLineClamp: 3,      // max 3 lines
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {mikuLoading ? (
                <div style={{ display:'flex', gap:4, padding:'4px 0' }}>
                  <div className="typing-dot"/>
                  <div className="typing-dot" style={{animationDelay:'0.2s'}}/>
                  <div className="typing-dot" style={{animationDelay:'0.4s'}}/>
                </div>
              ) : (
                <>
                  {displayText}
                  {isTyping && (
                    <span style={{
                      display: 'inline-block', 
                      width: '1.5px', 
                      height: '13px', 
                      background: '#F472B6',
                      marginLeft: '1px', 
                      verticalAlign: 'middle',
                      animation: 'none', // no animation, just solid
                      opacity: 1,
                    }}/>
                  )}
                </>
              )}
            </div>

            {/* Tail (Moved outside the restricted p to prevent clipping) */}
            <div style={{
              position: 'absolute', bottom: -12, left: 28, width: 0, height: 0,
              borderLeft: '10px solid transparent', borderRight: '6px solid transparent',
              borderTop: '14px solid white', filter: 'drop-shadow(0 2px 2px rgba(236,72,153,0.2))',
            }}/>
            <div style={{
              position: 'absolute', bottom: -15, left: 26, width: 0, height: 0,
              borderLeft: '12px solid transparent', borderRight: '7px solid transparent',
              borderTop: '16px solid #F9A8D4', zIndex: -1,
            }}/>
          </div>

          {/* Reply buttons */}
          {showReplyButtons && !convEnded && conversation.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 6, 
              paddingLeft: 8, 
              pointerEvents: 'auto',
              opacity: showReplyButtons ? 1 : 0,
              transform: showReplyButtons ? 'translateY(0)' : 'translateY(4px)',
              transition: 'all 0.2s ease',
              marginTop: 8,
            }}>
              {getReplyOptions(conversation).map((opt, i) => (
                <button key={i} onClick={() => handleUserReply(opt.text)} disabled={replyLoading} style={{
                  background: i === 0 ? 'linear-gradient(135deg, #FDF2F8, #FAE8FF)' : 'rgba(255,255,255,0.9)',
                  border: i === 0 ? '1.5px solid #F9A8D4' : '1.5px solid #E5E7EB',
                  borderRadius: '30px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                  color: '#374151', fontWeight: i === 0 ? 600 : 400, backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                  opacity: replyLoading ? 0.5 : 1,
                }} onMouseEnter={e => {
                  if (replyLoading) return;
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(244,114,182,0.25)';
                }} onMouseLeave={e => {
                  if (replyLoading) return;
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}>{opt.text}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MIKU CHARACTER */}
      {!isMinimized && (
        <div style={{
          position: 'fixed',
          left: posX,
          top: mikuY,
          zIndex: 9999,
          width: 110,
          pointerEvents: 'auto',
          cursor: 'pointer',
          userSelect: 'none',
        }} onMouseEnter={handleMikuHover} onMouseLeave={handleMouseLeave} onClick={handleClick}>
          <div style={{ 
            position: "relative", 
            width: MIKU_W, 
            height: MIKU_H, 
            filter: "drop-shadow(0 8px 24px rgba(168,85,247,0.3))" 
          }}>
            <img 
              src={imgSrc} 
              alt="" 
              width={110}
              height={154}
              style={{ 
                objectFit: "contain",
                transform: mikuTransform,
                transition: isJumping ? 'none' : 'transform 0.15s ease, opacity 0.2s ease',
                opacity: imgLoaded ? 1 : 0,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              }} 
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                setImgLoaded(false);
                const target = e.currentTarget;
                target.style.visibility = 'hidden';
                setTimeout(() => {
                  target.src = '/miku_images/miku-happy.png';
                  target.style.visibility = 'visible';
                }, 500);
              }}
            />
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
