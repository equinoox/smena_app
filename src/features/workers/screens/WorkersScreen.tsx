// Workers — venue-facing browse-all-workers screen, reached via "Prikaži sve" from the
// Home dashboard's "Available workers" section. Available workers sort first (query's
// own ordering), then everyone else. Filtering (position/experience/proximity) is
// applied client-side over the fetched list — see WorkersFilterModal.
import { useRouter } from "expo-router";
import { CaretLeft, Sliders } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "@shared/components/Chip";
import { EmptyState } from "@shared/components/EmptyState";
import { Loader } from "@shared/components/Loader";
import { WorkerRow } from "@shared/components/WorkerRow";
import { useActiveVenue } from "@shared/hooks/useActiveVenue";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { haversineDistanceKm } from "@shared/lib/geo";
import { useAllWorkers } from "@features/workers/hooks/useAllWorkers";
import {
  DEFAULT_WORKERS_FILTERS,
  WorkersFilterModal,
  type WorkersFilterValues,
} from "@features/workers/components/WorkersFilterModal";

export function WorkersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { venue } = useActiveVenue();
  const workers = useAllWorkers();
  const [filters, setFilters] = useState<WorkersFilterValues>(DEFAULT_WORKERS_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const displayedWorkers = useMemo(() => {
    let result = workers.data ?? [];
    if (filters.role) {
      const role = filters.role;
      result = result.filter((w) => w.worker_roles.includes(role));
    }
    if (filters.experienceLevel) {
      const level = filters.experienceLevel;
      result = result.filter((w) => w.experience_level === level);
    }
    if (filters.maxDistanceKm != null && venue?.lat != null && venue?.lng != null) {
      const origin = { lat: venue.lat, lng: venue.lng };
      const maxDistanceKm = filters.maxDistanceKm;
      result = result.filter((w) => {
        if (w.lat == null || w.lng == null) return false;
        return haversineDistanceKm(origin, { lat: w.lat, lng: w.lng }) <= maxDistanceKm;
      });
    }
    return result;
  }, [workers.data, filters, venue?.lat, venue?.lng]);

  const hasActiveFilters =
    !!filters.role || !!filters.experienceLevel || filters.maxDistanceKm != null;

  // Badges for each currently-applied filter — empty (nothing shown) when everything
  // is at its default value.
  const activeFilterBadges: { key: string; label: string }[] = [];
  if (filters.role) {
    activeFilterBadges.push({ key: "role", label: t(`roles.${filters.role}` as TranslationKey) });
  }
  if (filters.experienceLevel) {
    activeFilterBadges.push({
      key: "experience",
      label: t(`experience.${filters.experienceLevel}` as TranslationKey),
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

      <Text className="mt-4 font-sans-extrabold text-2xl text-text-primary">
        {t("workers.title")}
      </Text>

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
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <FlatList
        data={workers.isLoading ? [] : displayedWorkers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          workers.isLoading ? (
            <Loader />
          ) : (
            <EmptyState title={t("workers.empty")} />
          )
        }
        renderItem={({ item }) => (
          <WorkerRow
            worker={item}
            trailing={
              item.is_available ? (
                <Chip label={t("home.availableTag")} variant="success" />
              ) : undefined
            }
          />
        )}
      />

      <WorkersFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}
