// ProgressDots — step indicator for the sign-up flow (role select -> profile -> ahead).
import { View } from "react-native";
import { cn } from "@shared/lib/cn";

type ProgressDotsProps = {
  total: number;
  activeIndex: number; // 0-based index of the last completed/current dot
};

export function ProgressDots({ total, activeIndex }: ProgressDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={cn(
            "h-1.5 rounded-full",
            i <= activeIndex ? "w-6 bg-brand" : "w-1.5 bg-bg-surface-alt",
          )}
        />
      ))}
    </View>
  );
}
