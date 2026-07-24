// Profile — role-aware: identity header, venue block (venues only), settings, logout.
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@shared/components/Avatar";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ConfirmationModal } from "@shared/components/ConfirmationModal";
import { Loader } from "@shared/components/Loader";
import { useAuth } from "@shared/hooks/useAuth";
import { useUserRole } from "@shared/hooks/useUserRole";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { ProfileSettings } from "@features/profile/components/ProfileSettings";
import { VenueProfileSection } from "@features/profile/components/VenueProfileSection";

export function ProfileScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { profile, role, isLoading } = useUserRole();
  const [confirmVisible, setConfirmVisible] = useState(false);

  if (isLoading) return <Loader />;

  const isVenue = role === "venue";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Text className="py-4 font-sans-extrabold text-2xl text-text-primary">
          {t("profile.title")}
        </Text>

        <View className="mb-6 flex-row items-center gap-4">
          <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={64} />
          <View className="flex-1">
            <Text className="font-sans-bold text-lg text-text-primary">
              {profile?.full_name ?? ""}
            </Text>
            {profile?.city ? (
              <Text className="font-sans text-sm text-text-tertiary">
                {profile.city}
              </Text>
            ) : null}
            <View className="mt-2">
              <Chip
                label={isVenue ? t("profile.venue") : t("profile.worker")}
                variant="outline"
              />
            </View>
          </View>
        </View>

        {isVenue ? (
          <View className="mb-6">
            <VenueProfileSection />
          </View>
        ) : null}

        <View className="mb-8">
          <ProfileSettings />
        </View>

        <Button
          label={t("profile.logOut")}
          variant="danger"
          onPress={() => setConfirmVisible(true)}
        />
      </ScrollView>

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
    </SafeAreaView>
  );
}
