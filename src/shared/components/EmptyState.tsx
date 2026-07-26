// EmptyState — centered icon + title + description with an optional action. Reused across lists.
// Fades in on mount (it usually replaces a spinner). Uses a plain animated style rather than
// a Reanimated entering animation, because this also renders inside FlatList's
// ListEmptyComponent, where layout animations break cell positioning.
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "@shared/components/Button";
import { motion } from "@shared/lib/motion";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: motion.duration.slow,
      easing: motion.easing.out,
    });
  }, [opacity]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ flex: 1 }, fadeStyle]}>
      <View className="flex-1 items-center justify-center px-8 py-12">
        {icon ? (
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-bg-icon-tint">
            {icon}
          </View>
        ) : null}
        <Text className="text-center font-sans-bold text-lg text-text-primary">
          {title}
        </Text>
        {description ? (
          <Text className="mt-1.5 text-center font-sans text-sm text-text-tertiary">
            {description}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <View className="mt-5">
            <Button label={actionLabel} onPress={onAction} fullWidth={false} />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
