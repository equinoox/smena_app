// Language toggle — SR/EN flags; tapping switches the app language (persisted).
import { View } from "react-native";
import { Flag } from "@shared/components/Flag";
import { SegmentedOption } from "@shared/components/SegmentedOption";
import { useTranslation, type Language } from "@shared/i18n/I18nProvider";

const OPTIONS: { lang: Language; country: "gb" | "rs" }[] = [
  { lang: "sr", country: "rs" },
  { lang: "en", country: "gb" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt p-1">
      {OPTIONS.map(({ lang, country }) => (
        <SegmentedOption
          key={lang}
          selected={language === lang}
          onPress={() => setLanguage(lang)}
        >
          <Flag country={country} size={24} />
        </SegmentedOption>
      ))}
    </View>
  );
}
