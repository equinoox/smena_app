// Context so a focused Input can ask its enclosing Screen's ScrollView to scroll it above
// the keyboard. Only needed on Android — iOS is handled natively by the ScrollView's
// `automaticallyAdjustKeyboardInsets` (see Screen.tsx).
import { createContext, useContext } from "react";

// Minimal shape of RN's native view instance methods (not re-exported as a public type
// from "react-native" in this SDK) — just enough to call `measureLayout`.
export type MeasurableInstance = {
  measureLayout(
    relativeTo: MeasurableInstance,
    onSuccess: (x: number, y: number, width: number, height: number) => void,
    onFail?: () => void,
  ): void;
};

export type ScrollIntoViewFn = (node: MeasurableInstance | null) => void;

export const ScrollIntoViewContext = createContext<ScrollIntoViewFn | null>(null);

export function useScrollIntoView(): ScrollIntoViewFn | null {
  return useContext(ScrollIntoViewContext);
}
