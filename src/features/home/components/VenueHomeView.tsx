// Venue home — greeting + venue name, "post a shift" (post-MVP), and the venue's listings.
import { Plus } from "phosphor-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@shared/components/Button";
import { ListingList } from "@shared/components/ListingList";
import { useMyVenue } from "@shared/hooks/useMyVenue";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { useVenueListings } from "@features/listings/hooks/useListings";

export function VenueHomeView({ name }: { name?: string | null }) {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const { venue } = useMyVenue();
  const listings = useVenueListings(venue?.id);

  const header = (
    <View className="pb-4 pt-2">
      <Text className="font-sans text-base text-text-tertiary">
        {t("home.greeting")}
        {name ? `, ${name}` : ""}
      </Text>
      <Text className="mt-1 font-sans-extrabold text-2xl text-text-primary">
        {venue?.name ?? t("home.forVenues")}
      </Text>

      <View className="mt-4">
        <Button
          label={t("home.postShift")}
          onPress={() => toast.info(t("common.comingSoon"))}
          leftIcon={<Plus size={18} weight="bold" color={colors.onBrand} />}
        />
      </View>

      <Text className="mt-6 font-sans-bold text-xl text-text-primary">
        {t("home.yourListings")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ListingList
        listings={listings.data ?? []}
        isLoading={listings.isLoading}
        header={header}
        emptyTitle={t("home.empty")}
      />
    </SafeAreaView>
  );
}
