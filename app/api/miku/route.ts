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
        max_tokens: 80,
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

    // Parse [emotion] tag
    const EMOTION_MAP: Record<string, string> = {
      happy: 'happy', sad: 'sad', angry: 'angry',
      excited: 'excited', love: 'love', thinking: 'thinking', blush: 'blush',
    };
    const match      = raw.match(/^\[(\w+)\]/i);
    const rawEmotion = match?.[1]?.toLowerCase() ?? 'happy';
    const emotion    = EMOTION_MAP[rawEmotion] ?? 'happy';
    const message    = raw.replace(/^\[\w+\]\s*\n?/i, '').trim();

    return NextResponse.json({ emotion, message });
  } catch (err) {
    console.error('[Miku API route] fetch error:', err);
    return NextResponse.json({ error: 'Failed to reach NVIDIA API' }, { status: 502 });
  }
}
