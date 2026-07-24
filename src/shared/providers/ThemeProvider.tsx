// Theme control: persists the user's light/dark/system choice and drives NativeWind's
// color scheme (which toggles the `dark` class that switches our CSS-variable tokens).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "smena.theme";

type ThemeContextValue = {
  preference: ThemePreference;
  colorScheme: "light" | "dark";
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "system" || stored === "light" || stored === "dark") {
        setPreferenceState(stored);
        setColorScheme(stored);
      }
    });
  }, [setColorScheme]);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    setColorScheme(pref);
    void AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  const value = useMemo(
    () => ({ preference, colorScheme: colorScheme ?? "dark", setPreference }),
    [preference, colorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
