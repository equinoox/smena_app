// ImagePickerModal — pick-from-device flow: a note on recommended image dimensions, a
// "choose from device" button, and a live preview once an image is picked.
import * as ExpoImagePicker from "expo-image-picker";
import { Image as ImageIcon, UploadSimple, WarningCircle } from "phosphor-react-native";
import { useState } from "react";
import { Image, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Modal } from "@shared/components/Modal";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useToast } from "@shared/hooks/useToast";
import { useTranslation } from "@shared/i18n/I18nProvider";

type ImagePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (localUri: string) => void;
  title: string;
  recommendedSize: string;
  aspect?: [number, number];
};

export function ImagePickerModal({
  visible,
  onClose,
  onConfirm,
  title,
  recommendedSize,
  aspect = [1, 1],
}: ImagePickerModalProps) {
  const colors = useThemeColors();
  const toast = useToast();
  const { t } = useTranslation();
  const [pickedUri, setPickedUri] = useState<string | null>(null);

  const close = () => {
    setPickedUri(null);
    onClose();
  };

  const pickImage = async () => {
    const permission = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.error(t("imagePicker.permissionDenied"));
      return;
    }

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedUri(result.assets[0].uri);
    }
  };

  const confirm = () => {
    if (!pickedUri) return;
    onConfirm(pickedUri);
    setPickedUri(null);
  };

  return (
    <Modal visible={visible} onClose={close} title={title}>
      <View className="gap-4">
        <View
          className="w-full items-center justify-center overflow-hidden rounded-input bg-bg-surface-alt"
          style={{ aspectRatio: aspect[0] / aspect[1] }}
        >
          {pickedUri ? (
            <Image
              source={{ uri: pickedUri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <ImageIcon size={32} color={colors.textMuted} />
          )}
        </View>

        <View className="flex-row items-start gap-2 rounded-input border border-warning bg-warning-bg px-3 py-2.5">
          <WarningCircle size={16} weight="fill" color={colors.warning} />
          <Text className="flex-1 font-sans-medium text-xs text-warning">
            {recommendedSize}
          </Text>
        </View>

        <Button
          label={t(
            pickedUri ? "imagePicker.chooseDifferent" : "imagePicker.chooseFromDevice",
          )}
          variant={pickedUri ? "secondary" : "primary"}
          onPress={pickImage}
          leftIcon={
            <UploadSimple
              size={18}
              weight="bold"
              color={pickedUri ? colors.textPrimary : colors.onBrand}
            />
          }
        />

        {pickedUri ? (
          <Button label={t("imagePicker.usePhoto")} onPress={confirm} />
        ) : null}
      </View>
    </Modal>
  );
}
