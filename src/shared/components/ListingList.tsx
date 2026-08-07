// ListingList — presentational FlatList of ListingCards with loading/empty states.
// Save state is passed in by the screen (keeps this decoupled from feature hooks).
// Cards deliberately have no entrance animation: Reanimated layout animations (entering/
// exiting) fight FlatList's own cell positioning and make items overlap on a cold start.
// Motion here comes from the card's press feedback instead.
import { Briefcase, X } from "phosphor-react-native";
import { ActivityIndicator, FlatList, View } from "react-native";
import { EmptyState } from "@shared/components/EmptyState";
import { ListingCard } from "@shared/components/ListingCard";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import type { ListingWithVenue } from "@shared/types/domain.types";

// Default empty-state glyph: the "listings" icon (same as the tab bar) with a small X
// badge, so "no listings found" reads distinctly from other empty states (e.g. Saved,
// which keeps its own bookmark icon via the `emptyIcon` override below).
function NoListingsIcon() {
  const colors = useThemeColors();
  return (
    <View className="h-7 w-7 items-center justify-center">
      <Briefcase size={28} color={colors.textMuted} />
      <View className="absolute -bottom-1 -right-1 h-4 w-4 items-center justify-center rounded-full border border-border-default bg-bg-surface">
        <X size={10} weight="bold" color={colors.textMuted} />
      </View>
    </View>
  );
}

type ListingListProps = {
  listings: (ListingWithVenue & { savedAt?: string; distanceKm?: number })[];
  isLoading: boolean;
  savedIds?: Set<string>;
  onToggleSave?: (listing: ListingWithVenue) => void;
  header?: React.ReactElement;
  footer?: React.ReactElement;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  cardVariant?: "photo" | "compact";
};

export function ListingList({
  listings,
  isLoading,
  savedIds,
  onToggleSave,
  header,
  footer,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  cardVariant = "photo",
}: ListingListProps) {
  const colors = useThemeColors();

  // The spinner replaces the rows, never the whole screen — swapping the FlatList out for a
  // centered spinner remounts the header and makes it jump on every load.
  return (
    <FlatList
      data={isLoading ? [] : listings}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      ListFooterComponent={isLoading ? undefined : footer}
      contentContainerClassName="px-4 pb-8"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListEmptyComponent={
        isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : (
          <EmptyState
            icon={emptyIcon ?? <NoListingsIcon />}
            title={emptyTitle}
            description={emptyDescription}
          />
        )
      }
      renderItem={({ item }) => (
        <ListingCard
          listing={item}
          saved={savedIds?.has(item.id)}
          savedAt={item.savedAt}
          distanceKm={item.distanceKm}
          onToggleSave={
            onToggleSave ? () => onToggleSave(item) : undefined
          }
          variant={cardVariant}
        />
      )}
    />
  );
}
