// WorkerIdentityBar — avatar + full name (+ address) row shown atop worker-facing tabs
// (Home, Saved) for a consistent identity header. Optional trailing slot for
// screen-specific actions (e.g. Home's notification bell). The address is tappable —
// see EditableLocationRow for the pick-then-confirm flow.
import { Text, View } from "react-native";
import { Avatar } from "@shared/components/Avatar";
import { EditableLocationRow } from "@shared/components/EditableLocationRow";
import type { LocationValue } from "@shared/types/location.types";
import type { Profile } from "@shared/types/database.types";

type WorkerIdentityBarProps = {
  profile: Profile | null;
  onChangeLocation: (value: LocationValue) => Promise<unknown>;
  right?: React.ReactNode;
};

export function WorkerIdentityBar({
  profile,
  onChangeLocation,
  right,
}: WorkerIdentityBarProps) {
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
          {profile ? (
            <EditableLocationRow
              className="mt-0.5"
              address={profile.address}
              currentValue={
                profile.address && profile.lat != null && profile.lng != null
                  ? {
                      address: profile.address,
                      city: profile.city,
                      lat: profile.lat,
                      lng: profile.lng,
                    }
                  : undefined
              }
              onChangeLocation={onChangeLocation}
            />
          ) : null}
        </View>
      </View>
      {right}
    </View>
  );
}
