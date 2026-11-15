// "Ask NorthStar": an offline helper that matches a question to the app's
// own content (steps, benefits, resources). No AI and no internet needed.

import { benefits, resources, steps } from './data';

export type Match =
  | { kind: 'step'; id: string; title: string; detail: string }
  | { kind: 'benefit'; id: string; title: string; detail: string }
  | { kind: 'resource'; id: string; title: string; detail: string; phone: string | null };

export type Reply = { crisis: boolean; text: string; matches: Match[] };

const CRISIS_WORDS = [
  'suicide', 'suicidal', 'kill', 'die', 'hurt', 'abuse', 'abused', 'hit me', 'danger',
  'emergency', 'overdose', 'unsafe', 'scared', 'violence', 'attack',
];

// Everyday words mapped to words our content uses.
const SYNONYMS: Record<string, string[]> = {
  sleep: ['shelter', 'bed', 'tonight'],
  bed: ['shelter', 'tonight'],
  hungry: ['food', 'snap', 'meal'],
  eat: ['food', 'snap'],
  doctor: ['medicaid', 'health'],
  sick: ['medicaid', 'health'],
  work: ['job', 'resume'],
  money: ['job', 'benefits', 'bank'],
  license: ['id', 'bmv'],
  wallet: ['id', 'birth'],
  mail: ['address', 'mailing'],
  cell: ['phone', 'lifeline'],
  lawyer: ['legal'],
  evicted: ['housing', 'legal'],
  apartment: ['housing', 'home'],
  rent: ['housing', 'home'],
};

const STOP = new Set(['i', 'a', 'an', 'the', 'to', 'do', 'how', 'can', 'get', 'my', 'me', 'where', 'what', 'is', 'need', 'for', 'and', 'of', 'in', 'it', 'have', 'dont', "don't", 'no', 'help']);

function words(text: string): string[] {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
  return [...new Set(base.flatMap((w) => [w, ...(SYNONYMS[w] ?? [])]))];
}

function score(query: string[], haystack: string): number {
  const h = haystack.toLowerCase();
  return query.reduce((n, w) => n + (h.includes(w) ? 1 : 0), 0);
}

export function ask(question: string): Reply {
  const q = question.toLowerCase();
  if (CRISIS_WORDS.some((w) => q.includes(w))) {
    return {
      crisis: true,
      text: "It sounds like you might be in danger. Please reach out now. If it's an emergency, call 911. You can also call or text 988 any time.",
      matches: [],
    };
  }

  const query = words(question);
  const scored: { s: number; m: Match }[] = [
    ...steps.map((st) => ({
      s: score(query, [st.title, st.plainTitle, st.why, ...st.tasks].join(' ')),
      m: { kind: 'step' as const, id: st.id, title: `${st.emoji} ${st.title}`, detail: st.plainTitle },
    })),
    ...benefits.map((b) => ({
      s: score(query, [b.name, b.summary, b.mightQualify].join(' ')) * 1.2,
      m: { kind: 'benefit' as const, id: b.id, title: `${b.emoji} ${b.name}`, detail: b.summary },
    })),
    ...resources.map((r) => ({
      s: score(query, [r.name, r.category, r.description].join(' ')),
      m: { kind: 'resource' as const, id: r.id, title: r.name, detail: r.description, phone: r.phone },
    })),
  ];

  const matches = scored
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.m);

  return matches.length
    ? { crisis: false, text: "Here's what I found that can help:", matches }
    : {
        crisis: false,
        text: "I'm not sure about that one. Try different words, or call 211. A real person can help with almost anything, for free.",
        matches: [],
      };
}
