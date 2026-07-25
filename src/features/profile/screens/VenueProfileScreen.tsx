// Venue profile — dedicated tab for the venue's business info (name/type/city/logo).
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { VenueProfileSection } from "@features/profile/components/VenueProfileSection";

export function VenueProfileScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Text className="py-4 font-sans-extrabold text-2xl text-text-primary">
          {t("profile.venueProfileTitle")}
        </Text>
        <VenueProfileSection />
      </ScrollView>
    </SafeAreaView>
  );
}
