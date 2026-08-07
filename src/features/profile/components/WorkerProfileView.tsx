// WorkerProfileView — the worker's own rich profile display: identity, availability
// toggle, bio, skills, and their most recent work-experience entry.
import { MapPin } from "phosphor-react-native";
import { Switch, Text, View } from "react-native";
import { Avatar } from "@shared/components/Avatar";
import { Card } from "@shared/components/Card";
import { StarRatingBadge } from "@shared/components/StarRatingBadge";
import { WorkerAboutSections } from "@shared/components/WorkerAboutSections";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import { formatLocation } from "@shared/lib/format";
import type { Profile } from "@shared/types/database.types";
import { useUpdateWorkerAvailability } from "@features/profile/hooks/useUpdateWorkerAvailability";

type WorkerProfileViewProps = {
  profile: Profile;
};

export function WorkerProfileView({ profile }: WorkerProfileViewProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const updateAvailability = useUpdateWorkerAvailability();

  const locationLine = [
    formatLocation(profile.address, profile.city),
    profile.experience_level
      ? `${t(`experience.${profile.experience_level}` as TranslationKey)} ${t("profile.experienceLabel")}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View>
      <Card className="items-center gap-4">
        <Avatar name={profile.full_name} uri={profile.avatar_url} size={88} />
        <View className="items-center">
          <Text className="font-sans-extrabold text-xl text-text-primary">
            {profile.full_name ?? ""}
          </Text>
          <View className="mt-1">
            <StarRatingBadge
              rating={profile.rating_avg}
              count={profile.rating_count}
              size="md"
            />
          </View>
          {profile.worker_roles.length ? (
            <Text className="mt-1 font-sans-bold text-base text-brand">
              {profile.worker_roles
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
        </View>

        <View className="w-full flex-row items-center justify-between border-t border-border-default pt-4">
          <View className="flex-row items-center gap-2">
            <View
              className={cn(
                "h-2 w-2 rounded-full",
                profile.is_available ? "bg-success" : "bg-text-muted",
              )}
            />
            <Text className="font-sans-semibold text-base text-text-primary">
              {t("profile.availableForWork")}
            </Text>
          </View>
          <Switch
            value={profile.is_available}
            onValueChange={(value) => updateAvailability.mutate(value)}
            trackColor={{ false: colors.borderDefault, true: colors.success }}
            thumbColor={colors.onBrand}
          />
        </View>
      </Card>

      <WorkerAboutSections profile={profile} />
    </View>
  );
}
