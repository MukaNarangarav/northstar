# NorthStar

A simple app for people experiencing homelessness in Columbus, Ohio. Talk to it, find help nearby, and follow a step-by-step plan to a place of your own.

## The 4 tabs

| Tab | What it does |
| --- | --- |
| **Talk** | Voice assistant. Tap, talk, it answers out loud. Stop button ends it anytime. |
| **Map** | Map on top, Find My-style arrow on the bottom pointing to the nearest shelter, food, warm place, water, restroom or clinic. Shows distance, walk time and a Directions button. |
| **Plan** | Step-by-step roadmap (built from a few yes/no questions), saved checklists, guides for SNAP, Medicaid and State ID, and a recovery code to get the plan back on a new phone. |
| **Help** | Tap-to-call crisis numbers and local resources. |

Every tab has a **Quick exit** button that instantly switches to a weather page, for someone who needs to hide what they're looking at.

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
| `src/lib/profile.tsx` | Saves answers, progress and checklists on the phone (no accounts) |
| `src/lib/questions.ts` | The questionnaire questions |
| `src/lib/recovery.ts` | Recovery codes: get your plan back on a new phone, no server needed |
| `src/app/restore.tsx` | Screen to type in a recovery code |
| `scripts/fetch-places.mjs` | Refreshes map places from OpenStreetMap |

## How the plan works

Each step in `steps.json` has:
- `requires`: steps that must be done first (this makes the dependency graph)
- `skipIf`: a question; if the user answered "yes", the step is already done

So someone who already has an ID skips "Prove Who You Are" automatically. Changing the questions or steps changes recovery codes, so bump `CODE_VERSION` in `recovery.ts` when you do.

Resources in `resources.json` can also have `address`, `hours` and `serves` (who can go). When `address` is set, the row offers **Directions**. Only add details you've confirmed.

## How the voice works

Phone records → `/api/talk` → ElevenLabs turns speech into text → Groq (`gpt-oss-120b`) writes a short reply → `/api/speak` streams it back as ElevenLabs voice.

## Map data

Places come from OpenStreetMap (© OpenStreetMap contributors, ODbL), saved in `src/data/places.json`. Right now it covers downtown Columbus. To refresh or widen it: `node scripts/fetch-places.mjs` (the free servers are often busy; retry later if it fails).

## To-do before the demo

- [ ] **Verify every phone number and link** in `src/data/resources.json` and `benefits.json`. Checked so far: Homeless Hotline (614-274-7000), LSS CHOICES (614-224-4663), Huckleberry House (614-294-5553), LASCO legal aid (614-221-7201, lasco.org).
- [ ] Add `address`, `hours` and `serves` to resources (confirm each one)
- [ ] Refresh map places for a wider area (`node scripts/fetch-places.mjs`)
- [ ] Translations (Spanish, Somali), done by real translators
