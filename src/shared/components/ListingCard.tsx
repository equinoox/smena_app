// ListingCard — reusable shift card (home, listings, saved), two variants:
// "photo" (venue photo banner, default) and "compact" (role icon, tighter — worker
// listings browse). Both share the same labeling/formatting logic below.
import { useRouter } from "expo-router";
import {
  ArrowRight,
  BookmarkSimple,
  Clock,
  Lightning,
  MapPin,
} from "phosphor-react-native";
import { Image as RNImage, Pressable, Text, View } from "react-native";
import { Avatar } from "@shared/components/Avatar";
import { Card } from "@shared/components/Card";
import { Chip } from "@shared/components/Chip";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import {
  employmentChipVariant,
  formatPostedAt,
  formatTimeRange,
} from "@shared/lib/format";
import { roleIcon } from "@shared/lib/roleIcon";
import type { ListingWithVenue } from "@shared/types/domain.types";

type ListingCardProps = {
  listing: ListingWithVenue;
  saved?: boolean;
  onToggleSave?: () => void;
  variant?: "photo" | "compact";
  // Preview usage (e.g. the create-listing form) renders a card for a listing that
  // doesn't exist yet — tapping it must not try to navigate to its (nonexistent) detail page.
  disableNavigation?: boolean;
};

export function ListingCard({
  listing,
  saved,
  onToggleSave,
  variant = "photo",
  disableNavigation,
}: ListingCardProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { t, language } = useTranslation();

  const roleLabel = t(`roles.${listing.role_needed}` as TranslationKey);
  const employmentLabel = t(
    `employment.${listing.employment_type}` as TranslationKey,
  );
  const time = formatTimeRange(listing.starts_at, listing.ends_at, language);
  const title = listing.title || roleLabel;
  const onPress = disableNavigation
    ? undefined
    : () => router.push(`/listing/${listing.id}`);

  if (variant === "compact") {
    const RoleIcon = roleIcon[listing.role_needed];
    return (
      <Card onPress={onPress} className="p-3">
        <View className="flex-row items-start justify-between">
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-input bg-bg-icon-tint">
              <RoleIcon size={20} weight="bold" color={colors.brand} />
            </View>
            <View className="min-w-0 flex-1">
              <Text
                className="font-sans-semibold text-xs text-text-tertiary"
                numberOfLines={1}
              >
                {listing.venue?.name ?? ""}
              </Text>
              <Text
                className="font-sans-extrabold text-base text-text-primary"
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
          </View>
          {onToggleSave ? (
            <Pressable onPress={onToggleSave} hitSlop={10} className="pl-2">
              <BookmarkSimple
                size={19}
                weight={saved ? "fill" : "regular"}
                color={saved ? colors.brand : colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <Chip
            label={employmentLabel}
            variant={employmentChipVariant(listing.employment_type)}
          />
          {time ? (
            <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt px-2.5 py-1.5">
              <Clock size={13} color={colors.textMuted} />
              <Text className="font-sans-semibold text-xs text-text-secondary">
                {time}
              </Text>
            </View>
          ) : null}
        </View>

        {listing.venue?.city ? (
          <View className="mt-2 flex-row items-center gap-1">
            <MapPin size={13} weight="fill" color={colors.textMuted} />
            <Text className="font-sans-semibold text-xs text-text-tertiary">
              {listing.venue.city}
            </Text>
          </View>
        ) : null}

        <View className="mt-3 flex-row items-center justify-between border-t border-border-default pt-3">
          <Text className="font-sans text-xs text-text-muted">
            {formatPostedAt(listing.created_at, t)}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="font-sans-bold text-sm text-brand">
              {t("listings.viewDetails")}
            </Text>
            <ArrowRight size={14} weight="bold" color={colors.brand} />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} padded={false} className="mx-1.5">
      <View className="h-40 w-full items-center justify-center bg-bg-surface-alt">
        {listing.venue?.logo_url ? (
          <RNImage
            source={{ uri: listing.venue.logo_url }}
            resizeMode="cover"
            className="h-40 w-full"
          />
        ) : (
          <Text className="font-sans-bold text-[10px] tracking-widest text-text-muted">
            {t("listings.venuePhotoPlaceholder").toUpperCase()}
          </Text>
        )}
        {listing.is_urgent ? (
          <View className="absolute bottom-2 left-2">
            <Chip
              label={t("listings.urgent")}
              variant="urgent"
              size="lg"
              leftIcon={<Lightning size={14} weight="fill" color={colors.onAccent} />}
            />
          </View>
        ) : null}
      </View>

      <View className="bg-bg-canvas p-4">
        <View className="flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Avatar uri={listing.venue?.logo_url} name={listing.venue?.name} size={22} />
            <Text
              className="flex-1 font-sans-semibold text-xs text-text-tertiary"
              numberOfLines={1}
            >
              {listing.venue?.name ?? ""}
            </Text>
          </View>
          {onToggleSave ? (
            <Pressable onPress={onToggleSave} hitSlop={10} className="pl-2">
              <BookmarkSimple
                size={19}
                weight={saved ? "fill" : "regular"}
                color={saved ? colors.brand : colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        <Text
          className="mt-1 font-sans-extrabold text-[17px] text-text-primary"
          numberOfLines={1}
        >
          {title}
        </Text>

        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <Chip
            label={employmentLabel}
            variant={employmentChipVariant(listing.employment_type)}
          />
          {listing.venue?.city ? (
            <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt px-2.5 py-1.5">
              <MapPin size={13} weight="fill" color={colors.textMuted} />
              <Text className="font-sans-semibold text-xs text-text-secondary">
                {listing.venue.city}
              </Text>
            </View>
          ) : null}
          {time ? (
            <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt px-2.5 py-1.5">
              <Clock size={13} color={colors.textMuted} />
              <Text className="font-sans-semibold text-xs text-text-secondary">
                {time}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-3 flex-row items-center justify-between border-t border-border-default pt-3">
          <Text className="font-sans text-xs text-text-muted">
            {formatPostedAt(listing.created_at, t)}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="font-sans-bold text-sm text-brand">
              {t("listings.viewDetails")}
            </Text>
            <ArrowRight size={14} weight="bold" color={colors.brand} />
          </View>
        </View>
      </View>
    </Card>
  );
}
