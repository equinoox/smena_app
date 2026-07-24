// Listing detail — full shift info + venue. Worker can apply/save; venue sees applicant count.
import { useLocalSearchParams, useRouter } from "expo-router";
import { BookmarkSimple, CaretLeft, MapPin } from "phosphor-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@shared/components/Avatar";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { EmptyState } from "@shared/components/EmptyState";
import { Loader } from "@shared/components/Loader";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { employmentChipVariant, formatPay } from "@shared/lib/format";
import {
  useApply,
  useListingApplicationsCount,
  useMyApplication,
} from "@features/listings/hooks/useApplications";
import { useListing } from "@features/listings/hooks/useListings";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <Text className="mb-2 font-sans-bold text-base text-text-primary">
        {title}
      </Text>
      {children}
    </View>
  );
}

export function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { role } = useUserRole();

  const { data: listing, isLoading } = useListing(id ?? "");
  const isVenue = role === "venue";

  const myApplication = useMyApplication(id ?? "");
  const apply = useApply(id ?? "");
  const applicantCount = useListingApplicationsCount(id ?? "");
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();

  if (isLoading) return <Loader />;
  if (!listing) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
        <EmptyState title={t("listingDetail.notFound")} />
      </SafeAreaView>
    );
  }

  const pay = formatPay(listing, t);
  const roleLabel = t(`roles.${listing.role_needed}` as TranslationKey);
  const employmentLabel = t(
    `employment.${listing.employment_type}` as TranslationKey,
  );
  const hasApplied = !!myApplication.data;
  const isSaved = savedIds.has(listing.id);

  const onApply = () =>
    apply.mutate(undefined, {
      onSuccess: () => toast.success(t("listingDetail.applied")),
    });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="mb-2 mt-1 h-10 w-10 items-center justify-center rounded-full bg-bg-surface-alt"
        >
          <CaretLeft size={20} color={colors.textPrimary} />
        </Pressable>

        <View className="flex-row items-center gap-3">
          <Avatar uri={listing.venue?.logo_url} name={listing.venue?.name} size={52} />
          <View className="flex-1">
            <Text className="font-sans-bold text-base text-text-secondary">
              {listing.venue?.name ?? ""}
            </Text>
            {listing.venue?.city ? (
              <View className="mt-0.5 flex-row items-center gap-1">
                <MapPin size={13} color={colors.textMuted} />
                <Text className="font-sans text-xs text-text-tertiary">
                  {listing.venue.city}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text className="mt-4 font-sans-extrabold text-2xl text-text-primary">
          {roleLabel}
        </Text>

        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <Chip
            label={employmentLabel}
            variant={employmentChipVariant(listing.employment_type)}
          />
          {listing.is_urgent ? (
            <Chip label={t("listings.urgent")} variant="urgent" />
          ) : null}
        </View>

        {pay ? (
          <Section title={t("listingDetail.pay")}>
            <Text className="font-sans-bold text-lg text-brand">{pay}</Text>
          </Section>
        ) : null}

        {listing.description ? (
          <Section title={t("listingDetail.about")}>
            <Text className="font-sans text-sm leading-5 text-text-secondary">
              {listing.description}
            </Text>
          </Section>
        ) : null}

        {listing.venue?.name ? (
          <Section title={t("listingDetail.aboutVenue")}>
            <Text className="font-sans text-sm leading-5 text-text-secondary">
              {listing.venue.name}
              {listing.venue.city ? ` · ${listing.venue.city}` : ""}
            </Text>
          </Section>
        ) : null}

        {isVenue ? (
          <Section title={t("home.applicationsReceived")}>
            <Text className="font-sans-bold text-lg text-text-primary">
              {t("listingDetail.applicants", {
                count: applicantCount.data ?? 0,
              })}
            </Text>
          </Section>
        ) : null}
      </ScrollView>

      {!isVenue ? (
        <View className="flex-row items-center gap-3 border-t border-border-default bg-bg-surface px-4 py-3">
          <Pressable
            onPress={() =>
              toggleSaved.mutate({ listingId: listing.id, saved: isSaved })
            }
            className="h-12 w-12 items-center justify-center rounded-button border border-border-default"
          >
            <BookmarkSimple
              size={22}
              weight={isSaved ? "fill" : "regular"}
              color={isSaved ? colors.brand : colors.textMuted}
            />
          </Pressable>
          <View className="flex-1">
            <Button
              label={hasApplied ? t("listingDetail.applied") : t("listingDetail.apply")}
              onPress={onApply}
              disabled={hasApplied}
              loading={apply.isPending}
              size="lg"
            />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
