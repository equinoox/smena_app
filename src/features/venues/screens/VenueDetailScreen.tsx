// Venue detail — worker-facing read-only view of a venue's profile: cover banner, logo,
// basic info (type/location/phone/description), a rating summary/CTA, and its open
// listings. Reached by tapping a venue's name on a listing. Mirrors VenueProfileScreen's
// layout (the venue's own view of the same data) minus the edit affordance, plus a
// contact bar like ListingDetailScreen.
import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";
import { CaretLeft, ChatCircle, Coffee, MapPin, Phone } from "phosphor-react-native";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@shared/components/Button";
import { EmptyState } from "@shared/components/EmptyState";
import { ListingCard } from "@shared/components/ListingCard";
import { Loader } from "@shared/components/Loader";
import { RatingSummary } from "@shared/components/RatingSummary";
import { SmartCoverImage } from "@shared/components/SmartCoverImage";
import { StarRatingBadge } from "@shared/components/StarRatingBadge";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { formatLocation } from "@shared/lib/format";
import { useVenueListings } from "@features/listings/hooks/useListings";
import { RateVenueModal } from "@features/venues/components/RateVenueModal";
import { useMyVenueRating } from "@features/venues/hooks/useMyVenueRating";
import { useVenueProfile } from "@features/venues/hooks/useVenueProfile";

export function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { role } = useUserRole();
  const [rateModalVisible, setRateModalVisible] = useState(false);

  const { data: venue, isLoading } = useVenueProfile(id ?? "");
  const { data: myRating } = useMyVenueRating(id ?? "");
  const listings = useVenueListings(venue?.id);
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  const activeListings = useMemo(
    () => (listings.data ?? []).filter((listing) => listing.status === "open"),
    [listings.data],
  );

  if (isLoading) return <Loader />;
  if (!venue) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
        <EmptyState title={t("venueDetail.notFound")} />
      </SafeAreaView>
    );
  }

  const location = formatLocation(venue.address, venue.city);
  const venuePhone = venue.phone;

  const onMessageVenue = () => {
    if (!venuePhone) {
      toast.error(t("listingDetail.noPhone"));
      return;
    }
    Linking.openURL(`sms:${venuePhone}`);
  };

  const onCallVenue = () => {
    if (!venuePhone) {
      toast.error(t("listingDetail.noPhone"));
      return;
    }
    Linking.openURL(`tel:${venuePhone}`);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ aspectRatio: 1.8 }} className="w-full bg-bg-surface-alt">
          {venue.cover_photo_url ? (
            <SmartCoverImage
              uri={venue.cover_photo_url}
              aspectRatio={1.8}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
          ) : null}
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="absolute left-3 top-3 h-10 w-10 items-center justify-center rounded-input bg-bg-canvas/70"
          >
            <CaretLeft size={20} color={colors.textPrimary} />
          </Pressable>
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

          <View className="mt-4">
            <RatingSummary
              ratingAvg={venue.rating_avg}
              ratingCount={venue.rating_count}
              title={t("rating.overall")}
              noRatingsLabel={t("rating.noRatingsYet")}
              countLabel={t("rating.count", { count: venue.rating_count })}
              onRatePress={
                role === "worker" ? () => setRateModalVisible(true) : undefined
              }
              rateButtonLabel={
                myRating ? t("rating.editRating") : t("rating.rateVenue")
              }
            />
          </View>

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
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  variant="compact"
                  saved={savedIds.has(listing.id)}
                  onToggleSave={() =>
                    toggleSaved.mutate({
                      listingId: listing.id,
                      saved: savedIds.has(listing.id),
                    })
                  }
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View className="flex-row items-center gap-3 border-t border-border-default bg-bg-surface px-4 py-3">
        <Pressable
          onPress={onMessageVenue}
          className="h-12 w-12 items-center justify-center rounded-button border border-border-default"
        >
          <ChatCircle size={22} color={colors.textPrimary} />
        </Pressable>
        <View className="flex-1">
          <Button
            label={t("listingDetail.callVenue")}
            onPress={onCallVenue}
            leftIcon={<Phone size={18} color={colors.onBrand} weight="fill" />}
            size="lg"
          />
        </View>
      </View>

      <RateVenueModal
        visible={rateModalVisible}
        onClose={() => setRateModalVisible(false)}
        venueId={venue.id}
      />
    </SafeAreaView>
  );
}
