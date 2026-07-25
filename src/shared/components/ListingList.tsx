// ListingList — presentational FlatList of ListingCards with loading/empty states.
// Save state is passed in by the screen (keeps this decoupled from feature hooks).
import { BookmarkSimple } from "phosphor-react-native";
import { ActivityIndicator, FlatList, View } from "react-native";
import { EmptyState } from "@shared/components/EmptyState";
import { ListingCard } from "@shared/components/ListingCard";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import type { ListingWithVenue } from "@shared/types/domain.types";

type ListingListProps = {
  listings: ListingWithVenue[];
  isLoading: boolean;
  savedIds?: Set<string>;
  onToggleSave?: (listing: ListingWithVenue) => void;
  header?: React.ReactElement;
  emptyTitle: string;
  emptyDescription?: string;
  cardVariant?: "photo" | "compact";
};

export function ListingList({
  listings,
  isLoading,
  savedIds,
  onToggleSave,
  header,
  emptyTitle,
  emptyDescription,
  cardVariant = "photo",
}: ListingListProps) {
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        {header ? <View className="absolute top-0 w-full">{header}</View> : null}
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <FlatList
      data={listings}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      contentContainerClassName="px-4 pb-8"
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListEmptyComponent={
        <EmptyState
          icon={<BookmarkSimple size={28} color={colors.textMuted} />}
          title={emptyTitle}
          description={emptyDescription}
        />
      }
      renderItem={({ item }) => (
        <ListingCard
          listing={item}
          saved={savedIds?.has(item.id)}
          onToggleSave={
            onToggleSave ? () => onToggleSave(item) : undefined
          }
          variant={cardVariant}
        />
      )}
    />
  );
}
