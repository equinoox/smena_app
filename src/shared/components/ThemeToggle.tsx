// Theme toggle — sun/moon; tapping sets light or dark (persisted).
import { Moon, Sun } from "phosphor-react-native";
import { View } from "react-native";
import { SegmentedOption } from "@shared/components/SegmentedOption";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTheme } from "@shared/providers/ThemeProvider";

export function ThemeToggle() {
  const { colorScheme, setPreference } = useTheme();
  const colors = useThemeColors();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt p-1">
      <SegmentedOption selected={!isDark} onPress={() => setPreference("light")}>
        <Sun size={18} weight="fill" color={!isDark ? colors.brand : colors.textMuted} />
      </SegmentedOption>
      <SegmentedOption selected={isDark} onPress={() => setPreference("dark")}>
        <Moon size={18} weight="fill" color={isDark ? colors.brand : colors.textMuted} />
      </SegmentedOption>
    </View>
  );
}
