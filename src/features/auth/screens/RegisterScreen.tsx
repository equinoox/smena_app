// Register — role-select screen reachable any time from sign-in (unlike onboarding,
// which is gated to first launch only). Picking a role continues into that role's sign-up.
import { useRouter } from "expo-router";
import { CaretLeft, Storefront, UserFocus } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";
import { RoleCard } from "@shared/components/RoleCard";
import { Screen } from "@shared/components/Screen";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
import type { UserRole } from "@shared/types/database.types";

export function RegisterScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const proceed = (role: UserRole) => {
    router.push(role === "worker" ? "/sign-up-worker" : "/sign-up-venue");
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
        {t("auth.createAccount")}
      </Text>
      <Text className="mt-1 font-sans-medium text-sm text-text-tertiary">
        {t("onboarding.chooseRole")}
      </Text>

      <View className="mt-6 gap-3">
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
    </Screen>
  );
}
