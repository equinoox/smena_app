// ImagePickerModal — pick-from-device flow: a note on recommended image dimensions, a
// "choose from device" button, and a live preview once an image is picked.
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
  // Launching the system picker/cropper starts a separate Activity on Android, which
  // pauses the host Activity and tears down our native Modal window. If the Modal stays
  // "visible" the whole time, RN never re-issues it on return and the modal appears to
  // vanish entirely. Hiding it for the duration of the pick and reopening it with the
  // result keeps the native Modal window from being orphaned by that Activity switch.
  const [isPicking, setIsPicking] = useState(false);

  const close = () => {
    setPickedUri(null);
    onClose();
  };

  const pickImage = async () => {
    setIsPicking(true);
    try {
      // Load the native package only when it is actually used. This keeps an old
      // Expo Go/development-client binary from breaking every route at startup.
      // A freshly built SDK 57 binary contains ExponentImagePicker.
      // Metro's dynamic import wraps CommonJS modules in `default` on Android,
      // while a deferred require returns the actual named-export object.
      const ExpoImagePicker =
        require("expo-image-picker") as typeof import("expo-image-picker");

      // SDK 57 uses the system photo picker, so opening the image library does
      // not require a separate media-library permission request.
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPickedUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("[Image picker error]", error);
      toast.error(t("imagePicker.unavailable"));
    } finally {
      setIsPicking(false);
    }
  };

  const confirm = () => {
    if (!pickedUri) return;
    onConfirm(pickedUri);
    setPickedUri(null);
  };

  return (
    <Modal visible={visible && !isPicking} onClose={close} title={title}>
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
