// Modal — centered dialog over a dimmed backdrop. Base for ConfirmationModal and sheets.
// The backdrop fades and the card lifts + scales in; the native modal stays mounted through
// the closing animation so it also plays on the way out.
// Animated wrappers only carry numeric geometry — colors stay in NativeWind classes, which
// Reanimated's Animated.* components don't support.
import { useEffect, useState } from "react";
import { Modal as RNModal, Pressable, Text, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { motion } from "@shared/lib/motion";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  // Opening only flips `mounted` — the entrance is started by the effect below, once the
  // native modal is actually on screen. Closing animates first, then unmounts.
  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    progress.value = withTiming(
      0,
      { duration: motion.duration.fast, easing: motion.easing.in },
      (finished) => {
        if (finished) runOnJS(setMounted)(false);
      },
    );
  }, [visible, progress]);

  useEffect(() => {
    if (!mounted || !visible) return;
    progress.value = withTiming(1, {
      duration: motion.duration.base,
      easing: motion.easing.out,
    });
  }, [mounted, visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [16, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.94, 1]) },
    ],
  }));

  if (!mounted) return null;

  return (
    <RNModal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-center px-6">
        <Animated.View
          style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, backdropStyle]}
        >
          <Pressable onPress={onClose} className="flex-1 bg-black/60" />
        </Animated.View>

        <Animated.View style={cardStyle} pointerEvents="box-none">
          <View className="w-full max-w-md self-center rounded-card-lg border border-border-default bg-bg-surface p-5">
            {title ? (
              <Text className="mb-2 font-sans-bold text-lg text-text-primary">
                {title}
              </Text>
            ) : null}
            {children}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
}
