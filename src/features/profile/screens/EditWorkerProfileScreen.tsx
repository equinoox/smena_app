// Edit worker profile — positions + experience level, moved here from sign-up so a
// worker can set/change them any time instead of only once at registration.
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ImagePickerField } from "@shared/components/ImagePickerField";
import { Loader } from "@shared/components/Loader";
import { Screen } from "@shared/components/Screen";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import { EXPERIENCE_LEVELS, WORKER_ROLES } from "@shared/lib/roleIcon";
import type { ExperienceLevel, WorkerRole } from "@shared/types/database.types";
import { useUpdateWorkerProfile } from "@features/profile/hooks/useUpdateWorkerProfile";

export function EditWorkerProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const { profile, isLoading } = useUserRole();
  const update = useUpdateWorkerProfile();

  const [positions, setPositions] = useState<WorkerRole[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  if (!isLoading && !initialized && profile) {
    setPositions(profile.worker_roles ?? []);
    setExperienceLevel(profile.experience_level);
    setInitialized(true);
  }

  if (isLoading || !initialized) return <Loader />;

  const togglePosition = (role: WorkerRole) =>
    setPositions((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );

  const onSave = () => {
    if (positions.length === 0) {
      toast.error(t("validation.selectPosition"));
      return;
    }
    if (!experienceLevel) {
      toast.error(t("validation.selectExperience"));
      return;
    }
    update.mutate(
      { workerRoles: positions, experienceLevel, avatarUri },
      {
        onSuccess: () => {
          toast.success(t("common.saveSuccess"));
          router.back();
        },
      },
    );
  };

  return (
    <Screen scroll>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
      >
        <CaretLeft size={20} color={colors.textPrimary} />
      </Pressable>

      <Text className="mt-6 font-sans-extrabold text-2xl text-text-primary">
        {t("profile.editProfile")}
      </Text>

      <View className="mt-6">
        <ImagePickerField
          value={avatarUri}
          existingUri={profile?.avatar_url}
          onChange={setAvatarUri}
          label={t("auth.profilePicture")}
          recommendedSize={t("imagePicker.squareSizeHint")}
          aspect={[1, 1]}
        />
      </View>

      <View className="mt-6 gap-2">
        <View className="flex-row items-baseline gap-1.5">
          <Text className="font-sans-medium text-sm text-text-tertiary">
            {t("auth.position")}
          </Text>
          <Text className="font-sans text-xs text-text-muted">
            · {t("auth.positionHint")}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {WORKER_ROLES.map((role) => (
            <Chip
              key={role}
              label={t(`roles.${role}` as TranslationKey)}
              variant={positions.includes(role) ? "active" : "neutral"}
              size="lg"
              onPress={() => togglePosition(role)}
            />
          ))}
        </View>
      </View>

      <View className="mt-6 gap-2">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("auth.experience")}
        </Text>
        <View className="flex-row rounded-input border border-border-default bg-bg-surface p-1">
          {EXPERIENCE_LEVELS.map((level) => {
            const selected = experienceLevel === level;
            return (
              <Pressable
                key={level}
                onPress={() => setExperienceLevel(level)}
                className={cn(
                  "flex-1 items-center justify-center rounded-chip py-2.5",
                  selected && "bg-bg-surface-alt",
                )}
              >
                <Text
                  className={cn(
                    "font-sans-semibold text-sm",
                    selected ? "text-text-primary" : "text-text-muted",
                  )}
                >
                  {t(`experience.${level}` as TranslationKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-8">
        <Button
          label={t("common.save")}
          onPress={onSave}
          loading={update.isPending}
          size="lg"
        />
      </View>
    </Screen>
  );
}
