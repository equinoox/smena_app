// Motion tokens — one source of truth for animation timing so every transition in the app
// (Toast, Modal, tab bar, press feedback) feels like it belongs to the same product.
import { Easing } from "react-native-reanimated";

export const motion = {
  duration: {
    // Press feedback and other "instant" acknowledgements.
    fast: 130,
    // Default for anything appearing/disappearing.
    base: 200,
    // Slightly longer travel — toasts, list item entrances.
    slow: 260,
  },
  easing: {
    // Decelerating — for things arriving on screen.
    out: Easing.bezier(0.22, 1, 0.36, 1),
    // Accelerating — for things leaving it.
    in: Easing.bezier(0.4, 0, 1, 1),
  },
  // Barely-overshooting spring: press release, tab selection.
  spring: { damping: 18, stiffness: 260, mass: 0.6 },
  // Snappier and a touch bouncier — one-shot "pop" feedback only (save toggle).
  pop: { damping: 10, stiffness: 320, mass: 0.5 },
} as const;
