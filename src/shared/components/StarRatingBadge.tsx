// StarRatingBadge — compact "★ 4.3" readout used next to a worker's/venue's name
// everywhere it appears (rows, cards, headers). Renders nothing when there are no
// ratings yet, so new profiles don't show a misleading "★ 0.0".
import { Star } from "phosphor-react-native";
import { Text, View } from "react-native";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { cn } from "@shared/lib/cn";

type StarRatingBadgeProps = {
  rating: number | null;
  count: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const iconSizeBySize = { sm: 12, md: 14, lg: 18 };
const textClassBySize = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function StarRatingBadge({
  rating,
  count,
  size = "sm",
  className,
}: StarRatingBadgeProps) {
  const colors = useThemeColors();

  if (!count || rating == null) return null;

  return (
    <View className={cn("flex-row items-center gap-1", className)}>
      <Star size={iconSizeBySize[size]} weight="fill" color={colors.star} />
      <Text
        className={cn(
          "font-sans-bold text-text-primary",
          textClassBySize[size],
        )}
      >
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}
