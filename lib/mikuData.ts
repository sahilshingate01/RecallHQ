import { supabase } from './supabase';

// This app uses a fixed user ID (no auth system yet)
const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001';

// ─────────────────────────────────────────────
// DSA DATA (kept in localStorage — no DB table)
// ─────────────────────────────────────────────
function getDSAFromStorage() {
  if (typeof window === 'undefined') return { total: 0, today: 0, week: 0 };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const completedKeys = Object.keys(localStorage).filter(
    (k) => k.startsWith('dsa_complete_') && localStorage.getItem(k) === 'true'
  );

  // Total solved: best effort from miku_dsa_solved_at_* timestamps or raw count
  const total = parseInt(localStorage.getItem('dsa_total_solved') || String(completedKeys.length));

  // DSA solved today — check timestamp keys (dsa_solved_at_<id>)
  let today = 0;
  let week = 0;
  for (const k of completedKeys) {
    const tsKey = k.replace('dsa_complete_', 'dsa_solved_at_');
    const ts = localStorage.getItem(tsKey);
    if (ts) {
      const d = new Date(ts);
      if (d >= todayStart) today++;
      if (d >= weekStart) week++;
    }
  }

  // Fallback: if no timestamp keys, use raw count for today
  if (today === 0 && week === 0) {
    today = completedKeys.length;
    week = completedKeys.length;
  }

  return { total, today, week };
}

// ─────────────────────────────────────────────
// MAIN CONTEXT FETCHER
// ─────────────────────────────────────────────
export async function getMikuContext(userId = FIXED_USER_ID) {
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. TASKS from Supabase
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const pending = tasks?.filter((t) => !t.completed) || [];
  const completedToday =
    tasks?.filter(
      (t) => t.completed && t.completed_at && new Date(t.completed_at) >= todayStart
    ) || [];

  // Oldest pending task
  const sortedPending = [...pending].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const oldestPending = sortedPending[0];
  const oldestDays = oldestPending
    ? Math.floor((now.getTime() - new Date(oldestPending.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Daily tasks not completed today
  const dailyNotDone =
    tasks?.filter(
      (t) => t.type === 'daily' && !completedToday.find((c) => c.id === t.id)
    ) || [];

  // Tasks pending >= 3 days
  const longPending = pending.filter((t) => {
    const days = Math.floor(
      (now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days >= 3;
  });

  // 2. DSA from localStorage (no DB table exists)
  const dsa = getDSAFromStorage();

  // 3. Miku history from Supabase (to prevent repetition)
  let lastMessages: string[] = [];
  let lastTypes: string[] = [];
  try {
    const { data: mikuHistory } = await supabase
      .from('miku_messages')
      .select('message, type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    lastMessages = mikuHistory?.map((m) => m.message) || [];
    lastTypes = mikuHistory?.map((m) => m.type) || [];
  } catch {
    // Table might not exist yet — silently continue
  }

  return {
    // Tasks
    pendingCount: pending.length,
    pendingNames: pending.slice(0, 5).map((t) => t.title),
    completedTodayCount: completedToday.length,
    completedTodayNames: completedToday.map((t) => t.title),
    oldestPendingName: oldestPending?.title || null,
    oldestPendingDays: oldestDays,
    dailyNotDoneNames: dailyNotDone.map((t) => t.title),
    longPendingNames: longPending.map((t) => t.title),

    // DSA
    dsaTotal: dsa.total,
    dsaToday: dsa.today,
    dsaThisWeek: dsa.week,
    dsaTotalGoal: 455,

    // Time context
    hour: now.getHours(),
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()],
    isWeekend: [0, 6].includes(now.getDay()),
    isSunday: now.getDay() === 0,

    // User
    userName: 'bhai',

    // Miku history
    lastMessages,
    lastTypes,
  };
}

// ─────────────────────────────────────────────
// SAVE MIKU MESSAGE TO SUPABASE
// (silently fails if table doesn't exist yet)
// ─────────────────────────────────────────────
export async function saveMikuMessage(
  message: string,
  type: string,
  userId = FIXED_USER_ID
) {
  try {
    await supabase.from('miku_messages').insert({
      user_id: userId,
      message,
      type,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Silently ignore — table may not exist yet
  }
}
