// Profile settings — language and appearance controls (shared by both roles), using
// the same icon toggle sliders as the pre-signup onboarding/sign-in header.
import { Text, View } from "react-native";
import { Card } from "@shared/components/Card";
import { LanguageToggle } from "@shared/components/LanguageToggle";
import { ThemeToggle } from "@shared/components/ThemeToggle";
import { useTranslation } from "@shared/i18n/I18nProvider";

export function ProfileSettings() {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <Card className="flex-row items-center justify-between">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("profile.language")}
        </Text>
        <LanguageToggle />
      </Card>

      <Card className="flex-row items-center justify-between">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("profile.theme")}
        </Text>
        <ThemeToggle />
      </Card>
    </View>
  );
}
