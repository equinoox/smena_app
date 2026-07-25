// Worker home — greeting/search/role-filter header + "recommended near you" list.
// "Recommended" has no real ranking logic yet: it's every open listing, newest/urgent
// first (same ordering fetchListings always uses) — only search (by venue name) and
// the role chips are real filters.
import { useRouter } from "expo-router";
import { Bell, MagnifyingGlass, MapPin } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@shared/components/Avatar";
import { Chip } from "@shared/components/Chip";
import { Input } from "@shared/components/Input";
import { ListingList } from "@shared/components/ListingList";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { roleIcon, WORKER_ROLES } from "@shared/lib/roleIcon";
import type { Profile, WorkerRole } from "@shared/types/database.types";
import type { ListingWithVenue } from "@shared/types/domain.types";
import { useListings } from "@features/listings/hooks/useListings";

export function WorkerHomeView({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();

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
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const onToggleSave = (listing: ListingWithVenue) =>
    toggleSaved.mutate({ listingId: listing.id, saved: savedIds.has(listing.id) });

  const header = (
    <View className="pb-4">
      {/* Slightly different background than the screen — visually groups identity/search/filters. */}
      <View className="-mx-4 bg-bg-surface px-4 pb-4 pt-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={44} />
            <View className="min-w-0 flex-1">
              <Text className="font-sans text-base text-text-tertiary" numberOfLines={1}>
                {t("home.greeting")}
                {profile?.full_name ? `, ${profile.full_name}` : ""} 👋
              </Text>
              {profile?.city ? (
                <View className="mt-0.5 flex-row items-center gap-1">
                  <MapPin size={13} weight="fill" color={colors.brand} />
                  <Text className="font-sans-semibold text-xs text-brand" numberOfLines={1}>
                    {profile.city}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={() => toast.info(t("common.comingSoon"))}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-input border border-border-default bg-bg-surface-alt"
          >
            <Bell size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View className="mt-4">
          <Input
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder={t("home.searchPlaceholder")}
            leftIcon={<MagnifyingGlass size={18} color={colors.textMuted} />}
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

      <View className="mt-5 flex-row items-center justify-between">
        <Text className="font-sans-bold text-xl text-text-primary">
          {t("home.recommendedNearYou")}
        </Text>
        <Pressable onPress={() => router.push("/listings")} hitSlop={8}>
          <Text className="font-sans-bold text-sm text-brand">
            {t("common.seeAll")}
          </Text>
        </Pressable>
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
        emptyTitle={t("home.empty")}
      />
    </SafeAreaView>
  );
}
