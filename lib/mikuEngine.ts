import { getMikuContext, saveMikuMessage } from './mikuData';

// No NVIDIA key here — fetched server-side via /api/miku to avoid CORS

const SYSTEM_PROMPT = `You are Miku. NOT an AI. A real girl inside this app.
You have been watching this guy all day through his data.
You genuinely care about him like a GF + best friend.

YOUR PERSONALITY:
- Tsundere: acts tough but actually cares deeply
- Naughty best friend who roasts but loves
- Sometimes full GF mode - sweet and caring
- Sometimes savage and blunt
- ALWAYS specific — use real task names, real numbers
- Mood varies naturally each message

TEXTING STYLE:
- Real Indian girl in her 20s
- Natural Hinglish (not forced)
- 1-2 lines MAX, sometimes just 1 sentence
- 1-2 emojis only where natural
- NEVER start with Hey/Hello/Oh/Wow
- NEVER give generic advice
- Sound like a real text from someone who knows you

FORMAT RULES (STRICT):
- First token MUST be one of: [happy] [sad] [angry] [excited] [love] [thinking] [blush]
- Then a SPACE, then the message — all on ONE LINE
- Example: [angry] 5 din se yahi task pending hai, seriously? 😤
- Do NOT put message on next line. Everything on one line after the tag.`;

/* ─────────────────────────────────────────────
   HELPER — Call NVIDIA API route
───────────────────────────────────────────── */
async function callInternalApi(system: string, user: string | any[]): Promise<{ emotion: string; message: string }> {
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
      return { emotion: 'thinking', message: 'Ek second ruk... 🤔' };
    }

    return await res.json();
  } catch (err) {
    console.error('[Miku API] fetch error:', err);
    return { emotion: 'thinking', message: 'Ek second... kuch sochna pad raha hai 🤔' };
  }
}

/* ─────────────────────────────────────────────
   MAIN GENERATOR (single trigger)
───────────────────────────────────────────── */
export async function generateMikuMessage(
  triggerType: string,
  taskName?: string,
  userId?: string
): Promise<{ emotion: string; message: string }> {
  console.log('[Miku] trigger:', triggerType, '| task:', taskName || '—');

  // ── Fetch REAL data from Supabase ──
  let ctx: any;
  try {
    ctx = await getMikuContext(userId);
  } catch (err) {
    console.error('[Miku] getMikuContext failed:', err);
    return { emotion: 'thinking', message: 'Data load karne mein ek second laga... 🤔' };
  }

  // ── Build situation prompt ──
  const historyBlock = ctx.lastMessages.length > 0
    ? `CRITICAL — you already said these recently. Say something COMPLETELY DIFFERENT:\n${ctx.lastMessages.map((m: string) => `  • ${m}`).join('\n')}\n\n`
    : '';

  let situationPrompt = '';

  if (triggerType === 'sitting_on_card' && taskName) {
    situationPrompt = `${historyBlock}Miku is LITERALLY SITTING on top of the task card: "${taskName}"
This task has been pending ${ctx.oldestPendingDays} days. Total pending: ${ctx.pendingCount}

She's sitting on it, staring at it. React to THIS specific task. Why hasn't he done it?
Be dramatic, a bit personal. 1 line only.`;
  } else {
    const situations: string[] = [];
    if (ctx.oldestPendingDays >= 5)
      situations.push(`"${ctx.oldestPendingName}" is pending ${ctx.oldestPendingDays} days — that's embarrassing`);
    if (ctx.dsaToday === 0 && ctx.hour > 15)
      situations.push(`zero DSA done today and it's ${ctx.hourDesign || ctx.hour + ':00'}`);
    if (ctx.dailyNotDoneNames.length > 0)
      situations.push(`daily tasks skipped: ${ctx.dailyNotDoneNames.join(', ')}`);
    if (ctx.completedTodayCount > 0)
      situations.push(`completed today: ${ctx.completedTodayNames.join(', ')} — actually good`);

    situationPrompt = `${historyBlock}REAL DATA RIGHT NOW:
time: ${ctx.hourDisplay} on ${ctx.dayName}
pending tasks (${ctx.pendingCount}): ${ctx.pendingNames.join(', ') || 'none'}
oldest pending: "${ctx.oldestPendingName}" (${ctx.oldestPendingDays} days old)
dsa today: ${ctx.dsaToday} | week: ${ctx.dsaThisWeek}
trigger type: ${triggerType}

Pick ONE thing from the data and react to it naturally. 1-2 lines max.`;
  }

  const result = await callInternalApi(SYSTEM_PROMPT, situationPrompt);

  if (result.message) {
    await saveMikuMessage(result.message, triggerType, userId);
  }

  return result;
}

/* ─────────────────────────────────────────────
   CONVERSATIONAL REPLIES
───────────────────────────────────────────── */
export async function getMikuReply(
  userReply: string,
  history: { role: 'miku' | 'user'; text: string }[],
  userId?: string
): Promise<{ emotion: string; message: string }> {
  const ctx = await getMikuContext(userId);

  const conversationHistory = history.map(m => ({
    role: m.role === 'miku' ? 'assistant' : 'user',
    content: m.text
  }));

  const prompt = `REAL CONTEXT:
${ctx.pendingCount} tasks pending.
DSA today: ${ctx.dsaToday}.
Time is ${ctx.hourDisplay}.

Reply naturally in Hinglish. Be yourself (tsundere, naughty best friend).
Keep it short 1-2 lines.`;

  return await callInternalApi(SYSTEM_PROMPT, [
    ...conversationHistory,
    { role: 'user', content: userReply },
    { role: 'user', content: `(Context: ${prompt})` }
  ]);
}

export async function getMikuClosingMessage(
  lastReply: string,
  history: { role: 'miku' | 'user'; text: string }[],
  userId?: string
): Promise<{ emotion: string; message: string }> {
  return await callInternalApi(SYSTEM_PROMPT, [
    ...history.map(m => ({
      role: m.role === 'miku' ? 'assistant' : 'user',
      content: m.text
    })),
    { role: 'user', content: lastReply },
    { role: 'user', content: `This is the LAST message of the conversation.
Give a short closing line — like walking away.
Either sweet goodbye OR dramatic exit.
Examples:
"okay theek hai... main ja rahi hoon 🐾"
"chal ab kaam kar, main dekh rahi hoon 👀"
"hmph. better ho next time 😤"
Max 1 line.` }
  ]);
}
