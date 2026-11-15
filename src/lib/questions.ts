import type { AnswerKey } from './types';

// One yes/no question per thing the roadmap needs to know.
// To add a question: add it here, add its key to AnswerKey in types.ts,
// and use it as "skipIf" on a step in steps.json.
// Changing this list (or its order) changes recovery codes, so bump CODE_VERSION in recovery.ts.
export const questions: { key: AnswerKey; text: string }[] = [
  { key: 'hasShelter', text: 'Do you have a safe place to sleep tonight?' },
  { key: 'hasAddress', text: 'Do you have an address where you can get mail?' },
  { key: 'hasId', text: 'Do you have a photo ID (like a state ID or license)?' },
  { key: 'hasPhone', text: 'Do you have a working phone?' },
  { key: 'hasBenefits', text: 'Are you getting food or health benefits (SNAP or Medicaid)?' },
  { key: 'hasJob', text: 'Do you have a job right now?' },
];
