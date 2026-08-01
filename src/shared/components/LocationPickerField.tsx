// LocationPickerField — tappable placeholder row (styled like Input.tsx) that opens
// LocationPickerModal; shows the resolved address once a location is picked.
// Mirrors ImagePickerField's value/onChange + modal-on-press pattern.
import { MapPin } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LocationPickerModal } from "@shared/components/LocationPickerModal";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { cn } from "@shared/lib/cn";
import type { LocationValue } from "@shared/types/location.types";

type LocationPickerFieldProps = {
  value?: LocationValue;
  onChange: (value: LocationValue) => void;
  label: string;
  placeholder: string;
  error?: string;
};

export function LocationPickerField({
  value,
  onChange,
  label,
  placeholder,
  error,
}: LocationPickerFieldProps) {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="gap-1.5 self-stretch">
      <Text className="font-sans-medium text-sm text-text-tertiary">
        {label}
      </Text>

      <Pressable
        onPress={() => setModalVisible(true)}
        className={cn(
          "h-12 flex-row items-center gap-2 rounded-input border bg-bg-surface px-3",
          error ? "border-warning" : "border-border-default",
        )}
      >
        <MapPin size={18} color={colors.textMuted} />
        <Text
          className={cn(
            "flex-1 font-sans text-base",
            value ? "text-text-primary" : "text-text-muted",
          )}
          numberOfLines={1}
        >
          {value?.address ?? placeholder}
        </Text>
      </Pressable>

      {error ? (
        <Text className="font-sans text-xs text-warning">{error}</Text>
      ) : null}

      <LocationPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={(next) => {
          onChange(next);
          setModalVisible(false);
        }}
        initialValue={value}
      />
    </View>
  );
}
