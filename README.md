# ⭐ NorthStar

**Other apps list resources. NorthStar shows you the way.**

A step-by-step roadmap app for people experiencing homelessness. Users answer a few questions, and NorthStar builds a personal plan to stable housing, with local resources and stories at every step.

## Run it

```bash
npm install
npx expo start
```

- **Phone:** open the Expo Go app and scan the QR code
- **Browser:** press `w` in the terminal

## Where things are

| Folder / file | What it is |
| --- | --- |
| `src/app/` | Screens. Every file is a page (Expo Router). |
| `src/app/(tabs)/` | The 4 bottom tabs: Home, Roadmap, Resources, Guide |
| `src/app/welcome.tsx` | First-time tour |
| `src/app/questionnaire.tsx` | The yes/no questions that build the roadmap |
| `src/app/step/[id].tsx` | One roadmap step: tasks, resources, story, mark complete |
| `src/app/benefit/[id].tsx` | Benefit walkthrough (the "caseworker" part) |
| `src/app/help.tsx` | "Need help right now?" crisis numbers |
| `src/data/*.json` | All the content: steps, resources, stories, benefits |
| `src/lib/roadmap.ts` | The roadmap logic (which steps are done, next, or locked) |
| `src/lib/profile.tsx` | Saves answers, progress and checklists on the phone (no accounts) |
| `src/lib/questions.ts` | The questionnaire questions |
| `src/lib/recovery.ts` | Recovery codes: get your plan back on a new phone, no server needed |
| `src/app/restore.tsx` | Screen to type in a recovery code |
| `src/components/ui.tsx` | Shared buttons, cards and layout |

## How the roadmap works

Each step in `steps.json` has:
- `requires`: steps that must be done first (this makes the dependency graph)
- `skipIf`: a question; if the user answered "yes", the step is already done

So someone who already has an ID skips "Prove Who You Are" automatically.

## Adding resource details

Resources in `src/data/resources.json` can also have `address`, `hours` and `serves` (who can go).
When `address` is set, the card shows a **Directions** button. Only add details you've confirmed.

## To-do before the demo

- [ ] **Verify every phone number and link** in `src/data/resources.json` and `benefits.json`. Checked so far: Homeless Hotline (614-274-7000), LSS CHOICES (614-224-4663), Huckleberry House (614-294-5553), LASCO legal aid (614-221-7201, lasco.org). All website URLs loaded in Nov 2026.
- [ ] Add `address`, `hours` and `serves` to resources (confirm each one)
- [ ] Add more real Columbus resources (food pantries, free clothes, mailing addresses)
- [ ] Replace the example stories with real ones (with permission), or keep them labeled as examples
- [ ] Translations (Spanish, Somali), done by real translators
- [ ] Stretch: Stories page, AI chat in the Guide tab
