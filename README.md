# NorthStar

A simple app for people experiencing homelessness in Columbus, Ohio. Talk to it, find help nearby, and follow a step-by-step plan to a place of your own.

## The 4 tabs

| Tab | What it does |
| --- | --- |
| **Talk** | Voice assistant. Tap, talk, it answers out loud. Stop button ends it anytime. |
| **Map** | Map on top, Find My-style arrow on the bottom pointing to the nearest shelter, food, warm place, water, restroom or clinic. Shows distance, walk time and a Directions button. |
| **Plan** | Step-by-step roadmap (built from a few yes/no questions) plus guides for SNAP, Medicaid and State ID. |
| **Help** | Tap-to-call crisis numbers and local resources. |

## Run it

```bash
npm install
cp .env.example .env    # then paste your own keys into .env
npx expo start
```

Open the **Expo Go** app on your phone and scan the QR code. If your wifi blocks it (school/work networks), use:

```bash
npm install --no-save @expo/ngrok@^4.1.0
npx expo start --tunnel ngrok
```

### Keys (only needed for the Talk tab, both free)

| Key | Get it at |
| --- | --- |
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `ELEVENLABS_API_KEY` | elevenlabs.io → Profile → API Keys |

Never commit `.env`. It's already in `.gitignore`.

## Where things are

| Path | What it is |
| --- | --- |
| `src/app/(tabs)/` | The 4 tabs (`index.tsx` is Talk) |
| `src/app/api/` | Server routes: `talk` (speech → text → AI reply), `speak` (voice), `places` (map search) |
| `src/server/prompt.ts` | The voice assistant's instructions |
| `src/components/Orb.tsx` | The animated copper orb |
| `src/app/step/[id].tsx`, `src/app/benefit/[id].tsx` | Plan step and benefit guide pages |
| `src/data/` | Content: steps, resources, benefits, map places |
| `src/lib/roadmap.ts` | Which plan steps are done, next or locked |
| `src/lib/profile.tsx` | Saves answers and progress on the phone (no accounts) |
| `scripts/fetch-places.mjs` | Refreshes map places from OpenStreetMap |

## How the voice works

Phone records → `/api/talk` → ElevenLabs turns speech into text → Groq (`gpt-oss-120b`) writes a short reply → `/api/speak` streams it back as ElevenLabs voice.

## Map data

Places come from OpenStreetMap (© OpenStreetMap contributors, ODbL), saved in `src/data/places.json`. Right now it covers downtown Columbus. To refresh or widen it: `node scripts/fetch-places.mjs` (the free servers are often busy; retry later if it fails).

## To-do before the demo

- [ ] Verify every phone number and link in `src/data/resources.json` and `benefits.json`. Only the Homeless Hotline (614-274-7000), LSS CHOICES (614-224-4663) and Huckleberry House (614-294-5553) have been checked.
- [ ] Refresh map places for a wider area.
