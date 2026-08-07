// WorkersFilterModal — venue-facing filter sheet for the "browse all workers" screen:
// position, experience level, and proximity. All three are applied client-side by the
// caller (WorkersScreen) since the dataset is small/unpaginated and there's no PostGIS.
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "@shared/components/Button";
import { Chip } from "@shared/components/Chip";
import { ChipSlider } from "@shared/components/ChipSlider";
import { DistanceFilterChips } from "@shared/components/DistanceFilterChips";
import { Modal } from "@shared/components/Modal";
import { useTranslation, type TranslationKey } from "@shared/i18n/I18nProvider";
import { EXPERIENCE_LEVELS, WORKER_ROLES } from "@shared/lib/roleIcon";
import { useResponsive } from "@shared/lib/responsive";
import type { ExperienceLevel, WorkerRole } from "@shared/types/database.types";

export type WorkersFilterValues = {
  role: WorkerRole | undefined;
  experienceLevel: ExperienceLevel | undefined;
  maxDistanceKm: number | null;
};

export const DEFAULT_WORKERS_FILTERS: WorkersFilterValues = {
  role: undefined,
  experienceLevel: undefined,
  maxDistanceKm: null,
};

type WorkersFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  filters: WorkersFilterValues;
  onApply: (filters: WorkersFilterValues) => void;
};

export function WorkersFilterModal({
  visible,
  onClose,
  filters,
  onApply,
}: WorkersFilterModalProps) {
  const { t } = useTranslation();
  const { height } = useResponsive();
  const [draft, setDraft] = useState(filters);

  // Re-seed the draft from the currently-applied filters each time the sheet opens.
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  return (
    <Modal visible={visible} onClose={onClose} title={t("workers.filtersTitle")}>
      <ScrollView style={{ maxHeight: height * 0.6 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-text-tertiary">
              {t("auth.position")}
            </Text>
            <ChipSlider>
              <Chip
                label={t("listings.filterAll")}
                variant={!draft.role ? "active" : "neutral"}
                onPress={() => setDraft({ ...draft, role: undefined })}
              />
              {WORKER_ROLES.map((role) => (
                <Chip
                  key={role}
                  label={t(`roles.${role}` as TranslationKey)}
                  variant={draft.role === role ? "active" : "neutral"}
                  onPress={() => setDraft({ ...draft, role })}
                />
              ))}
            </ChipSlider>
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-text-tertiary">
              {t("workers.experience")}
            </Text>
            <ChipSlider>
              <Chip
                label={t("listings.filterAll")}
                variant={!draft.experienceLevel ? "active" : "neutral"}
                onPress={() => setDraft({ ...draft, experienceLevel: undefined })}
              />
              {EXPERIENCE_LEVELS.map((level) => (
                <Chip
                  key={level}
                  label={t(`experience.${level}` as TranslationKey)}
                  variant={draft.experienceLevel === level ? "active" : "neutral"}
                  onPress={() => setDraft({ ...draft, experienceLevel: level })}
                />
              ))}
            </ChipSlider>
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-text-tertiary">
              {t("listings.distance")}
            </Text>
            <DistanceFilterChips
              value={draft.maxDistanceKm}
              onChange={(maxDistanceKm) => setDraft({ ...draft, maxDistanceKm })}
            />
          </View>

          <View className="mt-2 flex-row gap-3">
            <View className="flex-1">
              <Button
                label={t("common.reset")}
                variant="secondary"
                onPress={() => {
                  setDraft(DEFAULT_WORKERS_FILTERS);
                  onApply(DEFAULT_WORKERS_FILTERS);
                  onClose();
                }}
              />
            </View>
            <View className="flex-1">
              <Button
                label={t("listings.applyFilters")}
                onPress={() => {
                  onApply(draft);
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
