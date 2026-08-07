// Venue listings — all of the owner's own shift postings (all statuses), across every
// venue they run plus any venue-less temporary-job listings — the one place those are
// still reachable/manageable, since they don't belong to any single venue's own profile.
// Reached only via "See all" pushes (no tab bar item), so it carries its own back arrow.
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListingList } from "@shared/components/ListingList";
import { useAuth } from "@shared/hooks/useAuth";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { useVenueListingsByOwner } from "@features/listings/hooks/useListings";

export function VenueListingsView() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const listings = useVenueListingsByOwner(user?.id);

  const header = (
    <View className="pb-4 pt-2">
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <Text className="mt-4 font-sans-extrabold text-2xl text-text-primary">
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
