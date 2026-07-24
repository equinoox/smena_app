// Language toggle — SR/EN flags; tapping switches the app language (persisted).
import { Pressable, View } from "react-native";
import { Flag } from "@shared/components/Flag";
import { useTranslation, type Language } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";

const OPTIONS: { lang: Language; country: "gb" | "rs" }[] = [
  { lang: "sr", country: "rs" },
  { lang: "en", country: "gb" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <View className="flex-row items-center gap-1 rounded-chip bg-bg-surface-alt p-1">
      {OPTIONS.map(({ lang, country }) => (
        <Pressable
          key={lang}
          onPress={() => setLanguage(lang)}
          accessibilityRole="button"
          accessibilityState={{ selected: language === lang }}
          className={cn(
            "rounded-[7px] p-1.5",
            language === lang ? "bg-bg-surface" : "opacity-40",
          )}
        >
          <Flag country={country} size={24} />
        </Pressable>
      ))}
    </View>
  );
}
