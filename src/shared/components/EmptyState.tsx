// EmptyState — centered icon + title + description with an optional action. Reused across lists.
import { Text, View } from "react-native";
import { Button } from "@shared/components/Button";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {icon ? (
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-bg-icon-tint">
          {icon}
        </View>
      ) : null}
      <Text className="text-center font-sans-bold text-lg text-text-primary">
        {title}
      </Text>
      {description ? (
        <Text className="mt-1.5 text-center font-sans text-sm text-text-tertiary">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-5">
          <Button label={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}
