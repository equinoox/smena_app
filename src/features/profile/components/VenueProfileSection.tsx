// Venue-specific profile block — shows the owner's venue name/type/city.
import { Text, View } from "react-native";
import { Avatar } from "@shared/components/Avatar";
import { Card } from "@shared/components/Card";
import { Chip } from "@shared/components/Chip";
import { useMyVenue } from "@shared/hooks/useMyVenue";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";

export function VenueProfileSection() {
  const { t } = useTranslation();
  const { venue } = useMyVenue();

  if (!venue) return null;

  return (
    <View className="gap-3">
      <Text className="font-sans-bold text-base text-text-primary">
        {t("profile.venue")}
      </Text>
      <Card>
        <View className="flex-row items-center gap-3">
          <Avatar uri={venue.logo_url} name={venue.name} size={48} />
          <View className="flex-1">
            <Text className="font-sans-bold text-base text-text-primary">
              {venue.name}
            </Text>
            {venue.city ? (
              <Text className="font-sans text-sm text-text-tertiary">
                {venue.city}
              </Text>
            ) : null}
          </View>
          <Chip
            label={t(`venueTypes.${venue.venue_type}` as TranslationKey)}
            variant="outline"
          />
        </View>
      </Card>
    </View>
  );
}
