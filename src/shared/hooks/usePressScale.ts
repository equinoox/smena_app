// usePressScale — shared press feedback: a small scale-down on press-in that springs back
// on release. Spread onto a Pressable; put the returned style on an Animated.View wrapper.
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { motion } from "@shared/lib/motion";

export function usePressScale(pressedScale = 0.97) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withTiming(pressedScale, {
      duration: motion.duration.fast,
      easing: motion.easing.out,
    });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, motion.spring);
  };

  return { style, onPressIn, onPressOut };
}
