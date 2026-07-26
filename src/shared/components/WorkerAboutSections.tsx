// WorkerAboutSections — bio and skills blocks shared by the worker's own profile view and
// the venue-facing worker detail screen. Positions aren't repeated here: both callers
// already list `worker_roles` in their header.
import { Text, View } from "react-native";
import { Chip } from "@shared/components/Chip";
import { useTranslation } from "@shared/i18n/I18nProvider";
import type { Profile } from "@shared/types/database.types";

type WorkerAboutSectionsProps = {
  profile: Profile;
};

export function WorkerAboutSections({ profile }: WorkerAboutSectionsProps) {
  const { t } = useTranslation();

  return (
    <>
      {profile.bio ? (
        <View className="mt-6 gap-2">
          <Text className="font-sans-bold text-base text-text-primary">
            {t("profile.about")}
          </Text>
          <Text className="font-sans text-sm leading-5 text-text-secondary">
            {profile.bio}
          </Text>
        </View>
      ) : null}

      {profile.skills.length ? (
        <View className="mt-6 gap-2">
          <Text className="font-sans-bold text-base text-text-primary">
            {t("auth.skills")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Chip key={skill} label={skill} variant="neutral" size="lg" />
            ))}
          </View>
        </View>
      ) : null}
    </>
  );
}
