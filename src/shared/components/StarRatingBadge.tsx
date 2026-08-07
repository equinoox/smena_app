// StarRatingBadge — compact "★ 4.3" readout used next to a worker's/venue's name
// everywhere it appears (rows, cards, headers). Falls back to an empty outline star +
// "N/A" when there are no ratings yet, instead of a misleading "★ 0.0" — kept short so
// it reads fine inline instead of a full sentence like "No ratings yet".
import { Star } from "phosphor-react-native";
import { Text, View } from "react-native";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
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
  const { t } = useTranslation();
  const hasRating = !!count && rating != null;

  return (
    <View className={cn("flex-row items-center gap-1", className)}>
      <Star
        size={iconSizeBySize[size]}
        weight={hasRating ? "fill" : "regular"}
        color={hasRating ? colors.star : colors.textMuted}
      />
      <Text
        className={cn(
          "font-sans-bold",
          hasRating ? "text-text-primary" : "text-text-muted",
          textClassBySize[size],
        )}
      >
        {hasRating ? rating.toFixed(1) : t("rating.notAvailable")}
      </Text>
    </View>
  );
}
