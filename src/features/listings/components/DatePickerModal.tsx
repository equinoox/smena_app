// DatePickerModal — lightweight custom date picker (next 30 days), no native dependency.
import { Pressable, ScrollView, Text } from "react-native";
import { Modal } from "@shared/components/Modal";
import { useTranslation } from "@shared/i18n/I18nProvider";
import { cn } from "@shared/lib/cn";

const MONTHS: Record<"sr" | "en", string[]> = {
  sr: ["jan", "feb", "mart", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export function formatShortDate(date: Date, language: "sr" | "en"): string {
  return `${date.getDate()}. ${MONTHS[language][date.getMonth()]}`;
}

type DatePickerModalProps = {
  visible: boolean;
  value: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
};

export function DatePickerModal({
  visible,
  value,
  onSelect,
  onClose,
}: DatePickerModalProps) {
  const { t, language } = useTranslation();

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <Modal visible={visible} onClose={onClose} title={t("createListing.selectDate")}>
      <ScrollView className="max-h-80">
        {days.map((d) => {
          const selected = value?.toDateString() === d.toDateString();
          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => {
                onSelect(d);
                onClose();
              }}
              className={cn("rounded-input px-3 py-3", selected && "bg-bg-surface-alt")}
            >
              <Text
                className={cn(
                  "font-sans-semibold text-base",
                  selected ? "text-brand" : "text-text-primary",
                )}
              >
                {formatShortDate(d, language)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Modal>
  );
}
