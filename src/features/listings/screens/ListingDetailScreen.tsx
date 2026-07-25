// Listing detail — full shift info + venue. Worker can apply/save and contact the venue
// (message/call, using the venue's phone); venue owner can edit/delete and sees
// applicant + view counts. A worker opening this screen logs a listing view (feeds the
// venue home stats).
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BookmarkSimple,
  CaretLeft,
  ChatCircle,
  CheckCircle,
  Clock,
  Coffee,
  Eye,
  MapPin,
  PaperPlaneTilt,
  PencilSimple,
  Phone,
  TrashSimple,
  Users,
  Wallet,
} from "phosphor-react-native";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ConfirmationModal } from "@shared/components/ConfirmationModal";
import { EmptyState } from "@shared/components/EmptyState";
import { Loader } from "@shared/components/Loader";
import { useAuth } from "@shared/hooks/useAuth";
import { useMyVenue } from "@shared/hooks/useMyVenue";
import { useSavedIds, useToggleSaved } from "@shared/hooks/useSaved";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import {
  employmentChipVariant,
  formatPay,
  formatPostedAt,
  formatTimeRange,
} from "@shared/lib/format";
import {
  useApply,
  useListingApplicationsCount,
  useMyApplication,
} from "@features/listings/hooks/useApplications";
import {
  useLogListingView,
  useListingViewsCount,
} from "@features/listings/hooks/useListingViews";
import {
  useDeleteListing,
  useListing,
} from "@features/listings/hooks/useListings";

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 rounded-input border border-border-default bg-bg-surface p-3">
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="font-sans-medium text-xs text-text-tertiary">
          {label}
        </Text>
      </View>
      <Text className="mt-1 font-sans-bold text-base text-text-primary" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

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
  const { t, language } = useTranslation();
  const { role } = useUserRole();
  const { venue: myVenue } = useMyVenue();

  const { data: listing, isLoading } = useListing(id ?? "");
  const isVenue = role === "venue";

  const myApplication = useMyApplication(id ?? "");
  const apply = useApply(id ?? "");
  const applicantCount = useListingApplicationsCount(id ?? "");
  const viewCount = useListingViewsCount(id ?? "");
  const savedIds = useSavedIds();
  const toggleSaved = useToggleSaved();
  const { user } = useAuth();
  const logView = useLogListingView();
  const deleteListing = useDeleteListing(myVenue?.id);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    if (isVenue || !listing || !user) return;
    logView.mutate({ listingId: listing.id, viewerId: user.id });
    // Log once per (listing, viewer) — deliberately excludes `logView` from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id, isVenue, user?.id]);

  if (isLoading) return <Loader />;
  if (!listing) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
        <EmptyState title={t("listingDetail.notFound")} />
      </SafeAreaView>
    );
  }

  const roleLabel = t(`roles.${listing.role_needed}` as TranslationKey);
  const employmentLabel = t(
    `employment.${listing.employment_type}` as TranslationKey,
  );
  const time = formatTimeRange(listing.starts_at, listing.ends_at, language);
  const pay = formatPay(listing, t);
  const title = listing.title || roleLabel;
  const hasApplied = !!myApplication.data;
  const isSaved = savedIds.has(listing.id);
  const venuePhone = listing.venue?.phone;

  const onApply = () =>
    apply.mutate(undefined, {
      onSuccess: () => toast.success(t("listingDetail.applied")),
    });

  const onMessageVenue = () => {
    if (!venuePhone) {
      toast.error(t("listingDetail.noPhone"));
      return;
    }
    Linking.openURL(`sms:${venuePhone}`);
  };

  const onCallVenue = () => {
    if (!venuePhone) {
      toast.error(t("listingDetail.noPhone"));
      return;
    }
    Linking.openURL(`tel:${venuePhone}`);
  };

  const onDelete = () =>
    deleteListing.mutate(listing.id, {
      onSuccess: () => {
        setDeleteConfirmVisible(false);
        toast.success(t("listingDetail.deleteSuccess"));
        router.back();
      },
    });

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-64 w-full items-end justify-start bg-bg-surface-alt p-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="absolute left-3 top-3 h-10 w-10 items-center justify-center rounded-input bg-bg-canvas/70"
          >
            <CaretLeft size={20} color={colors.textPrimary} />
          </Pressable>
          {!isVenue ? (
            <Pressable
              onPress={() =>
                toggleSaved.mutate({ listingId: listing.id, saved: isSaved })
              }
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-input bg-bg-canvas/70"
            >
              <BookmarkSimple
                size={20}
                weight={isSaved ? "fill" : "regular"}
                color={isSaved ? colors.brand : colors.textPrimary}
              />
            </Pressable>
          ) : (
            <Text className="font-sans-bold text-[10px] tracking-widest text-text-muted">
              {t("listings.venuePhotoPlaceholder").toUpperCase()}
            </Text>
          )}
        </View>

        <View className="px-4">
          <View className="-mt-8 flex-row items-center gap-3">
            {listing.venue?.logo_url ? (
              <Image
                source={{ uri: listing.venue.logo_url }}
                className="h-16 w-16 rounded-input bg-bg-surface"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-input bg-brand">
                <Coffee size={30} weight="fill" color={colors.onBrand} />
              </View>
            )}
            <View className="min-w-0 flex-1 justify-center">
              <Text className="font-sans-bold text-lg text-text-primary" numberOfLines={1}>
                {listing.venue?.name ?? ""}
              </Text>
              {listing.venue?.venue_type ? (
                <Text className="mt-0.5 font-sans-semibold text-sm text-text-tertiary">
                  {t(`venueTypes.${listing.venue.venue_type}` as TranslationKey)}
                </Text>
              ) : null}
            </View>
          </View>

          <Text className="mt-3 font-sans-extrabold text-2xl text-text-primary">
            {title}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Chip
                label={employmentLabel}
                variant={employmentChipVariant(listing.employment_type)}
              />
              {listing.is_urgent ? (
                <Chip label={t("listings.urgent")} variant="urgent" />
              ) : null}
            </View>
            <Text className="font-sans text-xs text-text-muted">
              {formatPostedAt(listing.created_at, t)}
            </Text>
          </View>

          {isVenue ? (
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 flex-row items-center gap-2 rounded-input border border-border-default bg-bg-surface p-3">
                <Eye size={16} color={colors.info} />
                <Text className="font-sans-bold text-sm text-text-primary">
                  {t("listingDetail.views", { count: viewCount.data ?? 0 })}
                </Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2 rounded-input border border-border-default bg-bg-surface p-3">
                <Users size={16} color={colors.brand} />
                <Text className="font-sans-bold text-sm text-text-primary">
                  {t("listingDetail.applicants", {
                    count: applicantCount.data ?? 0,
                  })}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="mt-4 gap-3">
            <View className="flex-row gap-3">
              <InfoCard
                icon={<Clock size={14} color={colors.brand} />}
                label={t("listingDetail.workingHours")}
                value={time ?? "—"}
              />
              <InfoCard
                icon={<Wallet size={14} color={colors.brand} />}
                label={t("listingDetail.pay")}
                value={pay ?? "—"}
              />
            </View>
            <View className="flex-row gap-3">
              <InfoCard
                icon={<MapPin size={14} color={colors.brand} />}
                label={t("listingDetail.location")}
                value={listing.venue?.city ?? "—"}
              />
              <InfoCard
                icon={<Users size={14} color={colors.brand} />}
                label={t("auth.position")}
                value={roleLabel}
              />
            </View>
          </View>

          {listing.description ? (
            <Section title={t("listingDetail.about")}>
              <Text className="font-sans text-sm leading-5 text-text-secondary">
                {listing.description}
              </Text>
            </Section>
          ) : null}

          {listing.requirements.length > 0 ? (
            <Section title={t("listingDetail.requirements")}>
              <View className="gap-2">
                {listing.requirements.map((req) => (
                  <View key={req} className="flex-row items-center gap-2">
                    <CheckCircle size={18} weight="fill" color={colors.brand} />
                    <Text className="flex-1 font-sans text-sm text-text-secondary">
                      {req}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}
        </View>
      </ScrollView>

      <View className="flex-row items-center gap-3 border-t border-border-default bg-bg-surface px-4 py-3">
        {isVenue ? (
          <>
            <Pressable
              onPress={() => setDeleteConfirmVisible(true)}
              className="h-12 w-12 items-center justify-center rounded-button border border-warning bg-warning-bg"
            >
              <TrashSimple size={20} color={colors.warning} />
            </Pressable>
            <View className="flex-1">
              <Button
                label={t("listingDetail.edit")}
                onPress={() => router.push(`/listing-create?id=${listing.id}`)}
                leftIcon={<PencilSimple size={18} color={colors.onBrand} weight="bold" />}
                size="lg"
              />
            </View>
          </>
        ) : (
          <>
            <Pressable
              onPress={hasApplied ? undefined : onApply}
              disabled={apply.isPending}
              hitSlop={4}
              className={cn(
                "h-12 w-12 items-center justify-center rounded-button border",
                hasApplied
                  ? "border-brand bg-brand"
                  : "border-border-default bg-bg-surface",
              )}
            >
              {apply.isPending ? (
                <ActivityIndicator
                  size="small"
                  color={hasApplied ? colors.onBrand : colors.textPrimary}
                />
              ) : (
                <PaperPlaneTilt
                  size={22}
                  weight={hasApplied ? "fill" : "regular"}
                  color={hasApplied ? colors.onBrand : colors.textPrimary}
                />
              )}
            </Pressable>
            <Pressable
              onPress={onMessageVenue}
              className="h-12 w-12 items-center justify-center rounded-button border border-border-default"
            >
              <ChatCircle size={22} color={colors.textPrimary} />
            </Pressable>
            <View className="flex-1">
              <Button
                label={t("listingDetail.callVenue")}
                onPress={onCallVenue}
                leftIcon={<Phone size={18} color={colors.onBrand} weight="fill" />}
                size="lg"
              />
            </View>
          </>
        )}
      </View>

      <ConfirmationModal
        visible={deleteConfirmVisible}
        title={t("listingDetail.deleteTitle")}
        message={t("listingDetail.deleteMessage")}
        confirmLabel={t("listingDetail.deleteConfirm")}
        cancelLabel={t("common.cancel")}
        destructive
        loading={deleteListing.isPending}
        onConfirm={onDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}
