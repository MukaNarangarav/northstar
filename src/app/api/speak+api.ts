// GET /api/speak?text=... — streams natural-sounding speech (mp3) from ElevenLabs.
// Streaming means the phone starts playing before the whole clip is made.
export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get('text')?.slice(0, 1000);
  if (!text) return new Response('Missing text', { status: 400 });

  const voice = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5', // ElevenLabs' low-latency model
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
      }),
    },
  );

  if (!upstream.ok || !upstream.body) {
    console.error('TTS failed', upstream.status, await upstream.text());
    return new Response('Speech failed', { status: 502 });
  }

  return new Response(upstream.body, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  });
}
