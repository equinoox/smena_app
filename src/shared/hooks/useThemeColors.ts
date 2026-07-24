// Returns the resolved hex palette for the active theme (for imperative color props).
import { useTheme } from "@shared/providers/ThemeProvider";
import { themeColors, type ThemeColors } from "@shared/lib/themeColors";

export function useThemeColors(): ThemeColors {
  const { colorScheme } = useTheme();
  return themeColors[colorScheme];
}
