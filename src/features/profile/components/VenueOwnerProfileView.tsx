// VenueOwnerProfileView — the venue owner's own personal account info: identity, contact
// details, member-since, and a link into their venue's business profile.
import { useRouter } from "expo-router";
import { CaretRight, EnvelopeSimple, Phone, Storefront } from "phosphor-react-native";
import { Text, View } from "react-native";
import { Avatar } from "@shared/components/Avatar";
import { Card } from "@shared/components/Card";
import { InfoCard } from "@shared/components/InfoCard";
import { useAuth } from "@shared/hooks/useAuth";
import { useMyVenue } from "@shared/hooks/useMyVenue";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import type { Profile } from "@shared/types/database.types";

type VenueOwnerProfileViewProps = {
  profile: Profile;
};

export function VenueOwnerProfileView({ profile }: VenueOwnerProfileViewProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const { venue } = useMyVenue();
  const { t } = useTranslation();

  const memberSinceYear = new Date(profile.created_at).getFullYear();

  return (
    <View className="gap-4">
      <Card className="items-center gap-3">
        <Avatar name={profile.full_name} uri={profile.avatar_url} size={88} />
        <View className="items-center">
          <Text className="font-sans-extrabold text-xl text-text-primary">
            {profile.full_name ?? ""}
          </Text>
          {profile.city ? (
            <Text className="mt-1 font-sans text-sm text-text-tertiary">
              {profile.city}
            </Text>
          ) : null}
        </View>
        <Text className="font-sans-medium text-xs text-text-tertiary">
          {t("profile.memberSince")} {memberSinceYear}
        </Text>
      </Card>

      <View className="flex-row gap-3">
        <InfoCard
          icon={<Phone size={14} color={colors.brand} />}
          label={t("auth.phone")}
          value={profile.phone ?? "—"}
        />
        <InfoCard
          icon={<EnvelopeSimple size={14} color={colors.brand} />}
          label={t("auth.email")}
          value={user?.email ?? "—"}
        />
      </View>

      {venue ? (
        <Card
          onPress={() => router.push("/venue-profile")}
          className="flex-row items-center gap-3"
        >
          <View className="h-11 w-11 items-center justify-center rounded-input bg-bg-icon-tint">
            <Storefront size={20} weight="bold" color={colors.brand} />
          </View>
          <View className="min-w-0 flex-1">
            <Text
              className="font-sans-bold text-[15px] text-text-primary"
              numberOfLines={1}
            >
              {venue.name}
            </Text>
            <Text className="font-sans-semibold text-xs text-text-tertiary">
              {t(`venueTypes.${venue.venue_type}` as TranslationKey)}
            </Text>
          </View>
          <CaretRight size={18} color={colors.textMuted} />
        </Card>
      ) : null}
    </View>
  );
}
