// Theme toggle — sun/moon; tapping sets light or dark (persisted).
import { Moon, Sun } from "phosphor-react-native";
import { Pressable, View } from "react-native";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTheme } from "@shared/providers/ThemeProvider";
import { cn } from "@shared/lib/cn";

export function ThemeToggle() {
  const { colorScheme, setPreference } = useTheme();
  const colors = useThemeColors();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt p-1">
      <Pressable
        onPress={() => setPreference("light")}
        accessibilityRole="button"
        accessibilityState={{ selected: !isDark }}
        className={cn("rounded-[7px] p-1.5", !isDark ? "bg-bg-surface" : "opacity-40")}
      >
        <Sun size={18} weight="fill" color={!isDark ? colors.brand : colors.textMuted} />
      </Pressable>
      <Pressable
        onPress={() => setPreference("dark")}
        accessibilityRole="button"
        accessibilityState={{ selected: isDark }}
        className={cn("rounded-[7px] p-1.5", isDark ? "bg-bg-surface" : "opacity-40")}
      >
        <Moon size={18} weight="fill" color={isDark ? colors.brand : colors.textMuted} />
      </Pressable>
    </View>
  );
}
