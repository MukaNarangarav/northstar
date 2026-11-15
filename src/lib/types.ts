// The shapes of our data. These match the JSON files in src/data.

export type AnswerKey =
  | 'hasShelter'
  | 'hasAddress'
  | 'hasId'
  | 'hasPhone'
  | 'hasBenefits'
  | 'hasJob';

// true = "yes", false = "no"
export type Answers = Record<AnswerKey, boolean>;

export type Step = {
  id: string;
  emoji: string;
  title: string;
  plainTitle: string;
  why: string;
  tasks: string[];
  requires: string[]; // step ids that must be done first
  skipIf: AnswerKey | null; // if the user answered "yes" to this, the step is already done
  resourceIds: string[];
  storyId: string | null;
  celebration: string;
};

export type Resource = {
  id: string;
  name: string;
  category: string;
  description: string;
  phone: string | null;
  url: string | null;
};

export type Story = {
  id: string;
  isSample: boolean;
  name: string;
  text: string;
};

export type Benefit = {
  id: string;
  emoji: string;
  name: string;
  summary: string;
  mightQualify: string;
  documents: string[];
  steps: string[];
  url: string;
};

export type StepStatus = 'done' | 'next' | 'unlocked' | 'locked';
