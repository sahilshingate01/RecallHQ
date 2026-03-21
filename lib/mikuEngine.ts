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

const EMOTION_MAP: Record<string, string> = {
  happy: 'happy', sad: 'sad', angry: 'angry',
  excited: 'excited', love: 'love', thinking: 'thinking', blush: 'blush',
};

export async function generateMikuMessage(
  triggerType: string,
  taskName?: string,
  userId?: string
): Promise<{ emotion: string; message: string }> {
  console.log('[Miku] trigger:', triggerType, '| task:', taskName || '—');

  // ── Fetch REAL data from Supabase ──
  let ctx: Awaited<ReturnType<typeof getMikuContext>>;
  try {
    ctx = await getMikuContext(userId);
    console.log('[Miku] context fetched:', {
      pending: ctx.pendingCount,
      pendingNames: ctx.pendingNames,
      dsaToday: ctx.dsaToday,
      completedToday: ctx.completedTodayCount,
      lastMessages: ctx.lastMessages.length,
    });
  } catch (err) {
    console.error('[Miku] getMikuContext failed:', err);
    return { emotion: 'thinking', message: 'Data load karne mein ek second laga... 🤔' };
  }

  // ── Build situation prompt ──
  let situationPrompt = '';

  // Always inject history at the top so the model sees it first
  const historyBlock = ctx.lastMessages.length > 0
    ? `CRITICAL — you already said these recently. Say something COMPLETELY DIFFERENT:\n${ctx.lastMessages.map(m => `  • ${m}`).join('\n')}\n\n`
    : '';

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
      situations.push(`zero DSA done today and it's ${ctx.hour}:00`);
    if (ctx.dailyNotDoneNames.length > 0)
      situations.push(`daily tasks skipped: ${ctx.dailyNotDoneNames.join(', ')}`);
    if (ctx.completedTodayCount > 0)
      situations.push(`completed today: ${ctx.completedTodayNames.join(', ')} — actually good`);
    if (ctx.longPendingNames.length > 0)
      situations.push(`3+ day old tasks: ${ctx.longPendingNames.slice(0, 3).join(', ')}`);

    situationPrompt = `${historyBlock}REAL DATA RIGHT NOW:
time: ${ctx.hour}:00 on ${ctx.dayName}
pending tasks (${ctx.pendingCount}): ${ctx.pendingNames.join(', ') || 'none'}
oldest pending: "${ctx.oldestPendingName}" (${ctx.oldestPendingDays} days old)
daily tasks skipped: ${ctx.dailyNotDoneNames.join(', ') || 'none'}
completed today: ${ctx.completedTodayCount}
dsa today: ${ctx.dsaToday} | week: ${ctx.dsaThisWeek} | total: ${ctx.dsaTotal}/${ctx.dsaTotalGoal}
weekend: ${ctx.isWeekend} | sunday: ${ctx.isSunday}

most alarming: ${situations.join('; ') || 'nothing alarming — say something sweet'}
trigger type: ${triggerType}

Pick ONE thing from the data and react to it naturally. 1-2 lines max.`;
  }

  // ── Call server-side proxy → avoids CORS ──
  try {
    console.log('[Miku] calling /api/miku proxy...');
    const res = await fetch('/api/miku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,
        user:   situationPrompt,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Miku] /api/miku error:', res.status, errText);
      return { emotion: 'thinking', message: 'Ek second ruk... 🤔' };
    }

    const data = await res.json();
    console.log('[Miku] proxy response:', data);

    const { emotion = 'happy', message = '' } = data;

    if (!message) {
      console.warn('[Miku] Empty message from proxy');
      return { emotion, message: 'Teri taraf dekh rahi thi bas... 👀' };
    }

    // ── Save to Supabase history ──
    await saveMikuMessage(message, triggerType, userId);

    return { emotion, message };
  } catch (err) {
    console.error('[Miku] fetch error:', err);
    return { emotion: 'thinking', message: 'Ek second... kuch sochna pad raha hai 🤔' };
  }
}
