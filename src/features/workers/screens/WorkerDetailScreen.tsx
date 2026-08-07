// Worker detail — venue-facing read-only view of a worker's profile: identity, bio,
// skills, experience, contact actions (call/message), and a rating summary/CTA,
// mirroring the listing detail screen's venue-contact pattern.
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft, ChatCircle, MapPin, Phone } from "phosphor-react-native";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@shared/components/Avatar";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { EmptyState } from "@shared/components/EmptyState";
import { InfoCard } from "@shared/components/InfoCard";
import { Loader } from "@shared/components/Loader";
import { RatingSummary } from "@shared/components/RatingSummary";
import { StarRatingBadge } from "@shared/components/StarRatingBadge";
import { WorkerAboutSections } from "@shared/components/WorkerAboutSections";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { formatLocation } from "@shared/lib/format";
import { RateWorkerModal } from "@features/workers/components/RateWorkerModal";
import { useMyWorkerRating } from "@features/workers/hooks/useMyWorkerRating";
import { useWorkerProfile } from "@features/workers/hooks/useWorkerProfile";

export function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { role } = useUserRole();
  const [rateModalVisible, setRateModalVisible] = useState(false);

  const { data: worker, isLoading } = useWorkerProfile(id ?? "");
  const { data: myRating } = useMyWorkerRating(id ?? "");

  if (isLoading) return <Loader />;
  if (!worker) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
        <EmptyState title={t("workerDetail.notFound")} />
      </SafeAreaView>
    );
  }

  const locationLine = [
    formatLocation(worker.address, worker.city),
    worker.experience_level
      ? `${t(`experience.${worker.experience_level}` as TranslationKey)} ${t("profile.experienceLabel")}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const onMessage = () => {
    if (!worker.phone) {
      toast.error(t("workerDetail.noPhone"));
      return;
    }
    Linking.openURL(`sms:${worker.phone}`);
  };

  const onCall = () => {
    if (!worker.phone) {
      toast.error(t("workerDetail.noPhone"));
      return;
    }
    Linking.openURL(`tel:${worker.phone}`);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
        >
          <CaretLeft size={20} color={colors.textPrimary} />
        </Pressable>

        <View className="mt-6 items-center">
          <Avatar name={worker.full_name} uri={worker.avatar_url} size={88} />
          <Text className="mt-4 font-sans-extrabold text-xl text-text-primary">
            {worker.full_name ?? ""}
          </Text>
          <View className="mt-1">
            <StarRatingBadge
              rating={worker.rating_avg}
              count={worker.rating_count}
              size="md"
            />
          </View>
          {worker.worker_roles.length ? (
            <Text className="mt-1 font-sans-bold text-base text-brand">
              {worker.worker_roles
                .map((role) => t(`roles.${role}` as TranslationKey))
                .join(" · ")}
            </Text>
          ) : null}
          {locationLine ? (
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <MapPin size={14} color={colors.textMuted} />
              <Text className="font-sans text-sm text-text-tertiary">
                {locationLine}
              </Text>
            </View>
          ) : null}
          {worker.is_available ? (
            <View className="mt-3">
              <Chip label={t("home.availableTag")} variant="success" />
            </View>
          ) : null}
        </View>

        <View className="mt-6 flex-row">
          <InfoCard
            icon={<Phone size={14} color={colors.brand} />}
            label={t("workerDetail.phone")}
            value={worker.phone ?? "—"}
          />
        </View>

        <View className="mt-6">
          <RatingSummary
            ratingAvg={worker.rating_avg}
            ratingCount={worker.rating_count}
            title={t("rating.overall")}
            noRatingsLabel={t("rating.noRatingsYet")}
            countLabel={t("rating.count", { count: worker.rating_count })}
            onRatePress={
              role === "venue" ? () => setRateModalVisible(true) : undefined
            }
            rateButtonLabel={
              myRating ? t("rating.editRating") : t("rating.rateWorker")
            }
          />
        </View>

        <WorkerAboutSections profile={worker} />
      </ScrollView>

      <RateWorkerModal
        visible={rateModalVisible}
        onClose={() => setRateModalVisible(false)}
        workerId={worker.id}
      />

      <View className="flex-row items-center gap-3 border-t border-border-default bg-bg-surface px-4 py-3">
        <Pressable
          onPress={onMessage}
          className="h-12 w-12 items-center justify-center rounded-button border border-border-default"
        >
          <ChatCircle size={22} color={colors.textPrimary} />
        </Pressable>
        <View className="flex-1">
          <Button
            label={t("workerDetail.call")}
            onPress={onCall}
            leftIcon={<Phone size={18} color={colors.onBrand} weight="fill" />}
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
