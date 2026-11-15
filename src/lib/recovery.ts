// Recovery codes: a short code that holds the user's answers and completed steps.
// If they lose their phone, they can type the code into a new one and get their roadmap back.
// Nothing is sent anywhere. The code itself is the backup.
//
// How it works: each answer and each step is one bit (1 = yes / done).
// The bits are written as a base-36 number, plus one check character to catch typos.
// If you add, remove or reorder questions or steps, bump CODE_VERSION so old codes are rejected
// instead of restoring the wrong steps.

import { steps } from './data';
import { questions } from './questions';
import type { Answers } from './types';

const CODE_VERSION = 1;
const PREFIX = `NS${CODE_VERSION}`;

export function makeRecoveryCode(answers: Answers, completed: string[]): string {
  const bits = [
    ...questions.map((q) => answers[q.key]),
    ...steps.map((s) => completed.includes(s.id)),
  ];
  const value = bits.reduce((n, bit, i) => (bit ? n + 2 ** i : n), 0);
  const body = value.toString(36).toUpperCase().padStart(3, '0');
  return `${PREFIX}-${body}${checkChar(body)}`;
}

export function readRecoveryCode(code: string): { answers: Answers; completed: string[] } | null {
  const cleaned = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleaned.startsWith(PREFIX)) return null;

  const rest = cleaned.slice(PREFIX.length);
  const body = rest.slice(0, -1);
  if (!body || checkChar(body) !== rest.slice(-1)) return null;

  const value = parseInt(body, 36);
  const totalBits = questions.length + steps.length;
  if (Number.isNaN(value) || value >= 2 ** totalBits) return null;

  const bit = (i: number) => Math.floor(value / 2 ** i) % 2 === 1;
  const answers = Object.fromEntries(questions.map((q, i) => [q.key, bit(i)])) as Answers;
  const completed = steps.filter((_, i) => bit(questions.length + i)).map((s) => s.id);
  return { answers, completed };
}

function checkChar(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) sum += parseInt(body[i], 36) * (i + 1);
  return (sum % 36).toString(36).toUpperCase();
}
