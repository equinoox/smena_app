// RoleCard — tap-to-proceed worker/venue option on onboarding (icon, text, arrow).
import { ArrowRight } from "phosphor-react-native";
import { Text, View } from "react-native";
import { Card } from "@shared/components/Card";
import { useThemeColors } from "@shared/hooks/useThemeColors";

type RoleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
};

export function RoleCard({ icon, title, description, onPress }: RoleCardProps) {
  const colors = useThemeColors();
  return (
    <Card onPress={onPress}>
      <View className="flex-row items-center gap-4">
        <View className="h-[52px] w-[52px] items-center justify-center rounded-input bg-bg-icon-tint">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="font-sans-bold text-[17px] text-text-primary">
            {title}
          </Text>
          <Text className="mt-0.5 font-sans-medium text-sm text-text-tertiary">
            {description}
          </Text>
        </View>
        <ArrowRight size={20} weight="bold" color={colors.textMuted} />
      </View>
    </Card>
  );
}
