// Worker listings — browse open shifts: title + platform-wide active count, quick filter
// chips (employment type; "Filters"/"Near me" are placeholders — see below), compact cards.
import { useState } from "react";
import { MapPin, Sliders } from "phosphor-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "@shared/components/Chip";
import { ListingList } from "@shared/components/ListingList";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import type { EmploymentType } from "@shared/types/database.types";
import type { ListingWithVenue } from "@shared/types/domain.types";
import { useListings, useOpenListingsCount } from "@features/listings/hooks/useListings";

type Filter = EmploymentType | "all";
const FILTERS: Filter[] = ["all", "fill_in", "part_time", "full_time"];

export function WorkerListingsView() {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const [filter, setFilter] = useState<Filter>("all");
  const listings = useListings({ employmentType: filter });
  const activeCount = useOpenListingsCount();
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  const filterLabel = (f: Filter) =>
    f === "all" ? t("listings.filterAll") : t(`employment.${f}` as TranslationKey);

  const comingSoon = () => toast.info(t("common.comingSoon"));

  const header = (
    <View className="pb-4 pt-2">
      <View className="flex-row items-end justify-between">
        <Text className="font-sans-extrabold text-2xl text-text-primary">
          {t("listings.title")}
        </Text>
        {activeCount.data != null ? (
          <Text className="font-sans-medium text-sm text-text-tertiary">
            {t("listings.activeCount", { count: activeCount.data })}
          </Text>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="mt-4 gap-2 pr-4"
      >
        {/* "Filters" and "Near me" are placeholders: a full filter sheet and
            distance-based sorting (needs device GPS) aren't built yet. */}
        <Chip
          label={t("listings.filters")}
          variant="active"
          leftIcon={<Sliders size={14} weight="bold" color={colors.onBrand} />}
          onPress={comingSoon}
        />
        <Chip
          label={t("listings.nearMe")}
          variant="neutral"
          leftIcon={<MapPin size={14} color={colors.textMuted} />}
          onPress={comingSoon}
        />
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={filterLabel(f)}
            variant={filter === f ? "active" : "neutral"}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>
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
        cardVariant="compact"
      />
    </SafeAreaView>
  );
}
