// Worker listings — browse open shifts with an employment-type filter + save toggles.
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "@shared/components/Chip";
import { ListingList } from "@shared/components/ListingList";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import type { EmploymentType } from "@shared/types/database.types";
import type { ListingWithVenue } from "@shared/types/domain.types";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useListings } from "@features/listings/hooks/useListings";

type Filter = EmploymentType | "all";
const FILTERS: Filter[] = ["all", "fill_in", "part_time", "full_time"];

export function WorkerListingsView() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");
  const listings = useListings({ employmentType: filter });
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  const filterLabel = (f: Filter) =>
    f === "all" ? t("listings.filterAll") : t(`employment.${f}` as TranslationKey);

  const header = (
    <View className="pb-4 pt-2">
      <Text className="font-sans-extrabold text-2xl text-text-primary">
        {t("listings.browse")}
      </Text>
      <View className="mt-4 flex-row flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={filterLabel(f)}
            variant={filter === f ? "active" : "neutral"}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>
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
        emptyTitle={t("listings.noResults")}
      />
    </SafeAreaView>
  );
}
