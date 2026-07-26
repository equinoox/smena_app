// Settings — language/theme + logout, reached via the gear icon on the profile tab.
import { useRouter } from "expo-router";
import { CaretLeft, SignOut } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { ConfirmationModal } from "@shared/components/ConfirmationModal";
import { Screen } from "@shared/components/Screen";
import { useAuth } from "@shared/hooks/useAuth";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { ProfileSettings } from "@features/profile/components/ProfileSettings";

export function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [confirmVisible, setConfirmVisible] = useState(false);

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
        {t("profile.settings")}
      </Text>

      <View className="mt-6 mb-8">
        <ProfileSettings />
      </View>

      <Button
        label={t("profile.logOut")}
        variant="danger"
        size="lg"
        leftIcon={<SignOut size={18} weight="bold" color={colors.danger} />}
        onPress={() => setConfirmVisible(true)}
      />

      <ConfirmationModal
        visible={confirmVisible}
        title={t("profile.logOut")}
        message={t("profile.logOutConfirm")}
        confirmLabel={t("profile.logOut")}
        cancelLabel={t("common.cancel")}
        destructive
        onConfirm={() => {
          setConfirmVisible(false);
          void signOut();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}
