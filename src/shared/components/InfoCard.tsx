// InfoCard — small icon + label + value tile, used in detail screens (listing/worker).
import { Text, View } from "react-native";

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

export function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <View className="flex-1 rounded-input border border-border-default bg-bg-surface p-3">
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="font-sans-medium text-xs text-text-tertiary">
          {label}
        </Text>
      </View>
      <Text className="mt-1 font-sans-bold text-base text-text-primary" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
