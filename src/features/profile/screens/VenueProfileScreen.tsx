// Venue profile — one lokal's own business profile: cover banner, logo, details, and its
// active listings. Takes an explicit venueId (rather than assuming "the" venue) so it works
// both as the venue-profile tab (owner's sole venue) and as a pushed screen opened from the
// "Moji lokali" list (one of several). The edit button opens the pre-filled edit-venue form;
// the "+" button next to it starts the add-venue wizard.
import { useMemo } from "react";
import { useRouter } from "expo-router";
import {
  CaretLeft,
  CaretRight,
  Clock,
  Coffee,
  MapPin,
  PencilSimple,
  Phone,
  Plus,
} from "phosphor-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "@shared/components/Chip";
import { EmptyState } from "@shared/components/EmptyState";
import { Loader } from "@shared/components/Loader";
import { SmartCoverImage } from "@shared/components/SmartCoverImage";
import { StarRatingBadge } from "@shared/components/StarRatingBadge";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { employmentChipVariant, formatLocation, formatTimeRange } from "@shared/lib/format";
import { roleIcon } from "@shared/lib/roleIcon";
import type { ListingWithVenue } from "@shared/types/domain.types";
import { useVenueProfile } from "@features/venues/hooks/useVenueProfile";
import { useVenueListings } from "@features/listings/hooks/useListings";

function ActiveListingRow({ listing }: { listing: ListingWithVenue }) {
  const router = useRouter();
  const colors = useThemeColors();
  const { t, language } = useTranslation();

  const roleLabel = t(`roles.${listing.role_needed}` as TranslationKey);
  const employmentLabel = t(
    `employment.${listing.employment_type}` as TranslationKey,
  );
  const time = formatTimeRange(listing.start_hour, listing.end_hour, language);
  const title = listing.title || roleLabel;
  const RoleIcon = roleIcon[listing.role_needed];

  return (
    <Pressable
      onPress={() => router.push(`/listing/${listing.id}`)}
      className="flex-row items-center gap-3 rounded-input border border-border-default bg-bg-surface p-3 active:opacity-90"
    >
      <View className="h-11 w-11 items-center justify-center rounded-input bg-bg-icon-tint">
        <RoleIcon size={20} weight="bold" color={colors.brand} />
      </View>
      <View className="min-w-0 flex-1">
        <Text
          className="font-sans-bold text-[15px] text-text-primary"
          numberOfLines={1}
        >
          {title}
        </Text>
        <View className="mt-1.5 flex-row flex-wrap items-center gap-2">
          <Chip
            label={employmentLabel}
            variant={employmentChipVariant(listing.employment_type)}
          />
          <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt px-2 py-1">
            <Clock size={12} color={colors.textMuted} />
            <Text className="font-sans-semibold text-xs text-text-secondary">
              {time ?? t("listingDetail.byAgreement")}
            </Text>
          </View>
        </View>
      </View>
      <CaretRight size={18} color={colors.textMuted} />
    </Pressable>
  );
}

type VenueProfileScreenProps = {
  venueId: string;
  // Set when pushed from the "Moji lokali" list (as opposed to being the venue-profile
  // tab's own root screen, which needs no way back).
  onBack?: () => void;
};

export function VenueProfileScreen({ venueId, onBack }: VenueProfileScreenProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  // Fetch the venue and its listings in parallel (both keyed off venueId) instead of
  // waiting for the venue fetch to resolve before even starting the listings fetch —
  // cuts a full sequential round-trip off the loading time.
  const { data: venue, isLoading } = useVenueProfile(venueId);
  const listings = useVenueListings(venueId);

  const activeListings = useMemo(
    () => (listings.data ?? []).filter((listing) => listing.status === "open"),
    [listings.data],
  );

  if (isLoading || !venue) return <Loader />;

  const location = formatLocation(venue.address, venue.city);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ aspectRatio: 1.8 }}
          className="w-full items-center justify-center bg-bg-surface-alt"
        >
          {venue.cover_photo_url ? (
            <SmartCoverImage
              uri={venue.cover_photo_url}
              aspectRatio={1.8}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
          ) : (
            <Text className="font-sans-bold text-[10px] tracking-widest text-text-muted">
              {t("profile.coverPhoto").toUpperCase()}
            </Text>
          )}
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={10}
              className="absolute left-3 top-3 h-10 w-10 items-center justify-center rounded-input bg-bg-canvas/70"
            >
              <CaretLeft size={20} color={colors.textPrimary} />
            </Pressable>
          ) : null}
          <View className="absolute right-3 top-3 flex-row gap-2">
            <Pressable
              onPress={() => router.push("/venue-create")}
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
            >
              <Plus size={18} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => router.push(`/venue-profile-edit?id=${venue.id}`)}
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
            >
              <PencilSimple size={18} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View className="px-4">
          <View className="-mt-8">
            {venue.logo_url ? (
              <Image
                source={{ uri: venue.logo_url }}
                className="h-16 w-16 rounded-input bg-bg-surface"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-input bg-brand">
                <Coffee size={30} weight="fill" color={colors.onBrand} />
              </View>
            )}
          </View>

          <Text className="mt-3 font-sans-extrabold text-2xl text-text-primary">
            {venue.name}
          </Text>
          <View className="mt-1">
            <StarRatingBadge
              rating={venue.rating_avg}
              count={venue.rating_count}
              size="md"
            />
          </View>
          <Text className="mt-1.5 font-sans-semibold text-sm text-text-tertiary">
            {t(`venueTypes.${venue.venue_type}` as TranslationKey)}
          </Text>

          {location ? (
            <View className="mt-2 flex-row items-center gap-1.5">
              <MapPin size={14} weight="fill" color={colors.brand} />
              <Text className="flex-1 font-sans-semibold text-sm text-text-tertiary">
                {location}
              </Text>
            </View>
          ) : null}

          {venue.phone ? (
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <Phone size={14} weight="fill" color={colors.brand} />
              <Text className="flex-1 font-sans-semibold text-sm text-text-tertiary">
                {venue.phone}
              </Text>
            </View>
          ) : null}

          {venue.description ? (
            <Text className="mt-3 font-sans text-sm leading-5 text-text-secondary">
              {venue.description}
            </Text>
          ) : null}

          <View className="mt-6 flex-row items-center justify-between">
            <Text className="font-sans-bold text-xl text-text-primary">
              {t("home.activeListings")}
            </Text>
            <Text className="font-sans-extrabold text-lg text-brand">
              {activeListings.length}
            </Text>
          </View>

          <View className="mt-3 gap-3">
            {listings.isLoading ? (
              <ActivityIndicator color={colors.brand} />
            ) : activeListings.length === 0 ? (
              <EmptyState title={t("home.empty")} />
            ) : (
              activeListings.map((listing) => (
                <ActiveListingRow key={listing.id} listing={listing} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
