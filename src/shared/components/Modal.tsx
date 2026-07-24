// Modal — centered dialog over a dimmed backdrop. Base for ConfirmationModal and sheets.
import { Modal as RNModal, Pressable, Text, View } from "react-native";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/60 px-6"
      >
        {/* Stop propagation so taps inside the card don't dismiss. */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-card-lg border border-border-default bg-bg-surface p-5"
        >
          {title ? (
            <Text className="mb-2 font-sans-bold text-lg text-text-primary">
              {title}
            </Text>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
