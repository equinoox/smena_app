// Tracks the one-time onboarding flag in AsyncStorage via a shared Zustand store, so
// completing onboarding in one screen (e.g. a sign-up form) is immediately visible to
// every other consumer (e.g. the root layout's route guards), not just the caller.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { create } from "zustand";

const KEY = "smena.hasCompletedOnboarding";

type OnboardingStore = {
  completed: boolean | null; // null = still loading from storage
  hydrated: boolean;
  hydrate: () => Promise<void>;
  complete: () => Promise<void>;
};

const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  completed: null,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    const value = await AsyncStorage.getItem(KEY);
    set({ completed: value === "true", hydrated: true });
  },
  complete: async () => {
    await AsyncStorage.setItem(KEY, "true");
    set({ completed: true });
  },
}));

export function useOnboardingStatus() {
  const completed = useOnboardingStore((s) => s.completed);
  const complete = useOnboardingStore((s) => s.complete);
  const hydrate = useOnboardingStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return { completed, complete };
}
