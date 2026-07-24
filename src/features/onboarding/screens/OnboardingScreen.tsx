// Onboarding — logo + language/theme toggles (top-right), tap a role to start that sign-up;
// "already have an account? Sign in" pinned to the bottom.
import { useRouter } from "expo-router";
import { Coffee, Storefront, UserFocus } from "phosphor-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LanguageToggle } from "@shared/components/LanguageToggle";
import { ThemeToggle } from "@shared/components/ThemeToggle";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
import type { UserRole } from "@shared/types/database.types";
import { RoleCard } from "@features/onboarding/components/RoleCard";
import { useOnboardingStore } from "@features/onboarding/store/onboardingStore";

export function OnboardingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const setSelectedRole = useOnboardingStore((s) => s.setSelectedRole);

  // Onboarding is only marked "done" once a profile is actually created (see the
  // sign-up screens' onSuccess) — so pushing (not replacing) here means back/gesture
  // naturally returns here if the user abandons sign-up, and a killed-and-reopened app
  // lands back on onboarding too, since the AsyncStorage flag was never set.
  const proceed = (role: UserRole) => {
    setSelectedRole(role);
    router.push(role === "worker" ? "/sign-up-worker" : "/sign-up-venue");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-bg-screen">
      {/* Header: logo left, language + theme toggles top-right */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-5">
        <View className="h-10 w-10 items-center justify-center rounded-input bg-brand">
          <Coffee size={22} weight="fill" color={colors.onBrand} />
        </View>
        <View className="flex-row items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 h-48 items-center justify-center overflow-hidden rounded-card-lg bg-bg-surface-alt">
          <Coffee size={44} weight="fill" color={colors.brand} />
        </View>

        <Text className="mt-6 font-sans-extrabold text-3xl leading-tight text-text-primary">
          {t("onboarding.title")}
        </Text>
        <Text className="mt-2 font-sans-medium text-base text-text-tertiary">
          {t("onboarding.subtitle")}
        </Text>

        <View className="mt-7 gap-3">
          <RoleCard
            onPress={() => proceed("worker")}
            title={t("onboarding.worker")}
            description={t("onboarding.workerDesc")}
            icon={<UserFocus size={26} weight="bold" color={colors.brand} />}
          />
          <RoleCard
            onPress={() => proceed("venue")}
            title={t("onboarding.venue")}
            description={t("onboarding.venueDesc")}
            icon={<Storefront size={26} weight="bold" color={colors.brand} />}
          />
        </View>
      </ScrollView>

      {/* Sign-in pinned to the bottom */}
      <View className="flex-row items-center justify-center gap-1 px-4 pb-2 pt-3">
        <Text className="font-sans-medium text-sm text-text-tertiary">
          {t("auth.alreadyHaveAccount")}
        </Text>
        <Pressable onPress={() => router.replace("/sign-in")} hitSlop={8}>
          <Text className="font-sans-bold text-sm text-brand">
            {t("auth.signIn")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
