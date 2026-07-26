// WorkerRow — compact identity row for a worker (avatar, name, city + roles), tappable
// to open their detail screen. Optional trailing accessory (badge, status, etc).
import { useRouter } from "expo-router";
import { MapPin } from "phosphor-react-native";
import { Text, View } from "react-native";
import { Avatar } from "@shared/components/Avatar";
import { Card } from "@shared/components/Card";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import type { Profile } from "@shared/types/database.types";

type WorkerRowProps = {
  worker: Profile;
  trailing?: React.ReactNode;
};

export function WorkerRow({ worker, trailing }: WorkerRowProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const roleLabels = worker.worker_roles
    .map((role) => t(`roles.${role}` as TranslationKey))
    .join(" · ");
  const metaLine = [worker.city, roleLabels].filter(Boolean).join(" · ");

  return (
    <Card
      onPress={() =>
        router.push({ pathname: "/worker/[id]", params: { id: worker.id } })
      }
      className="p-3"
    >
      <View className="flex-row items-center gap-3">
        <Avatar uri={worker.avatar_url} name={worker.full_name} size={44} />
        <View className="min-w-0 flex-1">
          <Text
            className="font-sans-bold text-[15px] text-text-primary"
            numberOfLines={1}
          >
            {worker.full_name ?? ""}
          </Text>
          {metaLine ? (
            <View className="mt-1 flex-row items-center gap-1">
              <MapPin size={13} color={colors.textMuted} />
              <Text
                className="font-sans-semibold text-xs text-text-tertiary"
                numberOfLines={1}
              >
                {metaLine}
              </Text>
            </View>
          ) : null}
        </View>
        {trailing}
      </View>
    </Card>
  );
}
