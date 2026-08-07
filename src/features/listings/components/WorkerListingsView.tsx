// Worker listings — browse open shifts: title + platform-wide active count, quick
// employment-type chips, a real filter modal (position/employment/pay/proximity), compact
// cards. Reached only via "See all" pushes (no tab bar item), so it carries its own back arrow.
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { CaretLeft, Sliders } from "phosphor-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "@shared/components/Chip";
import { ListingList } from "@shared/components/ListingList";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { haversineDistanceKm } from "@shared/lib/geo";
import type { EmploymentType } from "@shared/types/database.types";
import type { ListingWithVenue } from "@shared/types/domain.types";
import {
  DEFAULT_LISTINGS_FILTERS,
  ListingsFilterModal,
  type ListingsFilterValues,
} from "@features/listings/components/ListingsFilterModal";
import { useListings, useOpenListingsCount } from "@features/listings/hooks/useListings";

type QuickFilter = EmploymentType | "all";
const QUICK_FILTERS: QuickFilter[] = ["all", "fill_in", "part_time", "full_time"];

export function WorkerListingsView() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { profile } = useUserRole();
  const [filters, setFilters] = useState<ListingsFilterValues>(DEFAULT_LISTINGS_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const listings = useListings({
    employmentType: filters.employmentType,
    roleNeeded: filters.roleNeeded,
  });
  const activeCount = useOpenListingsCount();
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  const filterLabel = (f: QuickFilter) =>
    f === "all" ? t("listings.filterAll") : t(`employment.${f}` as TranslationKey);

  // Position/employment already filtered server-side (useListings above); pay and
  // proximity have no query param (no PostGIS) so they're applied here instead.
  const displayedListings = useMemo(() => {
    let result = listings.data ?? [];
    if (filters.minPay != null) {
      const minPay = filters.minPay;
      result = result.filter((l) => l.pay_amount != null && l.pay_amount >= minPay);
    }
    if (filters.maxDistanceKm != null && profile?.lat != null && profile?.lng != null) {
      const origin = { lat: profile.lat, lng: profile.lng };
      const maxDistanceKm = filters.maxDistanceKm;
      result = result.filter((l) => {
        if (l.venue?.lat == null || l.venue?.lng == null) return false;
        return (
          haversineDistanceKm(origin, { lat: l.venue.lat, lng: l.venue.lng }) <=
          maxDistanceKm
        );
      });
    }
    return result;
  }, [listings.data, filters.minPay, filters.maxDistanceKm, profile?.lat, profile?.lng]);

  const hasActiveFilters =
    !!filters.roleNeeded ||
    filters.employmentType !== "all" ||
    filters.minPay != null ||
    filters.maxDistanceKm != null;

  // Badges for filters with no other on-screen indicator (employmentType already
  // reflects in the quick-filter chips below, so it's left out here).
  const activeFilterBadges: { key: string; label: string }[] = [];
  if (filters.roleNeeded) {
    activeFilterBadges.push({
      key: "role",
      label: t(`roles.${filters.roleNeeded}` as TranslationKey),
    });
  }
  if (filters.minPay != null) {
    activeFilterBadges.push({
      key: "minPay",
      label: t("listings.minPayBadge", {
        amount: filters.minPay.toLocaleString("sr-RS"),
      }),
    });
  }
  if (filters.maxDistanceKm != null) {
    activeFilterBadges.push({ key: "distance", label: `< ${filters.maxDistanceKm} km` });
  }

  const header = (
    <View className="pb-4 pt-2">
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <View className="mt-4 flex-row items-end justify-between">
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
        <Chip
          label={t("listings.filters")}
          variant={hasActiveFilters ? "active" : "neutral"}
          leftIcon={
            <Sliders
              size={14}
              weight="bold"
              color={hasActiveFilters ? colors.onBrand : colors.textMuted}
            />
          }
          onPress={() => setFilterModalVisible(true)}
        />
        {activeFilterBadges.map((badge) => (
          <Chip
            key={badge.key}
            label={badge.label}
            variant="active"
            onPress={() => setFilterModalVisible(true)}
          />
        ))}
        {QUICK_FILTERS.map((f) => (
          <Chip
            key={f}
            label={filterLabel(f)}
            variant={filters.employmentType === f ? "active" : "neutral"}
            onPress={() => setFilters({ ...filters, employmentType: f })}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ListingList
        listings={displayedListings}
        isLoading={listings.isLoading}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        header={header}
        emptyTitle={t("listings.noResults")}
        cardVariant="compact"
      />

      <ListingsFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}
