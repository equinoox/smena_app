// SegmentedOption — one option inside a small two-way toggle. Animates its selected pill
// (fade + scale) instead of snapping. Used by ThemeToggle and LanguageToggle.
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { motion } from "@shared/lib/motion";

type SegmentedOptionProps = {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

export function SegmentedOption({ selected, onPress, children }: SegmentedOptionProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, motion.spring);
  }, [selected, progress]);

  // The pill sits behind the content so only it fades — the icon just changes opacity.
  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.8, 1]) }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.4, 1]),
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Animated.View
        style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, pillStyle]}
      >
        <View className="flex-1 rounded-[7px] bg-bg-surface" />
      </Animated.View>
      <Animated.View style={contentStyle}>
        <View className="p-1.5">{children}</View>
      </Animated.View>
    </Pressable>
  );
}
