// WorkerIdentityBar — avatar + full name (+ city) row shown atop worker-facing tabs
// (Home, Saved) for a consistent identity header. Optional trailing slot for
// screen-specific actions (e.g. Home's notification bell).
import { MapPin } from "phosphor-react-native";
import { Text, View } from "react-native";
import { Avatar } from "@shared/components/Avatar";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import type { Profile } from "@shared/types/database.types";

type WorkerIdentityBarProps = {
  profile: Profile | null;
  right?: React.ReactNode;
};

export function WorkerIdentityBar({ profile, right }: WorkerIdentityBarProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-3">
        <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={44} />
        <View className="min-w-0 flex-1">
          <Text
            className="font-sans-bold text-base text-text-primary"
            numberOfLines={1}
          >
            {profile?.full_name ?? ""}
          </Text>
          {profile?.city ? (
            <View className="mt-0.5 flex-row items-center gap-1">
              <MapPin size={13} weight="fill" color={colors.brand} />
              <Text className="font-sans-semibold text-xs text-brand" numberOfLines={1}>
                {profile.city}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {right}
    </View>
  );
}
