// Saves the user's answers and progress on the device (no account needed).
// Any screen can read or update it with useProfile().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Answers } from './types';

type Profile = {
  answers: Answers | null; // null = hasn't done the questionnaire yet
  completed: string[]; // ids of steps the user marked complete
};

type ProfileContextValue = Profile & {
  loaded: boolean;
  saveAnswers: (answers: Answers) => void;
  completeStep: (id: string) => void;
  undoStep: (id: string) => void;
  reset: () => void;
};

const STORAGE_KEY = 'northstar-profile';
const empty: Profile = { answers: null, completed: [] };

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(empty);
  const [loaded, setLoaded] = useState(false);

  // Load saved data when the app opens.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setProfile(JSON.parse(saved));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function update(next: Profile) {
    setProfile(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }

  const value: ProfileContextValue = {
    ...profile,
    loaded,
    saveAnswers: (answers) => update({ ...profile, answers }),
    completeStep: (id) =>
      update({ ...profile, completed: [...new Set([...profile.completed, id])] }),
    undoStep: (id) => update({ ...profile, completed: profile.completed.filter((c) => c !== id) }),
    reset: () => update(empty),
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
