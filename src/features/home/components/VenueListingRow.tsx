// VenueListingRow — compact tappable row for a venue's own listing (home dashboard):
// role icon, title, candidate + view counts, chevron. Navigates to the listing detail.
import { useRouter } from "expo-router";
import { CaretRight, Eye, Users } from "phosphor-react-native";
import { Text, View } from "react-native";
import { Card } from "@shared/components/Card";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { roleIcon } from "@shared/lib/roleIcon";
import type { ListingWithVenue } from "@shared/types/domain.types";

type VenueListingRowProps = {
  listing: ListingWithVenue;
  candidateCount: number;
  viewCount: number;
};

export function VenueListingRow({
  listing,
  candidateCount,
  viewCount,
}: VenueListingRowProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const roleLabel = t(`roles.${listing.role_needed}` as TranslationKey);
  const title = listing.title || roleLabel;
  const RoleIcon = roleIcon[listing.role_needed];

  return (
    <Card onPress={() => router.push(`/listing/${listing.id}`)} className="p-3">
      <View className="flex-row items-center gap-3">
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
          <View className="mt-1 flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Users size={14} color={colors.brand} />
              <Text className="font-sans-semibold text-xs text-text-tertiary">
                {t("home.candidates", { count: candidateCount })}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Eye size={14} color={colors.textMuted} />
              <Text className="font-sans-semibold text-xs text-text-tertiary">
                {viewCount}
              </Text>
            </View>
          </View>
        </View>
        <CaretRight size={18} color={colors.textMuted} />
      </View>
    </Card>
  );
}
