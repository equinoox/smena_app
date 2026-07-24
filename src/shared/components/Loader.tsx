// Loader — full-screen centered spinner on the screen background.
import { ActivityIndicator, View } from "react-native";
import { useThemeColors } from "@shared/hooks/useThemeColors";

export function Loader() {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center bg-bg-screen">
      <ActivityIndicator color={colors.brand} />
    </View>
  );
}
