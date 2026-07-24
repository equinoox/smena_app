// Screen — consistent safe-area + screen-background wrapper used by every feature screen.
import { ScrollView, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { cn } from "@shared/lib/cn";

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
  edges = ["top"],
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-bg-screen">
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn("px-4 pb-8", className)}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn("flex-1 px-4", className)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
