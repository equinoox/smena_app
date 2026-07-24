// ListingCard — reusable shift card (home, listings, saved), matched to the Smena design:
// role glyph, venue name + bookmark, tag row (type / time / location), "Details ->" footer.
import { useRouter } from "expo-router";
import { ArrowRight, BookmarkSimple, Clock, MapPin } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { Card } from "@shared/components/Card";
import { Chip } from "@shared/components/Chip";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { employmentChipVariant, formatTimeRange } from "@shared/lib/format";
import { roleIcon } from "@shared/lib/roleIcon";
import type { ListingWithVenue } from "@shared/types/domain.types";

type ListingCardProps = {
  listing: ListingWithVenue;
  saved?: boolean;
  onToggleSave?: () => void;
};

export function ListingCard({ listing, saved, onToggleSave }: ListingCardProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const RoleIcon = roleIcon[listing.role_needed];
  const roleLabel = t(`roles.${listing.role_needed}` as TranslationKey);
  const employmentLabel = t(
    `employment.${listing.employment_type}` as TranslationKey,
  );
  const time = formatTimeRange(listing.starts_at, listing.ends_at);

  return (
    <Card onPress={() => router.push(`/listing/${listing.id}`)}>
      <View className="flex-row gap-3">
        <View className="h-[50px] w-[50px] items-center justify-center rounded-input bg-bg-icon-tint">
          <RoleIcon size={23} weight="fill" color={colors.brand} />
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="flex-1 font-sans-semibold text-xs text-text-tertiary"
              numberOfLines={1}
            >
              {listing.venue?.name ?? ""}
            </Text>
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
            className="mt-0.5 font-sans-extrabold text-[17px] text-text-primary"
            numberOfLines={1}
          >
            {roleLabel}
          </Text>
        </View>
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
        {listing.venue?.city ? (
          <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt px-2.5 py-1.5">
            <MapPin size={13} weight="fill" color={colors.textMuted} />
            <Text className="font-sans-semibold text-xs text-text-secondary">
              {listing.venue.city}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-3 flex-row items-center justify-end border-t border-border-default pt-3">
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
