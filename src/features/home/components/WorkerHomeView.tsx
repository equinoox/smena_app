// Worker home — greeting + "recommended near you" list with save toggles.
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListingList } from "@shared/components/ListingList";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useListings } from "@features/listings/hooks/useListings";
import type { ListingWithVenue } from "@shared/types/domain.types";

export function WorkerHomeView({ name }: { name?: string | null }) {
  const { t } = useTranslation();
  const listings = useListings({ employmentType: "all" });
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  const header = (
    <View className="pb-4 pt-2">
      <Text className="font-sans text-base text-text-tertiary">
        {t("home.greeting")}
        {name ? `, ${name}` : ""}
      </Text>
      <Text className="mt-4 font-sans-bold text-xl text-text-primary">
        {t("home.recommendedNearYou")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ListingList
        listings={listings.data ?? []}
        isLoading={listings.isLoading}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        header={header}
        emptyTitle={t("home.empty")}
      />
    </SafeAreaView>
  );
}
