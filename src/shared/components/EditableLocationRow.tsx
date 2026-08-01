// EditableLocationRow — tappable address line (map pin + text) used in identity headers.
// Tapping opens the map picker; picking a new spot asks for confirmation before the
// caller's mutation actually runs (replacing a worker's/venue's location is a real change,
// not a casual edit). Presentational — the caller supplies how the value gets persisted.
import { MapPin } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text } from "react-native";
import { ConfirmationModal } from "@shared/components/ConfirmationModal";
import { LocationPickerModal } from "@shared/components/LocationPickerModal";
import { useThemeColors } from "@shared/hooks/useThemeColors";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import type { LocationValue } from "@shared/types/location.types";

// Android crashes if a second native <Modal> starts mounting while another is still
// tearing down — wait for the picker's close animation to finish before opening the
// confirmation modal, instead of flipping both visibilities in the same tick.
const MODAL_HANDOFF_DELAY_MS = 350;

type EditableLocationRowProps = {
  address: string | null;
  currentValue?: LocationValue;
  onChangeLocation: (value: LocationValue) => Promise<unknown>;
  className?: string;
  textClassName?: string;
  iconSize?: number;
};

export function EditableLocationRow({
  address,
  currentValue,
  onChangeLocation,
  className,
  textClassName = "font-sans-semibold text-xs text-brand",
  iconSize = 13,
}: EditableLocationRowProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<LocationValue | null>(null);
  const [saving, setSaving] = useState(false);
  const handoffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (handoffTimer.current) clearTimeout(handoffTimer.current);
    };
  }, []);

  const confirmChange = () => {
    if (!pendingLocation) return;
    setSaving(true);
    onChangeLocation(pendingLocation)
      .then(() => setPendingLocation(null))
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <>
      <Pressable
        onPress={() => setPickerVisible(true)}
        hitSlop={6}
        className={cn("flex-row items-center gap-1", className)}
      >
        <MapPin size={iconSize} weight="fill" color={colors.brand} />
        <Text className={textClassName} numberOfLines={1}>
          {address ?? t("location.setLocation")}
        </Text>
      </Pressable>

      <LocationPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={(value) => {
          setPickerVisible(false);
          if (handoffTimer.current) clearTimeout(handoffTimer.current);
          handoffTimer.current = setTimeout(
            () => setPendingLocation(value),
            MODAL_HANDOFF_DELAY_MS,
          );
        }}
        initialValue={currentValue}
      />

      <ConfirmationModal
        visible={!!pendingLocation}
        title={t("location.changeTitle")}
        message={t("location.changeMessage")}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
        loading={saving}
        onConfirm={confirmChange}
        onCancel={() => setPendingLocation(null)}
      />
    </>
  );
}
