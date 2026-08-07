// Venue home — dashboard: greeting, this-week stats, "post a shift" CTA, and the venue's
// most recent listings (candidates + views per listing).
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ArrowRight, Bell, Coffee, Plus } from "phosphor-react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@shared/components/Avatar";
import { Chip } from "@shared/components/Chip";
import { EditableLocationRow } from "@shared/components/EditableLocationRow";
import { EmptyState } from "@shared/components/EmptyState";
import { WorkerRow } from "@shared/components/WorkerRow";
import { useMyVenue } from "@shared/hooks/useMyVenue";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useUpdateVenueLocation } from "@shared/hooks/useUpdateLocation";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { haversineDistanceKm } from "@shared/lib/geo";
import { useListingCounts } from "@features/listings/hooks/useListingViews";
import { useVenueListings, useVenueStats } from "@features/listings/hooks/useListings";
import { useAvailableWorkers } from "@features/home/hooks/useAvailableWorkers";
import { VenueListingRow } from "@features/home/components/VenueListingRow";
import { cn } from "@shared/lib/cn";

function greetingKey(): TranslationKey {
  const hour = new Date().getHours();
  if (hour < 11) return "home.greetingMorning";
  if (hour < 18) return "home.greetingAfternoon";
  return "home.greetingEvening";
}

function StatCard({
  value,
  label,
  valueClassName,
  isLoading,
}: {
  value: number;
  label: string;
  valueClassName: string;
  isLoading: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center rounded-card border border-border-default bg-bg-surface-alt p-3">
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.textMuted} />
      ) : (
        <Text className={cn("font-sans-extrabold text-2xl", valueClassName)}>
          {value}
        </Text>
      )}
      <Text className="mt-1 text-center font-sans-medium text-xs text-text-tertiary">
        {label}
      </Text>
    </View>
  );
}

export function VenueHomeView() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { venue } = useMyVenue();
  const { profile } = useUserRole();
  const listings = useVenueListings(venue?.id);
  const stats = useVenueStats(venue?.id);
  const availableWorkers = useAvailableWorkers();
  const updateLocation = useUpdateVenueLocation(venue?.id);

  const recentListings = useMemo(
    () => (listings.data ?? []).slice(0, 2),
    [listings.data],
  );
  const recentListingIds = useMemo(
    () => recentListings.map((l) => l.id),
    [recentListings],
  );
  const counts = useListingCounts(recentListingIds);

  // Nearest first when the venue's own location is known; workers without a location
  // of their own (pre-existing edge case) keep their original order, appended last.
  const rankedAvailableWorkers = useMemo(() => {
    const all = availableWorkers.data ?? [];
    if (venue?.lat == null || venue?.lng == null) {
      return all.map((worker) => ({ worker, distanceKm: undefined }));
    }

    const withDistance: { worker: (typeof all)[number]; distanceKm: number }[] = [];
    const withoutLocation: { worker: (typeof all)[number]; distanceKm: undefined }[] = [];

    for (const worker of all) {
      if (worker.lat != null && worker.lng != null) {
        withDistance.push({
          worker,
          distanceKm: haversineDistanceKm(
            { lat: venue.lat, lng: venue.lng },
            { lat: worker.lat, lng: worker.lng },
          ),
        });
      } else {
        withoutLocation.push({ worker, distanceKm: undefined });
      }
    }
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
    return [...withDistance, ...withoutLocation];
  }, [availableWorkers.data, venue?.lat, venue?.lng]);

  const comingSoon = () => toast.info(t("common.comingSoon"));

  return (
    <View className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Slightly different background than the screen — visually groups identity/stats.
            Its own top padding (rather than a SafeAreaView on the screen) absorbs the status
            bar inset, so this surface color extends up behind it on Android's edge-to-edge
            display instead of leaving a seam where bg-bg-screen would otherwise show through. */}
        <View
          className="-mx-4 bg-bg-surface px-4 pb-5"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="flex-row items-center justify-between pb-4">
            <View className="flex-1 flex-row items-center gap-3">
              {venue?.logo_url ? (
                <Avatar uri={venue.logo_url} size={44} />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-input bg-brand">
                  <Coffee size={22} weight="fill" color={colors.onBrand} />
                </View>
              )}
              <View className="min-w-0 flex-1">
                <Text className="font-sans text-sm text-text-tertiary">
                  {t(greetingKey())},
                </Text>
                <Text
                  className="font-sans-extrabold text-lg text-text-primary"
                  numberOfLines={1}
                >
                  {profile?.full_name ?? venue?.name ?? t("home.forVenues")}
                </Text>
                {venue ? (
                  <EditableLocationRow
                    className="mt-0.5"
                    address={venue.address}
                    currentValue={
                      venue.address && venue.lat != null && venue.lng != null
                        ? {
                            address: venue.address,
                            city: venue.city,
                            lat: venue.lat,
                            lng: venue.lng,
                          }
                        : undefined
                    }
                    onChangeLocation={(value) => updateLocation.mutateAsync(value)}
                  />
                ) : null}
              </View>
            </View>
            <Pressable
              onPress={comingSoon}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-input border border-border-default bg-bg-surface-alt"
            >
              <Bell size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            <StatCard
              value={stats.data?.activeListings ?? 0}
              label={t("home.activeListings")}
              valueClassName="text-text-primary"
              isLoading={stats.isLoading}
            />
            <StatCard
              value={stats.data?.weeklyApplications ?? 0}
              label={t("home.newApplications")}
              valueClassName="text-brand"
              isLoading={stats.isLoading}
            />
            <StatCard
              value={stats.data?.weeklyViews ?? 0}
              label={t("home.viewsThisWeek")}
              valueClassName="text-info"
              isLoading={stats.isLoading}
            />
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/listing-create")}
          className="mt-5 flex-row items-center gap-3 rounded-card-lg bg-brand p-4 active:opacity-90"
        >
          <View className="h-11 w-11 items-center justify-center rounded-input bg-on-brand/20">
            <Plus size={22} weight="bold" color={colors.onBrand} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-base text-on-brand">
              {t("home.postShiftTitle")}
            </Text>
            <Text className="mt-0.5 font-sans-medium text-xs text-on-brand/80">
              {t("home.postShiftSubtitle")}
            </Text>
          </View>
          <ArrowRight size={20} weight="bold" color={colors.onBrand} />
        </Pressable>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="font-sans-bold text-xl text-text-primary">
            {t("home.yourListings")}
          </Text>
          <Pressable onPress={() => router.push("/listings")} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-brand">
              {t("common.seeAll")}
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 gap-3">
          {recentListings.length === 0 && !listings.isLoading ? (
            <EmptyState title={t("home.empty")} />
          ) : (
            recentListings.map((listing) => (
              <VenueListingRow
                key={listing.id}
                listing={listing}
                candidateCount={counts.data?.[listing.id]?.applications ?? 0}
                viewCount={counts.data?.[listing.id]?.views ?? 0}
              />
            ))
          )}
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="font-sans-bold text-xl text-text-primary">
            {t("home.availableWorkers")}
          </Text>
          <Pressable onPress={() => router.push("/workers")} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-brand">
              {t("common.seeAll")}
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 gap-3">
          {rankedAvailableWorkers.length === 0 && !availableWorkers.isLoading ? (
            <EmptyState title={t("home.noWorkersAvailable")} />
          ) : (
            rankedAvailableWorkers.map(({ worker, distanceKm }) => (
              <WorkerRow
                key={worker.id}
                worker={worker}
                distanceKm={distanceKm}
                trailing={<Chip label={t("home.availableTag")} variant="success" />}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
