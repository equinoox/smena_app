// SaveToggle — bookmark button that pops when tapped. Used by ListingCard (both variants)
// and the listing detail header.
import { BookmarkSimple } from "phosphor-react-native";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { motion } from "@shared/lib/motion";

type SaveToggleProps = {
  saved: boolean;
  onPress: () => void;
  size?: number;
  // Positioning/padding for the tap target, supplied by the caller.
  className?: string;
  // Cards sit on a surface (muted icon); the detail header sits over a photo (primary icon).
  inactiveColor?: string;
};

export function SaveToggle({
  saved,
  onPress,
  size = 19,
  className,
  inactiveColor,
}: SaveToggleProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.75, { duration: motion.duration.fast, easing: motion.easing.out }),
      withSpring(1, motion.pop),
    );
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={10} className={className}>
      <Animated.View style={style}>
        <BookmarkSimple
          size={size}
          weight={saved ? "fill" : "regular"}
          color={saved ? colors.brand : (inactiveColor ?? colors.textMuted)}
        />
      </Animated.View>
    </Pressable>
  );
}
