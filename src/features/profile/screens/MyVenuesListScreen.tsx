// Moji lokali — list of every venue the signed-in owner runs, shown once there's more
// than one (a single venue opens straight into its own profile instead, see
// VenueProfileTabScreen). Tapping a card opens that venue's profile; a separate action
// lets the owner switch which venue is "active" (drives Home + the create-listing default).
// The "+" button starts the add-venue wizard.
import { useRouter } from "expo-router";
import { Coffee, Plus } from "phosphor-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@shared/components/Card";
import { Chip } from "@shared/components/Chip";
import { Loader } from "@shared/components/Loader";
import { StarRatingBadge } from "@shared/components/StarRatingBadge";
import { useActiveVenue, useMyVenues, useSetActiveVenue } from "@shared/hooks/useActiveVenue";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { formatLocation } from "@shared/lib/format";
import type { Venue } from "@shared/types/database.types";

function VenueRow({ venue, isActive }: { venue: Venue; isActive: boolean }) {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const setActiveVenueId = useSetActiveVenue();
  const location = formatLocation(venue.address, venue.city);

  return (
    <Card onPress={() => router.push(`/venue-profile/${venue.id}`)} className="gap-3">
      <View className="flex-row items-center gap-3">
        {venue.logo_url ? (
          <Image source={{ uri: venue.logo_url }} className="h-12 w-12 rounded-input bg-bg-surface-alt" />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-input bg-brand">
            <Coffee size={22} weight="fill" color={colors.onBrand} />
          </View>
        )}
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="shrink font-sans-bold text-[15px] text-text-primary" numberOfLines={1}>
              {venue.name}
            </Text>
            <StarRatingBadge rating={venue.rating_avg} count={venue.rating_count} />
          </View>
          <Text className="font-sans-semibold text-xs text-text-tertiary" numberOfLines={1}>
            {t(`venueTypes.${venue.venue_type}` as TranslationKey)}
            {location ? ` · ${location}` : ""}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-border-default pt-3">
        {isActive ? (
          <Chip label={t("myVenues.active")} variant="active" />
        ) : (
          <Pressable onPress={() => setActiveVenueId(venue.id)} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-brand">
              {t("myVenues.setActive")}
            </Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

export function MyVenuesListScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { venues, isLoading } = useMyVenues();
  const { venue: activeVenue } = useActiveVenue();

  if (isLoading) return <Loader />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="font-sans-extrabold text-2xl text-text-primary">
          {t("myVenues.title")}
        </Text>
        <Pressable
          onPress={() => router.push("/venue-create")}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
        >
          <Plus size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {venues.map((venue) => (
          <VenueRow key={venue.id} venue={venue} isActive={venue.id === activeVenue?.id} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
