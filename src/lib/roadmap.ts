// The core logic: turn questionnaire answers + completed steps into a roadmap.
//
// Each step lists the steps it "requires". That makes a dependency graph:
// a step is unlocked only when everything it requires is done.

import { steps } from './data';
import type { Answers, Step, StepStatus } from './types';

// A step counts as done if the user finished it in the app,
// OR their answers say they already have it (e.g. they already have an ID).
export function isDone(step: Step, answers: Answers, completed: string[]): boolean {
  if (completed.includes(step.id)) return true;
  if (step.skipIf && answers[step.skipIf]) return true;
  return false;
}

export type RoadmapItem = { step: Step; status: StepStatus };

export function buildRoadmap(answers: Answers, completed: string[]): RoadmapItem[] {
  const doneIds = steps.filter((s) => isDone(s, answers, completed)).map((s) => s.id);
  let foundNext = false;

  return steps.map((step) => {
    if (doneIds.includes(step.id)) return { step, status: 'done' };

    const unlocked = step.requires.every((id) => doneIds.includes(id));
    if (!unlocked) return { step, status: 'locked' };

    // The first unlocked step that isn't done is the user's "next step".
    if (!foundNext) {
      foundNext = true;
      return { step, status: 'next' };
    }
    return { step, status: 'unlocked' };
  });
}

export function progress(items: RoadmapItem[]) {
  const done = items.filter((i) => i.status === 'done').length;
  return { done, total: items.length };
}
