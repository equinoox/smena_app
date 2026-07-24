// Tracks the one-time onboarding flag in AsyncStorage. Used by the root redirect.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const KEY = "smena.hasCompletedOnboarding";

export function useOnboardingStatus() {
  // null = still loading from storage.
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((value) => setCompleted(value === "true"));
  }, []);

  const complete = useCallback(async () => {
    await AsyncStorage.setItem(KEY, "true");
    setCompleted(true);
  }, []);

  return { completed, complete };
}
