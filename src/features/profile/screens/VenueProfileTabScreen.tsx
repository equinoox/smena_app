// Venue-profile tab entry — branches on how many venues the owner runs: zero (an owner
// who chose not to run a physical venue at sign-up) shows an empty state inviting them to
// add one, exactly one opens straight into that venue's own profile (unchanged from
// before multi-venue existed), more than one shows the "Moji lokali" picker list instead.
import { useRouter } from "expo-router";
import { Storefront } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@shared/components/EmptyState";
import { Loader } from "@shared/components/Loader";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useMyVenues } from "@shared/hooks/useActiveVenue";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { MyVenuesListScreen } from "@features/profile/screens/MyVenuesListScreen";
import { VenueProfileScreen } from "@features/profile/screens/VenueProfileScreen";

export function VenueProfileTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { venues, isLoading } = useMyVenues();

  if (isLoading) return <Loader />;
  if (venues.length > 1) return <MyVenuesListScreen />;
  if (venues[0]) return <VenueProfileScreen venueId={venues[0].id} />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <EmptyState
        icon={<Storefront size={28} weight="bold" color={colors.brand} />}
        title={t("myVenues.emptyTitle")}
        description={t("myVenues.emptyHint")}
        actionLabel={t("myVenues.addVenue")}
        onAction={() => router.push("/venue-create")}
      />
    </SafeAreaView>
  );
}
