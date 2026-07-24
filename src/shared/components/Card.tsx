// Card — surface container with border + radius. Optional press behavior for tappable cards.
import { Pressable, View } from "react-native";
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
  const base = cn(
    "bg-bg-surface border border-border-default rounded-card",
    padded && "p-4",
    className,
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={cn(base, "active:opacity-90")}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return <View className={base}>{children}</View>;
}
