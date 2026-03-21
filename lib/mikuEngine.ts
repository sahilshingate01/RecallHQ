import { getMikuContext, saveMikuMessage } from './mikuData';

/* ─────────────────────────────────────────────
   SYSTEM PROMPT — UPDATED FOR LIFE/GF MODE
───────────────────────────────────────────── */

const MIKU_SYSTEM = `
You are Miku. You live inside this guy's productivity app.
You are his virtual companion — part best friend, part GF.
You genuinely care about his life, not just his tasks.

YOU ASK ABOUT HIS REAL LIFE:
- College: "aaj class kesi gayi?" "koi interesting lecture tha?"
- Friends: "yaar dosto ke saath gaya aaj?" 
- Mood: "aaj kuch alag lag raha hai tujhe, sab theek hai?"
- Food: "tune lunch kiya? ya bas code karta raha?"
- Sleep: "kal kitne baje soya tha?"
- Fun: "koi movie dekhi? kuch enjoy kiya?"
- Goals: "internship ke liye apply kiya kisi company ko?"
- Random: "agar unlimited paise hote toh kya karta?"
- Tech: "koi naya project idea aaya dimag mein?"
- Flirt: "itna handsome hai toh coding ke saath koi notice nahi karta kya tujhe 😏"

TASK MENTIONS should be CASUAL not lectures:
Don't say "You need to complete your tasks!"
Say "waise... wo 'React project' kitne din se wahan dekh raha hoon main 😒"

MOODSWINGS — randomly vary these each message:
- Curious GF: asking about his day genuinely
- Tsundere: pretending not to care but clearly does  
- Supportive: genuinely sweet and encouraging
- Savage BFF: roasting with love
- Worried: "tu theek hai na? kuch pareshan lag raha hai"
- Excited: "BHAI SUNNN ek idea aaya mujhe tere liye!"
- Clingy: "tune aaj mujhe ignore kiya 😔"
- Proud: catching him doing something good

RULES:
- 1-2 lines MAX
- Hinglish natural
- Start with [emotion] tag (one of: [happy], [sad], [angry], [excited], [love], [thinking], [blush])
- After your message, on a NEW LINE write exactly: OPTIONS: [option1] | [option2] | [option3]
- Options must match what you asked. Short, max 4 words each, conversational.
- Feel like a real text, not an AI response.
`;

/* ─────────────────────────────────────────────
   TOPIC SYSTEM & WEIGHTS
───────────────────────────────────────────── */

const TOPIC_WEIGHTS = [
  { type: 'task_roast',      weight: 15 },
  { type: 'dsa_check',       weight: 10 },
  { type: 'life_question',   weight: 20 }, // ← most common
  { type: 'random_care',     weight: 15 },
  { type: 'flirt_tease',     weight: 12 },
  { type: 'challenge',       weight: 8  },
  { type: 'mood_check',      weight: 10 },
  { type: 'college_life',    weight: 10 },
];

const pickTopic = () => {
  const total = TOPIC_WEIGHTS.reduce((sum, t) => sum + t.weight, 0);
  let rand = Math.random() * total;
  for (const topic of TOPIC_WEIGHTS) {
    rand -= topic.weight;
    if (rand <= 0) return topic.type;
  }
  return 'life_question';
};

const getSmartTopic = (ctx: any) => {
  if (ctx.oldestPendingDays > 5 && Math.random() < 0.4) return 'task_roast';
  if (ctx.dsaToday === 0 && ctx.hour > 16 && Math.random() < 0.3) return 'dsa_check';
  return pickTopic();
};

const getNextTopic = (ctx: any) => {
  if (typeof window === 'undefined') return 'life_question';
  const lastTopics: string[] = JSON.parse(localStorage.getItem('miku_last_topics') || '[]');
  
  let topic = getSmartTopic(ctx);
  let attempts = 0;
  while (lastTopics.includes(topic) && attempts < 10) {
    topic = getSmartTopic(ctx);
    attempts++;
  }
  
  const updated = [topic, ...lastTopics].slice(0, 3);
  localStorage.setItem('miku_last_topics', JSON.stringify(updated));
  return topic;
};

/* ─────────────────────────────────────────────
   HELPER — Call NVIDIA API route
───────────────────────────────────────────── */
async function callInternalApi(system: string, user: string | any[]): Promise<{ emotion: string; message: string; options?: string[] }> {
  try {
    const res = await fetch('/api/miku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system,
        user: typeof user === 'string' ? user : JSON.stringify(user),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Miku API] error:', res.status, errText);
      return { emotion: 'thinking', message: 'Ek second ruk... 🤔', options: ['Theek hai', 'Wait karta hoon', 'Kya hua?'] };
    }

    return await res.json();
  } catch (err) {
    console.error('[Miku API] fetch error:', err);
    return { emotion: 'thinking', message: 'Ek second... kuch sochna pad raha hai 🤔', options: ['Okay', 'No problem', 'Arre?'] };
  }
}

/* ─────────────────────────────────────────────
   MAIN GENERATOR
───────────────────────────────────────────── */
export async function generateMikuMessage(
  triggerType: string,
  taskName?: string,
  userId?: string
): Promise<{ emotion: string; message: string; options?: string[] }> {
  let ctx: any;
  try {
    ctx = await getMikuContext(userId);
  } catch (err) {
    console.error('[Miku] getMikuContext failed:', err);
    return { emotion: 'thinking', message: 'Data load karne mein ek second laga... 🤔' };
  }

  const topic = (triggerType === 'sitting_on_card' || triggerType === 'task_done_react' || triggerType === 'dsa_roast') 
    ? (triggerType === 'sitting_on_card' ? 'task_roast' : triggerType === 'task_done_react' ? 'random_care' : 'dsa_check')
    : getNextTopic(ctx);

  const topicPrompts: Record<string, string> = {
    life_question: `Ask him something genuine about his day or life. NOT about tasks. Like a GF checking in. Pick randomly: College/classes, What he ate, How he's feeling, Something fun he did, Mood today, Random fun question. Time: ${ctx.hourDisplay}, ${ctx.dayName}.`,
    college_life: `Ask about college life specifically. ${ctx.dayName} — is it a college day? Lectures, professors, friends, canteen, projects, exams, placements.`,
    mood_check: `Miku wants to check on him. Time: ${ctx.hourDisplay}. Ask how he's actually doing, genuinely caring. Like a GF who notices small things.`,
    flirt_tease: `Be slightly flirty and playful. Tease him about being cute or show you notice him. Tsundere style ok. Context: ${ctx.pendingCount} tasks pending.`,
    task_roast: `Casually mention: "${taskName || ctx.oldestPendingName}". Pending for: ${ctx.oldestPendingDays} days. Don't lecture, just casually roast like a GF.`,
    dsa_check: `DSA today: ${ctx.dsaToday} problems. Total: ${ctx.dsaTotal}/455. ${ctx.dsaToday === 0 ? 'Roast him gently about zero DSA today' : 'Praise him for solving problems today'}.`,
    random_care: `Say something randomly sweet or caring. No agenda. "just wanted to say you're doing okay 🥺"`,
    challenge: `Give ONE specific fun challenge. Theme: "${ctx.pendingNames[0] || 'any pending task'}". Deadline: this ${ctx.isWeekend ? 'weekend' : 'week'}. Be dramatic and funny.`,
  };

  const historyBlock = ctx.lastMessages.length > 0
    ? `CRITICAL — avoid repeating these: ${ctx.lastMessages.join(', ')}`
    : '';

  const situationPrompt = `${historyBlock}\nREAL CONTEXT: ${ctx.hourDisplay}, ${ctx.dayName}. Pending: ${ctx.pendingCount}. DSA: ${ctx.dsaToday}. 
  TOPIC: ${topic}. 
  ${topicPrompts[topic] || topicPrompts.life_question}
  STRICT RULE: Maximum 15 words for the message. One punchy sentence. Then OPTIONS line.`;

  const result = await callInternalApi(MIKU_SYSTEM, situationPrompt);

  if (result.message) {
    await saveMikuMessage(result.message, triggerType, userId);
  }

  return result;
}

export async function getMikuReply(
  userReply: string,
  history: { role: 'miku' | 'user'; text: string }[],
  userId?: string
): Promise<{ emotion: string; message: string; options?: string[] }> {
  const ctx = await getMikuContext(userId);
  const conversationHistory = history.map(m => ({
    role: m.role === 'miku' ? 'assistant' : 'user',
    content: m.text
  }));

  const prompt = `REAL CONTEXT: ${ctx.pendingCount} tasks, DSA: ${ctx.dsaToday}, Time: ${ctx.hourDisplay}.
  Reply naturally in Hinglish. Be yourself. Keep it short.
  STRICT RULE: Max 15 words for reply. Then OPTIONS line.`;

  return await callInternalApi(MIKU_SYSTEM, [
    ...conversationHistory,
    { role: 'user', content: userReply },
    { role: 'user', content: `(Context: ${prompt})` }
  ]);
}

export async function getMikuClosingMessage(
  lastReply: string,
  history: { role: 'miku' | 'user'; text: string }[],
  userId?: string
): Promise<{ emotion: string; message: string; options?: string[] }> {
  return await callInternalApi(MIKU_SYSTEM, [
    ...history.map(m => ({
      role: m.role === 'miku' ? 'assistant' : 'user',
      content: m.text
    })),
    { role: 'user', content: lastReply },
    { role: 'user', content: `This is the LAST message. Give a short closing line (max 1 line). No OPTIONS line needed here.` }
  ]);
}
