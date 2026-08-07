// Worker listings — browse open shifts: title + platform-wide active count, quick
// employment-type chips, a real filter modal (position/employment/pay/proximity), compact
// cards. Reached only via "See all" pushes (no tab bar item), so it carries its own back arrow.
import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  // Set only when pushed from the home "Privremeni poslovi" shelf's "See all" — pins
  // this view to venue-less listings instead of the normal full browse.
  const { noVenueOnly: noVenueOnlyParam } = useLocalSearchParams<{ noVenueOnly?: string }>();
  const noVenueOnly = noVenueOnlyParam === "1";
  const [filters, setFilters] = useState<ListingsFilterValues>(DEFAULT_LISTINGS_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const listings = useListings({
    employmentType: filters.employmentType,
    roleNeeded: filters.roleNeeded,
    noVenueOnly,
  });
  const activeCount = useOpenListingsCount();
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  const filterLabel = (f: QuickFilter) =>
    f === "all" ? t("listings.filterAll") : t(`employment.${f}` as TranslationKey);

  // A venue-less listing can never be full_time (see the DB check constraint) — no
  // point offering a quick filter that would always come back empty here.
  const quickFilters = noVenueOnly
    ? QUICK_FILTERS.filter((f) => f !== "full_time")
    : QUICK_FILTERS;

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
        const lat = l.venue?.lat ?? l.lat;
        const lng = l.venue?.lng ?? l.lng;
        if (lat == null || lng == null) return false;
        return haversineDistanceKm(origin, { lat, lng }) <= maxDistanceKm;
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
          {noVenueOnly ? t("listings.temporaryJobsTitle") : t("listings.title")}
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
        {quickFilters.map((f) => (
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
