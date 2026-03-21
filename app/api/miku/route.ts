import { NextRequest, NextResponse } from 'next/server';

// POST /api/miku
// Body: { system: string; user: string }
// Returns: { emotion: string; message: string }
export async function POST(req: NextRequest) {
  const NVIDIA_KEY =
    process.env.NVIDIA_KEY ||           // server-only (preferred)
    process.env.NEXT_PUBLIC_NVIDIA_KEY; // fallback to public key

  if (!NVIDIA_KEY) {
    return NextResponse.json(
      { error: 'NVIDIA_KEY not configured' },
      { status: 500 }
    );
  }

  let body: { system: string; user: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { system, user } = body;
  if (!system || !user) {
    return NextResponse.json({ error: 'Missing system or user field' }, { status: 400 });
  }

  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${NVIDIA_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.3-70b-instruct',
        temperature: 0.97,
        top_p: 0.95,
        max_tokens: 45,
        presence_penalty: 0.9,
        frequency_penalty: 0.8,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: user   },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[Miku API route] NVIDIA error:', res.status, text);
      return NextResponse.json(
        { error: `NVIDIA API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content?.trim() ?? '';

    console.log('[Miku API route] raw response:', JSON.stringify(raw));

    // --- Parse Response (Fix 1) ---
    const lines = raw.trim().split('\n');
    
    // Get emotion + message (everything before OPTIONS:)
    const optionsLineIndex = lines.findIndex(l => l.toUpperCase().startsWith('OPTIONS:'));
    
    const messagePart = optionsLineIndex > -1
      ? lines.slice(0, optionsLineIndex).join(' ').trim()
      : raw;
    
    // Parse emotion
    const match      = messagePart.match(/^\[(\w+)\]/i);
    const rawEmotion = match?.[1]?.toLowerCase() ?? 'happy';
    const EMOTION_MAP: Record<string, string> = {
      happy: 'happy', sad: 'sad', angry: 'angry',
      excited: 'excited', love: 'love', thinking: 'thinking', blush: 'blush',
    };
    const emotion = EMOTION_MAP[rawEmotion] ?? 'happy';
    
    // Truncate in code as backup (LEVEL 2)
    const truncateMessage = (text: string): string => {
      const words = text.split(' ');
      if(words.length <= 18) return text;
      const cut = words.slice(0, 18).join(' ');
      const lastSpace = cut.lastIndexOf(' ');
      return (lastSpace > 0 ? cut.substring(0, lastSpace) : cut) + '...';
    };

    const message = truncateMessage(
      messagePart.replace(/^\[\w+\]\s*\n?/i, '').trim()
    );
    
    // Parse options
    let options = ['😊 Haan', '😅 Nahi', '🤔 Pata nahi'];
    if(optionsLineIndex > -1) {
      const optLine = lines[optionsLineIndex]
        .replace(/OPTIONS:/i, '').trim();
      const parsed = optLine
        .match(/\[([^\]]+)\]/g)
        ?.map(o => o.replace(/[\[\]]/g, '').trim());
      if(parsed && parsed.length >= 1) {
        options = parsed.slice(0, 3);
      }
    }

    return NextResponse.json({ emotion, message, options });
  } catch (err) {
    console.error('[Miku API route] fetch error:', err);
    return NextResponse.json({ error: 'Failed to reach NVIDIA API' }, { status: 502 });
  }
}
