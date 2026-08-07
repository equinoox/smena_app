// RatingSummary — overall star rating block for a detail screen (worker or venue),
// with an optional CTA to rate/edit-rate. Shared because both the worker-detail and
// venue-detail screens need the exact same layout, just with different labels.
import { Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { StarRatingBadge } from "@shared/components/StarRatingBadge";

type RatingSummaryProps = {
  ratingAvg: number | null;
  ratingCount: number;
  title: string;
  noRatingsLabel: string;
  countLabel: string;
  onRatePress?: () => void;
  rateButtonLabel?: string;
};

export function RatingSummary({
  ratingAvg,
  ratingCount,
  title,
  noRatingsLabel,
  countLabel,
  onRatePress,
  rateButtonLabel,
}: RatingSummaryProps) {
  return (
    <Card className="gap-3">
      <Text className="font-sans-bold text-base text-text-primary">{title}</Text>

      {ratingCount > 0 && ratingAvg != null ? (
        <View className="flex-row items-center gap-2">
          <StarRatingBadge rating={ratingAvg} count={ratingCount} size="lg" />
          <Text className="font-sans-medium text-sm text-text-tertiary">
            {countLabel}
          </Text>
        </View>
      ) : (
        <Text className="font-sans text-sm text-text-tertiary">
          {noRatingsLabel}
        </Text>
      )}

      {onRatePress ? (
        <Button
          label={rateButtonLabel ?? ""}
          variant="secondary"
          size="sm"
          fullWidth={false}
          onPress={onRatePress}
        />
      ) : null}
    </Card>
  );
}
