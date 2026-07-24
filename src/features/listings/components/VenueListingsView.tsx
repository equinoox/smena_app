// Venue listings — the venue's own shift postings (all statuses).
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListingList } from "@shared/components/ListingList";
import { useMyVenue } from "@shared/hooks/useMyVenue";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { useVenueListings } from "@features/listings/hooks/useListings";

export function VenueListingsView() {
  const { t } = useTranslation();
  const { venue } = useMyVenue();
  const listings = useVenueListings(venue?.id);

  const header = (
    <View className="pb-4 pt-2">
      <Text className="font-sans-extrabold text-2xl text-text-primary">
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
