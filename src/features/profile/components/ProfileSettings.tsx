// Profile settings — language and appearance controls (shared by both roles).
import { Text, View } from "react-native";
import { Card } from "@shared/components/Card";
import { Chip } from "@shared/components/Chip";
import { useTranslation, type Language } from "@shared/i18n/I18nProvider";
import { useTheme, type ThemePreference } from "@shared/providers/ThemeProvider";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "sr", label: "Srpski" },
  { value: "en", label: "English" },
];

export function ProfileSettings() {
  const { t, language, setLanguage } = useTranslation();
  const { preference, setPreference } = useTheme();

  const themes: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("profile.themeSystem") },
    { value: "light", label: t("profile.themeLight") },
    { value: "dark", label: t("profile.themeDark") },
  ];

  return (
    <View className="gap-3">
      <Text className="font-sans-bold text-base text-text-primary">
        {t("profile.settings")}
      </Text>

      <Card>
        <Text className="mb-2 font-sans-medium text-sm text-text-tertiary">
          {t("profile.language")}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang.value}
              label={lang.label}
              variant={language === lang.value ? "active" : "neutral"}
              onPress={() => setLanguage(lang.value)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text className="mb-2 font-sans-medium text-sm text-text-tertiary">
          {t("profile.theme")}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {themes.map((theme) => (
            <Chip
              key={theme.value}
              label={theme.label}
              variant={preference === theme.value ? "active" : "neutral"}
              onPress={() => setPreference(theme.value)}
            />
          ))}
        </View>
      </Card>
    </View>
  );
}
