// POST /api/talk — audio in, transcript + spoken-style reply out.
// 1) ElevenLabs Scribe turns the recording into text.
// 2) Claude writes a short reply.
import Anthropic from '@anthropic-ai/sdk';

import { SYSTEM_PROMPT } from '@/server/prompt';

const client = new Anthropic();

type Turn = { role: 'user' | 'assistant'; content: string };

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

    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      output_config: { effort: 'low' }, // fast, conversational replies
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ...(context ? [{ type: 'text' as const, text: context }] : []),
      ],
      messages: [...history.slice(-12), { role: 'user', content: transcript }],
    });

    const text = response.content
      .flatMap((b) => (b.type === 'text' ? [b.text] : []))
      .join(' ')
      .trim();
    const reply =
      response.stop_reason === 'refusal' || !text
        ? "I'm not able to help with that one. You can call 2 1 1 any time and a real person will help."
        : text;

    return Response.json({ transcript, reply });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'Busy right now, try again in a moment.' }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error', error.status, error.message);
      return Response.json({ error: 'AI error' }, { status: 502 });
    }
    console.error(error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
