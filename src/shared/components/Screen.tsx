// Screen — consistent safe-area + screen-background wrapper used by every feature screen.
// Scrollable screens keep focused inputs clear of the keyboard: iOS uses the ScrollView's
// native `automaticallyAdjustKeyboardInsets` (reliable under Fabric; KeyboardAvoidingView's
// old JS-measured auto-scroll is not). Android has no such native API, so a focused Input
// asks us (via ScrollIntoViewContext) to scroll itself into view above the keyboard.
import { useCallback, useRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { cn } from "@shared/lib/cn";
import {
  ScrollIntoViewContext,
  type MeasurableInstance,
  type ScrollIntoViewFn,
} from "@shared/lib/scrollIntoView";

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  edges?: readonly Edge[];
};

export function Screen({
  children,
  scroll = false,
  className,
  edges = ["top", "bottom"],
}: ScreenProps) {
  const scrollRef = useRef<ScrollView>(null);

  const scrollIntoView = useCallback<ScrollIntoViewFn>((node) => {
    if (Platform.OS !== "android" || !node || !scrollRef.current) return;
    const scrollNode = scrollRef.current as unknown as MeasurableInstance;
    // Give the keyboard/adjustResize resize time to settle before measuring position.
    setTimeout(() => {
      node.measureLayout(
        scrollNode,
        (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(y - 24, 0), animated: true }),
        () => {},
      );
    }, 100);
  }, []);

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-bg-screen">
      {scroll ? (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? undefined : "height"}
        >
          <ScrollIntoViewContext.Provider value={scrollIntoView}>
            <ScrollView
              ref={scrollRef}
              className="flex-1"
              contentContainerClassName={cn("px-4 pb-8 pt-4", className)}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets
            >
              {children}
            </ScrollView>
          </ScrollIntoViewContext.Provider>
        </KeyboardAvoidingView>
      ) : (
        <View className={cn("flex-1 px-4 pb-4 pt-4", className)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
