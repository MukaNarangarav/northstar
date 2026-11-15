// POST /api/talk — audio in, transcript + spoken-style reply out.
// 1) ElevenLabs Scribe turns the recording into text.
// 2) Groq (free, very fast) writes a short reply.
import { SYSTEM_PROMPT } from '@/server/prompt';

type Turn = { role: 'user' | 'assistant'; content: string };

const FALLBACK_REPLY =
  "I'm not able to help with that one. You can call 2 1 1 any time and a real person will help.";

async function transcribe(audio: Blob): Promise<string> {
  const form = new FormData();
  form.append('model_id', 'scribe_v2');
  form.append('file', audio, 'speech.m4a');
  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' },
    body: form,
  });
  if (!res.ok) throw new Error(`Transcription failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { text?: string };
  return (data.text ?? '').trim();
}

async function think(history: Turn[], transcript: string, context: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      max_completion_tokens: 300, // spoken replies are 1-3 sentences
      temperature: 0.6,
      messages: [
        { role: 'system', content: context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT },
        ...history.slice(-12),
        { role: 'user', content: transcript },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || FALLBACK_REPLY;
}

export async function POST(request: Request) {
  try {
    // Cast: the project types FormData with React Native's version, which lacks .get().
    const form = (await request.formData()) as unknown as { get(name: string): unknown };
    const audio = form.get('audio');
    if (!(audio instanceof Blob)) return Response.json({ error: 'No audio' }, { status: 400 });

    const history = JSON.parse(String(form.get('history') ?? '[]')) as Turn[];
    const context = String(form.get('context') ?? '');

    const transcript = await transcribe(audio);
    if (!transcript) return Response.json({ transcript: '', reply: '' });

    const reply = await think(history, transcript, context);
    return Response.json({ transcript, reply });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
