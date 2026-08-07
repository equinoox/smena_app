// StarRatingInput — row of 5 tappable stars for one rating dimension, integer 0-5.
// Tapping a star sets the value to its position; tapping the currently-set star
// again drops it by one, so 0 ("no stars") stays reachable. Optional label above the
// row, since the two rating-submission modals always show one row per dimension.
import { Star } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "@shared/hooks/useThemeColors";

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: number;
};

export function StarRatingInput({
  value,
  onChange,
  label,
  size = 30,
}: StarRatingInputProps) {
  const colors = useThemeColors();

  return (
    <View className="gap-2">
      {label ? (
        <Text className="font-sans-semibold text-sm text-text-secondary">
          {label}
        </Text>
      ) : null}
      <View className="flex-row items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable
            key={i}
            onPress={() => onChange(value === i ? i - 1 : i)}
            hitSlop={6}
          >
            <Star
              size={size}
              weight={i <= value ? "fill" : "regular"}
              color={i <= value ? colors.star : colors.borderMuted}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
