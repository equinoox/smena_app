// ConfirmationModal — title + message with confirm/cancel actions. Built on Modal + Button.
import { Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Modal } from "@shared/components/Modal";

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal visible={visible} onClose={onCancel} title={title}>
      {message ? (
        <Text className="mb-5 font-sans text-base text-text-secondary">
          {message}
        </Text>
      ) : null}
      <View className="gap-2">
        <Button
          label={confirmLabel}
          variant={destructive ? "danger" : "primary"}
          loading={loading}
          onPress={onConfirm}
        />
        <Button label={cancelLabel} variant="ghost" onPress={onCancel} />
      </View>
    </Modal>
  );
}
