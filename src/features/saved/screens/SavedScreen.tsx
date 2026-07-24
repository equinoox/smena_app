// Saved — the worker's bookmarked shifts (tab hidden for venues).
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListingList } from "@shared/components/ListingList";
import { useSavedIds, useSavedListings, useToggleSaved } from "@shared/hooks/useSaved";
import { useTranslation } from "@shared/i18n/I18nProvider";
import type { ListingWithVenue } from "@shared/types/domain.types";

export function SavedScreen() {
  const { t } = useTranslation();
  const saved = useSavedListings();
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  const header = (
    <View className="pb-4 pt-2">
      <Text className="font-sans-extrabold text-2xl text-text-primary">
        {t("saved.title")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ListingList
        listings={saved.data ?? []}
        isLoading={saved.isLoading}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        header={header}
        emptyTitle={t("saved.empty")}
        emptyDescription={t("saved.emptyDesc")}
      />
    </SafeAreaView>
  );
}
