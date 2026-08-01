// InfoCard — small icon + label + value tile, used in detail screens (listing/worker).
// Becomes a Pressable when onPress is given (e.g. location -> view on map), otherwise a
// plain View, so unrelated call sites (pay, working hours) stay non-interactive.
import { Pressable, Text, View } from "react-native";

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
};

export function InfoCard({ icon, label, value, onPress }: InfoCardProps) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress}
      className="flex-1 rounded-input border border-border-default bg-bg-surface p-3"
    >
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="font-sans-medium text-xs text-text-tertiary">
          {label}
        </Text>
      </View>
      <Text className="mt-1 font-sans-bold text-base text-text-primary" numberOfLines={1}>
        {value}
      </Text>
    </Container>
  );
}
