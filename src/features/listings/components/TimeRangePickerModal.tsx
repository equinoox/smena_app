// TimeRangePickerModal — lightweight custom "from hour / to hour" picker, no native dependency.
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Modal } from "@shared/components/Modal";
import { useTranslation, type Language } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";
import { formatHour } from "@shared/lib/format";

const HOURS = Array.from({ length: 25 }, (_, i) => i); // 0..24

type TimeRangePickerModalProps = {
  visible: boolean;
  fromHour: number | null;
  toHour: number | null;
  onApply: (fromHour: number, toHour: number) => void;
  onClose: () => void;
};

function HourColumn({
  label,
  value,
  onChange,
  language,
}: {
  label: string;
  value: number;
  onChange: (h: number) => void;
  language: Language;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-2 font-sans-medium text-sm text-text-tertiary">{label}</Text>
      <ScrollView className="max-h-56">
        {HOURS.map((h) => (
          <Pressable
            key={h}
            onPress={() => onChange(h)}
            className={cn("rounded-input px-3 py-2", value === h && "bg-bg-surface-alt")}
          >
            <Text
              className={cn(
                "font-sans-semibold text-base",
                value === h ? "text-brand" : "text-text-primary",
              )}
            >
              {formatHour(h, language)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export function TimeRangePickerModal({
  visible,
  fromHour,
  toHour,
  onApply,
  onClose,
}: TimeRangePickerModalProps) {
  const { t, language } = useTranslation();
  const [from, setFrom] = useState(fromHour ?? 9);
  const [to, setTo] = useState(toHour ?? 17);

  // Re-seed from current values each time the modal opens.
  useEffect(() => {
    if (visible) {
      setFrom(fromHour ?? 9);
      setTo(toHour ?? 17);
    }
  }, [visible, fromHour, toHour]);

  return (
    <Modal visible={visible} onClose={onClose} title={t("createListing.selectTime")}>
      <View className="flex-row gap-3">
        <HourColumn
          label={t("createListing.from")}
          value={from}
          onChange={setFrom}
          language={language}
        />
        <HourColumn
          label={t("createListing.to")}
          value={to}
          onChange={setTo}
          language={language}
        />
      </View>
      <View className="mt-4">
        <Button
          label={t("common.confirm")}
          onPress={() => {
            onApply(from, to);
            onClose();
          }}
        />
      </View>
    </Modal>
  );
}
