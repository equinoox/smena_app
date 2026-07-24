// Chip — small pill for tags (employment type, urgent) and filters. Token-styled variants.
import { Pressable, Text, View } from "react-native";
import { cn } from "@shared/lib/cn";

type ChipVariant =
  | "neutral"
  | "active"
  | "success"
  | "warning"
  | "urgent"
  | "outline";

type ChipProps = {
  label: string;
  variant?: ChipVariant;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
};

const containerByVariant: Record<ChipVariant, string> = {
  neutral: "bg-bg-surface-alt",
  active: "bg-brand",
  success: "bg-success-bg",
  warning: "bg-warning-bg",
  urgent: "bg-accent-badge",
  outline: "border border-border-default",
};

const textByVariant: Record<ChipVariant, string> = {
  neutral: "text-text-secondary",
  active: "text-on-brand",
  success: "text-success",
  warning: "text-warning",
  urgent: "text-on-accent",
  outline: "text-text-tertiary",
};

export function Chip({
  label,
  variant = "neutral",
  onPress,
  leftIcon,
}: ChipProps) {
  const content = (
    <View className="flex-row items-center gap-1.5">
      {leftIcon}
      <Text className={cn("font-sans-semibold text-xs", textByVariant[variant])}>
        {label}
      </Text>
    </View>
  );

  const base = cn(
    "px-3 py-1.5 rounded-chip self-start",
    containerByVariant[variant],
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={cn(base, "active:opacity-80")}>
        {content}
      </Pressable>
    );
  }

  return <View className={base}>{content}</View>;
}
