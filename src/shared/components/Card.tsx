// Card — surface container with border + radius. Optional press behavior for tappable cards,
// which get a subtle scale-down while held (see usePressScale).
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { usePressScale } from "@shared/hooks/usePressScale";
import { cn } from "@shared/lib/cn";

type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  padded?: boolean;
};

export function Card({
  children,
  onPress,
  className,
  padded = true,
}: CardProps) {
  const press = usePressScale();

  const base = cn(
    "bg-bg-surface border border-border-default rounded-card overflow-hidden",
    padded && "p-4",
    className,
  );

  if (onPress) {
    return (
      <Animated.View style={press.style}>
        <Pressable
          onPress={onPress}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          className={base}
          accessibilityRole="button"
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <View className={base}>{children}</View>;
}
