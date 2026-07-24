// Lightweight responsive scaling (no extra deps) so spacing/fonts adapt across phones.
// Use the useResponsive() hook in components; avoid hardcoding mockup pixel values.
import { useWindowDimensions } from "react-native";

// Reference frame the design mockups were drawn against.
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Scale a size proportionally to screen width.
  const scale = (size: number) => (width / BASE_WIDTH) * size;
  // Scale proportionally to screen height.
  const verticalScale = (size: number) => (height / BASE_HEIGHT) * size;
  // Softened scale — moves toward the target but not fully (good for fonts).
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  return {
    width,
    height,
    isSmall: width < 360,
    isLarge: width >= 414,
    scale,
    verticalScale,
    moderateScale,
  };
}
