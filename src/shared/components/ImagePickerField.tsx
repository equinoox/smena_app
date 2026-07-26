// ImagePickerField — tappable placeholder row that opens ImagePickerModal; shows the
// current image (freshly picked local file, or an existing remote one) once set.
import { Image as ImageIcon } from "phosphor-react-native";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { ImagePickerModal } from "@shared/components/ImagePickerModal";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";

type ImagePickerFieldProps = {
  value?: string;
  existingUri?: string | null;
  onChange: (localUri: string) => void;
  label: string;
  recommendedSize: string;
  aspect?: [number, number];
  wide?: boolean;
};

export function ImagePickerField({
  value,
  existingUri,
  onChange,
  label,
  recommendedSize,
  aspect = [1, 1],
  wide = false,
}: ImagePickerFieldProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const displayUri = value ?? existingUri ?? null;
  const boxSize = wide ? "h-14 w-20" : "h-14 w-14";

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        className="flex-row items-center gap-3"
      >
        {displayUri ? (
          <Image
            source={{ uri: displayUri }}
            className={cn(boxSize, "rounded-input bg-bg-surface-alt")}
          />
        ) : (
          <View
            className={cn(
              boxSize,
              "items-center justify-center rounded-input bg-bg-surface-alt",
            )}
          >
            <ImageIcon size={22} color={colors.textMuted} />
          </View>
        )}
        <View className="gap-1">
          <Text className="font-sans-semibold text-sm text-text-primary">
            {label}
          </Text>
          <Text className="font-sans-bold text-sm text-text-muted">
            {t(displayUri ? "auth.changePhoto" : "auth.addPhoto")}
          </Text>
        </View>
      </Pressable>

      <ImagePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={(uri) => {
          onChange(uri);
          setModalVisible(false);
        }}
        title={label}
        recommendedSize={recommendedSize}
        aspect={aspect}
      />
    </>
  );
}
