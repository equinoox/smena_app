// Screen — consistent safe-area + screen-background wrapper used by every feature screen.
// Scrollable screens keep focused inputs clear of the keyboard: iOS uses the ScrollView's
// native `automaticallyAdjustKeyboardInsets`, which also reserves scroll room for the
// keyboard (reliable under Fabric; KeyboardAvoidingView's old JS-measured auto-scroll is
// not). Android's `adjustResize` window resize does not apply under edge-to-edge (the
// Expo SDK 54+ default, not opt-outable), so the keyboard just overlays the screen without
// shrinking it — nothing reserves the scroll room needed to lift a field above it. We patch
// that manually: track the keyboard's height and pad the ScrollView's content by that much,
// then a focused Input asks us (via ScrollIntoViewContext) to scroll itself above the keyboard.
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, View } from "react-native";
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
  const [keyboardPad, setKeyboardPad] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "android" || !scroll) return;
    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardPad(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardPad(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scroll]);

  const scrollIntoView = useCallback<ScrollIntoViewFn>((node) => {
    if (Platform.OS !== "android" || !node || !scrollRef.current) return;
    const scrollNode = scrollRef.current as unknown as MeasurableInstance;
    const scrollToNode = () => {
      node.measureLayout(
        scrollNode,
        (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(y - 24, 0), animated: true }),
        () => {},
      );
    };
    // If the keyboard is already up (switching focus between fields), the extra bottom
    // padding is already applied — measure right away. Otherwise wait for the keyboard-show
    // event, then give the padding state a moment to actually land in the native layout
    // before measuring, since that's what creates the scroll room to reach the field.
    if (Keyboard.isVisible()) {
      scrollToNode();
      return;
    }
    const subscription = Keyboard.addListener("keyboardDidShow", () => {
      subscription.remove();
      setTimeout(scrollToNode, 50);
    });
  }, []);

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-bg-screen">
      {scroll ? (
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
            {/* Extra scroll room so a field near the bottom of the form can still be
                scrolled above the keyboard — see the file comment for why this is needed. */}
            <View style={{ height: keyboardPad }} />
          </ScrollView>
        </ScrollIntoViewContext.Provider>
      ) : (
        <View className={cn("flex-1 px-4 pb-4 pt-4", className)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
