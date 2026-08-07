// Worker home — greeting/search/role-filter header + "recommended near you" list.
// "Recommended" (the default view, no search/role filter active) is the 3 nearest open
// listings to the worker's own home location, nearest first. Searching or filtering by
// role switches to plain matching results (unranked, uncapped) — that's browse mode,
// not "recommended".
import { useRouter } from "expo-router";
import { Bell, MagnifyingGlass, MapPin, Timer, X } from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip } from "@shared/components/Chip";
import { Input } from "@shared/components/Input";
import { ListingCard } from "@shared/components/ListingCard";
import { ListingList } from "@shared/components/ListingList";
import { WorkerIdentityBar } from "@shared/components/WorkerIdentityBar";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useUpdateWorkerLocation } from "@shared/hooks/useUpdateLocation";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { haversineDistanceKm } from "@shared/lib/geo";
import { roleIcon, WORKER_ROLES } from "@shared/lib/roleIcon";
import type { Profile, WorkerRole } from "@shared/types/database.types";
import type { ListingWithVenue } from "@shared/types/domain.types";
import { useListings } from "@features/listings/hooks/useListings";

const NEARBY_COUNT = 3;
const TEMP_JOBS_COUNT = 5;

export function WorkerHomeView({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<WorkerRole | null>(null);

  // Debounce the search box so we don't refetch on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const listings = useListings({
    employmentType: "all",
    search,
    roleNeeded: roleFilter ?? undefined,
  });
  // A separate small shelf for venue-less (temporary-job) listings — orthogonal to the
  // main search/role filters above, so it's fetched independently.
  const tempJobs = useListings({ employmentType: "all", noVenueOnly: true });
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();
  const updateLocation = useUpdateWorkerLocation();

  // Feedback starts on the keystroke, not when the debounce fires — otherwise the field
  // looks idle for 300ms. `isPlaceholderData` covers the fetch that follows (see useListings:
  // the old results stay visible meanwhile, so this indicator is the only "working" cue).
  const isSearching = searchInput !== search || listings.isPlaceholderData;

  // "Recommended near you" / "See all" don't make sense above a "nothing matches your
  // search" result — only show them once we have a confirmed (non-stale, non-loading)
  // zero-result count for an actual search term.
  const searchHasNoResults =
    !!search && !listings.isLoading && !listings.isPlaceholderData &&
    (listings.data?.length ?? 0) === 0;

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  // "Recommended" only applies to the unfiltered default view — once the worker
  // searches or picks a role chip, that's browse mode: show every match, unranked.
  const isDefaultView = !search && !roleFilter;
  const workerLat = profile?.lat;
  const workerLng = profile?.lng;

  const displayedListings = useMemo(() => {
    const all = listings.data ?? [];
    if (!isDefaultView || workerLat == null || workerLng == null) return all;

    return all
      .filter((listing) => listing.venue?.lat != null && listing.venue?.lng != null)
      .map((listing) => ({
        ...listing,
        distanceKm: haversineDistanceKm(
          { lat: workerLat, lng: workerLng },
          { lat: listing.venue!.lat!, lng: listing.venue!.lng! },
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, NEARBY_COUNT);
  }, [listings.data, isDefaultView, workerLat, workerLng]);

  const displayedTempJobs = useMemo(
    () => (tempJobs.data ?? []).slice(0, TEMP_JOBS_COUNT),
    [tempJobs.data],
  );

  const header = (
    <View className="pb-4">
      {/* Slightly different background than the screen — visually groups identity/search/filters.
          Its own top padding (rather than a SafeAreaView on the screen) absorbs the status bar
          inset, so this surface color extends up behind it on Android's edge-to-edge display
          instead of leaving a seam where the screen's bg-bg-screen would otherwise show through. */}
      <View
        className="-mx-4 bg-bg-surface px-4 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <WorkerIdentityBar
          profile={profile}
          onChangeLocation={(value) => updateLocation.mutateAsync(value)}
          right={
            <Pressable
              onPress={() => toast.info(t("common.comingSoon"))}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-input border border-border-default bg-bg-surface-alt"
            >
              <Bell size={20} color={colors.textPrimary} />
            </Pressable>
          }
        />

        <View className="mt-4">
          <Input
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder={t("home.searchPlaceholder")}
            returnKeyType="search"
            autoCorrect={false}
            leftIcon={<MagnifyingGlass size={18} color={colors.textMuted} />}
            rightIcon={
              isSearching ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : searchInput ? (
                <Pressable
                  onPress={() => setSearchInput("")}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={t("common.clear")}
                >
                  <X size={16} weight="bold" color={colors.textMuted} />
                </Pressable>
              ) : undefined
            }
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mt-4 gap-2 pr-4"
        >
          {WORKER_ROLES.map((role) => {
            const RoleIcon = roleIcon[role];
            const selected = roleFilter === role;
            return (
              <Chip
                key={role}
                label={t(`roles.${role}` as TranslationKey)}
                variant={selected ? "active" : "neutral"}
                size="lg"
                leftIcon={
                  <RoleIcon
                    size={14}
                    weight="fill"
                    color={selected ? colors.onBrand : colors.textMuted}
                  />
                }
                onPress={() => setRoleFilter(selected ? null : role)}
              />
            );
          })}
        </ScrollView>
      </View>

      {!searchHasNoResults ? (
        <View className="mt-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-bg-icon-tint">
              <MapPin size={16} weight="fill" color={colors.brand} />
            </View>
            <Text className="font-sans-bold text-xl text-text-primary">
              {t("home.recommendedNearYou")}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/listings")} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-brand">
              {t("common.seeAll")}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  // A visually distinct "shelf" (tinted full-bleed band, horizontal scroll) below the
  // main recommended list — sets it apart as its own category rather than reading like
  // more of the same feed. Only shown in the default (unfiltered) view, same as
  // "recommended near you" above.
  const footer =
    isDefaultView && displayedTempJobs.length > 0 ? (
      <View className="-mx-4 mt-6 bg-bg-surface-alt px-4 py-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-accent-badge">
              <Timer size={16} weight="fill" color={colors.onAccent} />
            </View>
            <Text className="font-sans-bold text-xl text-text-primary">
              {t("home.temporaryJobs")}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/listings?noVenueOnly=1")} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-brand">
              {t("common.seeAll")}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mt-3 gap-3 pr-1"
        >
          {displayedTempJobs.map((listing) => (
            <View key={listing.id} className="w-64">
              <ListingCard
                listing={listing}
                variant="compact"
                saved={savedIds.has(listing.id)}
                onToggleSave={() => onToggleSave(listing)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    ) : undefined;

  return (
    <View className="flex-1 bg-bg-screen">
      <ListingList
        listings={displayedListings}
        isLoading={listings.isLoading}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        header={header}
        footer={footer}
        emptyTitle={
          search ? t("home.noSearchResults", { query: search }) : t("home.empty")
        }
        emptyDescription={search ? t("home.noSearchResultsHint") : undefined}
      />
    </View>
  );
}
