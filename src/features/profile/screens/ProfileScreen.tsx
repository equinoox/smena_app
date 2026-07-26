// Profile tab — role-aware: workers get the rich profile view (avatar, roles, bio,
// skills, experience, availability toggle); venues get their own personal account info
// (identity, contact details, a link into their venue's business profile — that business
// info itself lives in the separate "venue-profile" tab). A gear icon opens /settings
// (language/theme/logout), shared by both roles.
import { useRouter } from "expo-router";
import { Gear, PencilSimple } from "phosphor-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Loader } from "@shared/components/Loader";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useUserRole } from "@shared/hooks/useUserRole";
import { VenueOwnerProfileView } from "@features/profile/components/VenueOwnerProfileView";
import { WorkerProfileView } from "@features/profile/components/WorkerProfileView";

export function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { profile, role, isLoading } = useUserRole();

  if (isLoading || !profile) return <Loader />;

  const isVenue = role === "venue";

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg-screen">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-end gap-2 py-4">
          {!isVenue ? (
            <Pressable
              onPress={() => router.push("/profile-edit")}
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
            >
              <PencilSimple size={18} color={colors.textPrimary} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-input border border-border-default bg-bg-surface"
          >
            <Gear size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        {isVenue ? (
          <VenueOwnerProfileView profile={profile} />
        ) : (
          <WorkerProfileView profile={profile} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
