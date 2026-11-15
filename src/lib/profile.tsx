// Saves the user's answers and progress on the device (no account needed).
// Any screen can read or update it with useProfile().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { steps } from './data';
import { questions } from './questions';
import type { Answers } from './types';

export type Profile = {
  answers: Answers | null; // null = hasn't done the questionnaire yet
  completed: string[]; // ids of steps the user marked complete
  checks: Record<string, string[]>; // checked-off items, e.g. { "step:id": ["Order your birth certificate"] }
};

type ProfileContextValue = Profile & {
  loaded: boolean;
  saveAnswers: (answers: Answers) => void;
  completeStep: (id: string) => void;
  undoStep: (id: string) => void;
  toggleCheck: (listId: string, item: string) => void;
  restore: (profile: Pick<Profile, 'answers' | 'completed'>) => void;
  reset: () => void;
};

const STORAGE_KEY = 'northstar-profile';
const empty: Profile = { answers: null, completed: [], checks: {} };

const ProfileContext = createContext<ProfileContextValue | null>(null);

// Saved data might come from an older version of the app, so check it before using it.
// Unknown step ids are dropped, and answers missing a question are treated as "not done yet".
function sanitize(raw: unknown): Profile {
  if (!raw || typeof raw !== 'object') return empty;
  const data = raw as Partial<Profile>;

  let answers: Answers | null = null;
  if (data.answers && typeof data.answers === 'object') {
    const complete = questions.every((q) => typeof data.answers?.[q.key] === 'boolean');
    if (complete) answers = data.answers;
  }

  const stepIds = new Set(steps.map((s) => s.id));
  const completed = Array.isArray(data.completed)
    ? data.completed.filter((id): id is string => typeof id === 'string' && stepIds.has(id))
    : [];

  const checks: Record<string, string[]> = {};
  if (data.checks && typeof data.checks === 'object') {
    for (const [key, items] of Object.entries(data.checks)) {
      if (Array.isArray(items)) checks[key] = items.filter((i) => typeof i === 'string');
    }
  }

  return { answers, completed, checks };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(empty);
  const [loaded, setLoaded] = useState(false);

  // Load saved data when the app opens.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setProfile(sanitize(JSON.parse(saved)));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Always build on the latest saved state, so quick taps can't overwrite each other.
  function update(change: (prev: Profile) => Profile) {
    setProfile((prev) => {
      const next = change(prev);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  const value: ProfileContextValue = {
    ...profile,
    loaded,
    // Keeps completed steps, so retaking the questions never erases progress.
    saveAnswers: (answers) => update((p) => ({ ...p, answers })),
    completeStep: (id) => update((p) => ({ ...p, completed: [...new Set([...p.completed, id])] })),
    undoStep: (id) => update((p) => ({ ...p, completed: p.completed.filter((c) => c !== id) })),
    toggleCheck: (listId, item) =>
      update((p) => {
        const current = p.checks[listId] ?? [];
        const nextList = current.includes(item)
          ? current.filter((i) => i !== item)
          : [...current, item];
        return { ...p, checks: { ...p.checks, [listId]: nextList } };
      }),
    restore: ({ answers, completed }) => update((p) => ({ ...p, answers, completed })),
    reset: () => update(() => empty),
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
