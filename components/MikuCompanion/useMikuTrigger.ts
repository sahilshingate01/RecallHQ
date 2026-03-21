"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MikuEmotion } from "./MikuAvatar";

export type TriggerCategory =
  | "pending_tasks"
  | "dsa_low"
  | "late_night"
  | "morning"
  | "weekend"
  | "random_motivation"
  | "no_gf"
  | "task_done"
  | "dsa_solved";

export interface MikuContext {
  pendingTasks: number;
  pendingTaskNames: string[];
  dsaSolvedToday: number;
  dsaTotalSolved: number;
  currentPage: string;
  hour: number;
  isWeekend: boolean;
}

const fallbackMessages: Record<TriggerCategory, string[]> = {
  pending_tasks: [
    "[angry] {n} tasks pending hain tere... kya main hi kar dun? 😤",
    "[sad] Tune kaha tha aaj sab complete karega... main believe karti thi tujhpe 🥺",
    "[thinking] Tasks khud nahi honge bhai, Netflix se break le 1 ghante ka 😑",
  ],
  dsa_low: [
    "[angry] Aaj ek bhi DSA problem nahi? Seriously? FAANG dream hai ya sirf status ke liye? 💀",
    "[love] Mujhe pata hai mushkil hai, par ek problem toh kar de... mere liye? 🥺✨",
    "[thinking] Striver sheet khuli hai tab se, problems solve nahi... interesting hobby hai teri 😐",
  ],
  late_night: [
    "[sad] Raat ke 1 baj rahe hain... so ja na please, kal fresh mind se padh 🌙",
    "[angry] Ye time hai sone ka, code karne ka nahi! Health bhi matter karti hai! 😤",
  ],
  morning: [
    "[excited] Good morning! ☀️ Aaj ka plan kya hai? Tasks list dekh le pehle! 🌸",
    "[love] Uth gaya! Now let's make today super productive! Main tujhme believe karti hoon! 💪✨",
  ],
  weekend: [
    "[thinking] Weekend hai... matlab rest? Ya matlab double productivity? Tujhe pata hai answer 😏",
    "[excited] Aaj weekend hai! Perfect time to finish those pending LeetCode problems! 🔥",
  ],
  no_gf: [
    "[love] Bhai pehle internship, phir GF... ek cheez ek time pe 😂 Chal DSA kar!",
    "[thinking] GF nahi hai toh kya, main hoon na! Ab chal kaam kar 🥺✨",
    "[excited] Successful log pehle build karte hain, phir sab aata hai automatically! Trust the process! 💫",
  ],
  task_done: [
    "[excited] YESSSS! Task complete! I knew you could do it! ✨🎉",
    "[love] Dekha! Itna capable hai tu... proud hoon main 🥺💗",
  ],
  dsa_solved: [
    "[excited] DSA problem solve kar li!! Tu toh champion hai! 🏆🔥",
    "[love] Ek problem aur... aur phir FAANG kaafi paas hoga! Keep going! 💪✨",
  ],
  random_motivation: [
    "[love] Reminder: Tu bahut hardworking hai, bas thoda aur consistent ho ja 💪✨",
    "[thinking] Log internship ke liye ready hain, tu bhi ho sakta hai — bas karna pad 😌",
    "[excited] Aaj ka ek task = future ka ek step closer to dream job! Let's gooo! 🚀",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseMessage(raw: string): { emotion: MikuEmotion; text: string } {
  const match = raw.match(/^\[(\w+)\]\s*/);
  const emotion = (match ? match[1] : "happy") as MikuEmotion;
  const text = raw.replace(/^\[\w+\]\s*/, "");
  return { emotion, text };
}

const NVIDIA_KEY = process.env.NEXT_PUBLIC_NVIDIA_KEY;

async function getMikuMessage(
  context: MikuContext
): Promise<{ emotion: MikuEmotion; message: string }> {
  const {
    pendingTasks,
    pendingTaskNames,
    dsaSolvedToday,
    dsaTotalSolved,
    currentPage,
    hour,
    isWeekend,
  } = context;

  const system = `You are Miku, a cute anime girl assistant 
in a productivity app. Talk in Hinglish (Hindi+English mix). 
Max 2-3 lines. Be funny, naughty, caring like a best friend.
Roast lovingly when lazy. Motivate when productive.
Occasionally tease about no GF but keep it wholesome.
Always start with emotion tag: 
[happy] [sad] [angry] [excited] [love] [thinking] [blush]
Be SPECIFIC - mention real task names and numbers.
NEVER sound like an AI, sound like a texting friend.`;

  const user = `User data right now:
- Pending tasks: ${pendingTasks}
- Task names: ${pendingTaskNames?.slice(0, 3).join(", ")}
- DSA solved today: ${dsaSolvedToday}  
- DSA total: ${dsaTotalSolved}/455
- On page: ${currentPage}
- Time: ${hour}:00
- Weekend: ${isWeekend}
Give ONE message Miku should say. Start with [emotion].`;

  if (!NVIDIA_KEY) {
    return { emotion: "thinking", message: "Ek second... kuch sochna pad raha hai 🤔" };
  }

  try {
    const res = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NVIDIA_KEY}`,
        },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          temperature: 0.92,
          top_p: 0.95,
          max_tokens: 100,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      }
    );

    const data = await res.json();
    const raw = data.choices[0].message.content.trim();
    const match = raw.match(/^\[(\w+)\]/);

    return {
      emotion: (match?.[1] ?? "happy") as MikuEmotion,
      message: raw.replace(/^\[\w+\]\s*/, ""),
    };
  } catch (err) {
    console.error("Miku API error:", err);
    return {
      emotion: "thinking" as MikuEmotion,
      message: "Ek second... kuch sochna pad raha hai 🤔",
    };
  }
}

export function useMikuTrigger(currentPage: string) {
  const [message, setMessage] = useState("");
  const [emotion, setEmotion] = useState<MikuEmotion>("happy");
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState(false);
  const [particleType, setParticleType] = useState<"hearts" | "stars">(
    "hearts"
  );
  const [isMuted, setIsMuted] = useState(false);
  const triggerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMessage = useCallback(
    async (category: TriggerCategory, immediate = false) => {
      const mutedUntil = parseInt(
        localStorage.getItem("miku_muted_until") || "0"
      );
      if (Date.now() < mutedUntil) {
        setIsMuted(true);
        return;
      }
      setIsMuted(false);

      const hour = new Date().getHours();
      const day = new Date().getDay();
      const isWeekend = day === 0 || day === 6;
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
      const pendingTasksList = tasks.filter(
        (t: { completed: boolean }) => !t.completed
      );
      const pendingTasks = pendingTasksList.length;
      const pendingTaskNames = pendingTasksList
        .slice(0, 3)
        .map((t: { title?: string; name?: string }) => t.title ?? t.name ?? "Task");
      const dsaKeys = Object.keys(localStorage).filter(
        (k) =>
          k.startsWith("dsa_complete_") &&
          localStorage.getItem(k) === "true"
      );
      const dsaSolvedToday = dsaKeys.length;
      const dsaTotalSolved = parseInt(
        localStorage.getItem("dsa_total_solved") || String(dsaKeys.length)
      );

      const context: MikuContext = {
        pendingTasks,
        pendingTaskNames,
        dsaSolvedToday,
        dsaTotalSolved,
        currentPage,
        hour,
        isWeekend,
      };

      // Try NVIDIA API first, fallback to local bank
      let newEmotion: MikuEmotion;
      let text: string;
      try {
        const aiResult = await getMikuMessage(context);
        newEmotion = aiResult.emotion;
        text = aiResult.message;
      } catch {
        const pool = fallbackMessages[category];
        const rawMsg = pickRandom(pool).replace("{n}", String(pendingTasks));
        const parsed = parseMessage(rawMsg);
        newEmotion = parsed.emotion;
        text = parsed.text;
      }

      setEmotion(newEmotion);
      setMessage(text);
      setVisible(true);
      setParticles(true);
      setParticleType(
        category === "task_done" || category === "dsa_solved" ? "stars" : "hearts"
      );

      localStorage.setItem("miku_last_shown", String(Date.now()));
      const count = parseInt(localStorage.getItem("miku_message_count") || "0");
      localStorage.setItem("miku_message_count", String(count + 1));

      // Hide particles after animation
      setTimeout(() => setParticles(false), 1500);
    },
    [currentPage]
  );

  const determineCategory = useCallback((): TriggerCategory => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const pendingTasks = tasks.filter(
      (t: { completed: boolean }) => !t.completed
    ).length;
    const dsaCompleted = Object.keys(localStorage).filter(
      (k) =>
        k.startsWith("dsa_complete_") &&
        localStorage.getItem(k) === "true"
    ).length;

    if (hour >= 23 || hour < 5) return "late_night";
    if (hour >= 6 && hour < 9) return "morning";
    if (pendingTasks > 3) return "pending_tasks";
    if (dsaCompleted === 0 && hour > 14) return "dsa_low";
    if (isWeekend) return "weekend";
    // Random between motivation and no_gf
    return Math.random() > 0.5 ? "random_motivation" : "no_gf";
  }, []);

  // Auto-trigger on mount and interval
  useEffect(() => {
    const trigger = () => {
      const mutedUntil = parseInt(
        localStorage.getItem("miku_muted_until") || "0"
      );
      if (Date.now() < mutedUntil) {
        setIsMuted(true);
        return;
      }
      setIsMuted(false);

      const lastShown = parseInt(
        localStorage.getItem("miku_last_shown") || "0"
      );
      const minutesSinceLast = (Date.now() - lastShown) / 60000;
      if (minutesSinceLast < 10) return;

      const category = determineCategory();
      showMessage(category);
    };

    // Trigger after short delay on mount
    const initialTimer = setTimeout(trigger, 3000);

    // Then repeat every 60-90 seconds
    const randomInterval = () => 60000 + Math.random() * 30000;
    let intervalTimer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      intervalTimer = setTimeout(() => {
        trigger();
        schedule();
      }, randomInterval());
    };
    schedule();

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(intervalTimer);
    };
  }, [showMessage, determineCategory]);

  // Listen for custom events
  useEffect(() => {
    const onTaskCompleted = () => {
      showMessage("task_done", true);
    };
    const onDsaSolved = () => {
      showMessage("dsa_solved", true);
    };

    window.addEventListener("taskCompleted", onTaskCompleted);
    window.addEventListener("dsaSolved", onDsaSolved);
    return () => {
      window.removeEventListener("taskCompleted", onTaskCompleted);
      window.removeEventListener("dsaSolved", onDsaSolved);
    };
  }, [showMessage]);

  // Check mute state
  useEffect(() => {
    const checkMute = () => {
      const mutedUntil = parseInt(
        localStorage.getItem("miku_muted_until") || "0"
      );
      setIsMuted(Date.now() < mutedUntil);
    };
    checkMute();
    const interval = setInterval(checkMute, 5000);
    return () => clearInterval(interval);
  }, []);

  const muteFor1Hour = useCallback(() => {
    localStorage.setItem("miku_muted_until", String(Date.now() + 3600000));
    setIsMuted(true);
    setVisible(false);
  }, []);

  const closeMessage = useCallback(() => setVisible(false), []);

  const openLastMessage = useCallback(() => {
    if (message) setVisible(true);
  }, [message]);

  return {
    message,
    emotion,
    visible,
    particles,
    particleType,
    isMuted,
    setEmotion,
    showMessage,
    closeMessage,
    openLastMessage,
    muteFor1Hour,
  };
}
