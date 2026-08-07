// ChipSlider — horizontal scrollable row (of Chips) with small edge arrows that appear
// only when there's more content to scroll to in that direction. Pure layout wrapper —
// takes whatever children (selection logic stays with the caller), so it drops into
// single-select and multi-select chip pickers unchanged.
import { CaretLeft, CaretRight } from "phosphor-react-native";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { cn } from "@shared/lib/cn";

const SCROLL_STEP = 160;
const EDGE_THRESHOLD = 4;

type ChipSliderProps = {
  children: React.ReactNode;
  className?: string;
};

export function ChipSlider({ children, className }: ChipSliderProps) {
  const colors = useThemeColors();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);
  const contentWidth = useRef(0);
  const containerWidth = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    setCanScrollLeft(scrollX.current > EDGE_THRESHOLD);
    setCanScrollRight(
      scrollX.current < contentWidth.current - containerWidth.current - EDGE_THRESHOLD,
    );
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.current = e.nativeEvent.contentOffset.x;
    updateArrows();
  };

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollTo({ x: scrollX.current + delta, animated: true });
  };

  return (
    <View className={cn("relative", className)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(w) => {
          contentWidth.current = w;
          updateArrows();
        }}
        onLayout={(e) => {
          containerWidth.current = e.nativeEvent.layout.width;
          updateArrows();
        }}
        contentContainerClassName="gap-2 pr-4"
      >
        {children}
      </ScrollView>

      {canScrollLeft ? (
        <View
          pointerEvents="box-none"
          className="absolute left-0 top-0 bottom-0 w-7 items-center justify-center"
        >
          <Pressable
            onPress={() => scrollBy(-SCROLL_STEP)}
            className="h-7 w-7 items-center justify-center rounded-full border border-border-default bg-bg-surface"
          >
            <CaretLeft size={14} weight="bold" color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
      {canScrollRight ? (
        <View
          pointerEvents="box-none"
          className="absolute right-0 top-0 bottom-0 w-7 items-center justify-center"
        >
          <Pressable
            onPress={() => scrollBy(SCROLL_STEP)}
            className="h-7 w-7 items-center justify-center rounded-full border border-border-default bg-bg-surface"
          >
            <CaretRight size={14} weight="bold" color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
