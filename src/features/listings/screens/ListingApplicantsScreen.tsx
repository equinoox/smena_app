// Listing applicants — venue-facing list of workers who applied to one of their
// listings, reached by tapping the applicant count on the listing detail screen.
// Tapping a worker opens their detail screen (contact info, bio, skills).
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@shared/components/EmptyState";
import { Loader } from "@shared/components/Loader";
import { WorkerRow } from "@shared/components/WorkerRow";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { useListingApplications } from "@features/listings/hooks/useApplications";

export function ListingApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const { data: applications, isLoading } = useListingApplications(id ?? "");
  const applicants = (applications ?? [])
    .map((application) => application.worker)
    .filter((worker) => worker !== null);

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
        >
          <CaretLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text className="font-sans-extrabold text-xl text-text-primary">
          {t("listingDetail.applicantsTitle")}
        </Text>
      </View>

      {isLoading ? (
        <Loader />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-6"
          showsVerticalScrollIndicator={false}
        >
          {applicants.length === 0 ? (
            <EmptyState title={t("listingDetail.noApplicants")} />
          ) : (
            <View className="gap-3">
              {applicants.map((worker) => (
                <WorkerRow key={worker.id} worker={worker} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
